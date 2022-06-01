import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LnurlService from 'App/Services/LnurlService'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
import Utils from 'App/Utils'
import Domain from 'App/Models/Domain'
import SseLoginService from 'App/Services/SseLoginService'
import Encryption from '@ioc:Adonis/Core/Encryption'
import RefreshTokenService from 'App/Services/RefreshTokenService'
import JwtService from 'App/Services/JwtService'

export default class AuthController {
  public async lnurlChallenge(ctx: HttpContextContract) {
    try {
      const { tag, k1, sig, key } = ctx.request.qs()
      if (tag !== 'login') {
        return ctx.response.send({ status: 'ERROR', reason: 'Not a login request' })
      }
      const result = LnurlService.verifySig(sig, k1, key)
      if (!result) {
        return ctx.response.send({ status: 'ERROR', reason: 'Bad signature' })
      }

      let appUrl = Env.get('APP_URL')
      if (Utils.isExternal(Utils.getHost(ctx, false))) {
        const externalUrl = Utils.getHost(ctx, true)
        // Check the domain exists and is configured
        await Domain.query().where('zerologin_url', Utils.removeProtocol(externalUrl)).firstOrFail()
        appUrl = externalUrl
      } else {
        let user = await User.query().where('pub_key', key).first()
        if (user === null) {
          await User.create({ pubKey: key })
        }
      }

      const callbackRoute = Route.makeSignedUrl(
        'callback',
        {
          key,
          k1,
        },
        {
          expiresIn: '1m',
        }
      )

      SseLoginService.emit('loggedin', {
        message: 'loggedin',
        key,
        k1,
        sig,
        callback: appUrl + callbackRoute,
      })

      return ctx.response.send({ status: 'OK' })
    } catch (error) {
      return ctx.response.send({ status: 'ERROR', reason: error.message })
    }
  }

  public async callback(ctx: HttpContextContract) {
    if (!ctx.request.hasValidSignature()) {
      return 'Login failed'
    }

    const { k1, key } = ctx.request.params()

    let hostDomain = Utils.getHost(ctx, true)
    let jwtSecret = Env.get('JWT_SECRET')

    if (Utils.isExternal(hostDomain)) {
      const externalUrl = Utils.getHost(ctx, false)
      // Check the domain exists and is configured
      const domain = await Domain.query().where('zerologin_url', externalUrl).firstOrFail()
      const decryptedJwtSecret: string | null = Encryption.decrypt(domain.jwtSecret)
      if (decryptedJwtSecret) {
        jwtSecret = decryptedJwtSecret
      }
      else {
        return ctx.response.unprocessableEntity()
      }
      hostDomain = 'https://' + domain.rootUrl

      const domainUser = await domain.related('domainUsers').firstOrCreate({
        pubKey: key
      })

      const refreshToken = await RefreshTokenService.generateToken()
      await domainUser.related('refreshTokens').create(refreshToken)
      ctx.response.append('set-cookie', RefreshTokenService.getCookie(refreshToken.token, hostDomain))
    }

    const jwt = await JwtService.generateToken(key, jwtSecret)

    const domain = Utils.removeProtocol(hostDomain).split(':')[0]
    ctx.response.append('set-cookie', JwtService.getCookie(jwt, domain))

    ctx.response.redirect(hostDomain)
    LnurlService.removeHash(LnurlService.createHash(k1))
  }

  public async sseLnurl(ctx: HttpContextContract) {
    const { response, request } = ctx
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    }
    response.response.writeHead(200, headers)

    const hostWithProtocol = Utils.getHost(ctx, true)
    const hostWithoutProtocol = Utils.getHost(ctx, false)
    const rootDomain = Utils.getRootDomain(hostWithProtocol)

    let domain = rootDomain
    if (Utils.isExternal(hostWithoutProtocol)) {
      const externalDomain = await Domain.query().where('zerologin_url', rootDomain).firstOrFail()
      domain = externalDomain.zerologinUrl
    }

    const lnurlChallenge = LnurlService.generateNewUrl(hostWithProtocol)

    response.response.write(
      `data: ${JSON.stringify({ message: 'challenge', domain, ...lnurlChallenge })}\n\n`
    )

    const secret = lnurlChallenge.secret
    SseLoginService.add(secret, response)
    request.request.on('close', () => {
      LnurlService.removeHash(LnurlService.createHash(secret))
      SseLoginService.delete(secret)
    })
  }

  public async logout(ctx: HttpContextContract) {
    let hostDomain = Utils.getHost(ctx, true)
    const domain = Utils.removeProtocol(hostDomain).split(':')[0]
    ctx.response.append('set-cookie', `jwt=; Max-Age=0; Domain=${domain}; Path=/; HttpOnly; Secure`)
    ctx.response.redirect('/')
  }

}

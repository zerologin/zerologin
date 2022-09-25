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
      let callbackRouteName = 'callback_internal'
      const { publicId } = ctx.request.qs()

      if (Utils.isExternal(ctx)) {
        // Check the domain exists and is configured
        const domain = await Domain.query().where('public_id', publicId).firstOrFail()
        appUrl = ctx.request.protocol() + '://' + domain.zerologinUrl
        callbackRouteName = 'callback'
      } else {
        let user = await User.query().where('pub_key', key).first()
        if (user === null) {
          await User.create({ pubKey: key })
        }
      }

      let callbackRoute = Route.makeSignedUrl(
        callbackRouteName,
        {
          key,
          k1,
          publicId
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

    const { k1, key, publicId } = ctx.request.params()

    let hostDomain = Utils.getHost(ctx, true)
    let jwtSecret = Env.get('JWT_SECRET')

    let refreshTokenString: string = ''
    if (Utils.isExternal(ctx)) {
      // Check the domain exists and is configured
      const domain = await Domain.query().where('public_id', publicId).firstOrFail()
      const decryptedJwtSecret: string | null = Encryption.decrypt(domain.jwtSecret)
      if (decryptedJwtSecret) {
        jwtSecret = decryptedJwtSecret
      } else {
        return ctx.response.unprocessableEntity()
      }
      hostDomain = ctx.request.protocol() + '://' + domain.rootUrl

      const domainUser = await domain.related('domainUsers').firstOrCreate({
        pubKey: key,
      })

      const refreshToken = await RefreshTokenService.generateToken()
      await domainUser.related('refreshTokens').create(refreshToken)

      refreshTokenString = refreshToken.token

      ctx.response.append(
        'set-cookie',
        RefreshTokenService.getCookie(refreshToken.token, hostDomain)
      )
    }

    const jwt = await JwtService.generateToken(key, jwtSecret)
    const decoded = JwtService.decode(jwt)

    const domain = Utils.removeProtocol(hostDomain).split(':')[0]
    ctx.response.append('set-cookie', JwtService.getCookie(jwt, domain))

    LnurlService.removeHash(LnurlService.createHash(k1))

    return { pubkey: decoded.pubKey, jwt, refreshToken: refreshTokenString }
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

    const host = Utils.getHost(ctx, true)
    const rootDomain = Utils.getRootDomain(host)

    let domain = host
    let urlSuffix = '/api/internal'

    const { publicId } = ctx.request.qs()
    if (Utils.isExternal(ctx)) {
      const externalDomain = await Domain.query().where('public_id', publicId).firstOrFail()
      domain = ctx.request.protocol() + '://' + externalDomain.zerologinUrl
      urlSuffix = '/api/v1'
    }

    const lnurlChallenge = LnurlService.generateNewUrl(domain + urlSuffix, publicId)

    response.response.write(
      `data: ${JSON.stringify({ message: 'challenge', rootDomain, ...lnurlChallenge })}\n\n`
    )

    const secret = lnurlChallenge.secret
    SseLoginService.add(secret, response)
    request.request.on('close', () => {
      LnurlService.removeHash(LnurlService.createHash(secret))
      SseLoginService.delete(secret)
    })
  }

  public async logout(ctx: HttpContextContract) {
    let hostDomain = Utils.getRootDomain(Utils.getHost(ctx, true))
    const domain = Utils.removeProtocol(hostDomain).split(':')[0]
    
    ctx.response.append('set-cookie', `jwt=; Max-Age=0; Domain=${domain}; Path=/; HttpOnly; Secure`)

    if (!Utils.isExternal(ctx)) {
      ctx.response.redirect('/')
    } else {
      return true
    }
  }
}

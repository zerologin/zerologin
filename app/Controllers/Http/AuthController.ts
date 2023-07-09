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

    let hostDomain = Utils.getZerologinHost(true)

    const result = { pubkey: '', jwt: '', refreshToken: '' }

    if (Utils.isExternal(ctx)) {
      // Check the domain exists and is configured
      const domain = await Domain.query().where('public_id', publicId).firstOrFail()
      const decryptedJwtSecret: string | null = Encryption.decrypt(domain.jwtSecret)
      if (!decryptedJwtSecret) {
        return ctx.response.unprocessableEntity()
      }

      // Creating JWT
      const jwt = await JwtService.generateToken({ pubKey: key }, decryptedJwtSecret)

      // Creating Refresh token
      const domainUser = await domain.related('domainUsers').firstOrCreate({
        pubKey: key,
      })
      const refreshToken = await RefreshTokenService.generateToken()
      await domainUser.related('refreshTokens').create(refreshToken)

      result.jwt = jwt
      result.pubkey = key
      result.refreshToken = refreshToken.token

      hostDomain = Utils.getProtocol() + domain.rootUrl
      if (domain.issueCookies) {
        // Refresh token
        ctx.response.append(
          'set-cookie',
          RefreshTokenService.getCookie(refreshToken.token, hostDomain, domain.refreshTokenName)
        )

        // JWT token
        ctx.response.append('set-cookie', JwtService.getCookie(jwt, hostDomain, domain.tokenName))
      }

      // Add public id to cookied to be able to identify the domain later
      ctx.response.append('set-cookie', JwtService.getCookie(publicId, hostDomain, Utils.publicIdCookieName))

    } else {
      const jwt = await JwtService.generateToken({ pubKey: key }, Env.get('JWT_SECRET'))
      ctx.response.append('set-cookie', JwtService.getCookie(jwt, hostDomain))
      result.jwt = jwt
      result.pubkey = key
    }

    LnurlService.removeHash(LnurlService.createHash(k1))

    return result
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

    const host = Utils.getZerologinHost(true)
    const rootDomain = Utils.getFQDN(host)

    let domain = host
    let urlSuffix = '/api/internal'

    let useKeyauth = false

    const { publicId } = ctx.request.qs()
    if (Utils.isExternal(ctx)) {
      const externalDomain = await Domain.query().where('public_id', publicId).firstOrFail()
      domain = Utils.getProtocol() + externalDomain.zerologinUrl
      urlSuffix = '/api/v1'
      useKeyauth = externalDomain.isKeyauth
    }

    const lnurlChallenge = LnurlService.generateNewUrl(domain + urlSuffix, publicId, useKeyauth)

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
    if (Utils.isExternal(ctx)) {
      const publicIdCookie = JwtService.getFromCookie(ctx, Utils.publicIdCookieName)
      if (!publicIdCookie) {
        return ctx.response.unauthorized("You don't have the permission to access this page")
      }

      const externalDomain = await Domain.query().where('public_id', publicIdCookie).first()
      if (!externalDomain) {
        return ctx.response.unauthorized("Cannot find the domain configuration associated with this request")
      }

      ctx.response.append('set-cookie', JwtService.getCookie('', externalDomain.rootUrl.split(':')[0], externalDomain.tokenName, 0))
      return true
    }
    else {
      const host = Utils.getZerologinHost(false)
      let hostDomain = Utils.getFQDN(host)
      const domain = hostDomain.split(':')[0]
      ctx.response.append('set-cookie', JwtService.getCookie('', domain, 'jwt', 0))
      ctx.response.redirect('/')
    }
  }
}

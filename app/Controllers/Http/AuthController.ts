import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LnurlService from 'App/Services/LnurlService'
import EventEmitter from 'events'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
import * as jose from 'jose'
import Utils from 'App/Utils'
import Domain from 'App/Models/Domain'

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
        await Domain.query().where('url', Utils.removeProtocol(externalUrl)).firstOrFail()
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

      AuthController.eventEmitter.emit('loggedin', {
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
      jwtSecret = domain.jwtSecret
      hostDomain = 'https://' + domain.rootUrl
    }

    const jwt = await new jose.SignJWT({ pubKey: key })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      //TODO: Set audience, issuer
      .sign(Buffer.from(jwtSecret, 'utf-8'))

    const tenDays = 1000 * 60 * 60 * 24 * 10
    ctx.response.plainCookie('jwt', jwt, {
      secure: true,
      httpOnly: true,
      domain: Utils.removeProtocol(hostDomain).split(':')[0], // Split is for localhost:3333 only
      maxAge: tenDays,
    })
    ctx.response.redirect(hostDomain)
    LnurlService.removeHash(LnurlService.createHash(k1))
  }

  //TODO: There is some memory leaks on this
  private static eventEmitter = new EventEmitter()

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
    request.request.on('close', () => {
      LnurlService.removeHash(LnurlService.createHash(secret))
    })

    AuthController.eventEmitter.on(
      'loggedin',
      (obj: { message: string; k1: string; sig: string; key: string }) => {
        if (obj.k1 === secret) {
          response.response.write(`data: ${JSON.stringify(obj)}\n\n`)
        }
      }
    )
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LnurlService from 'App/Services/LnurlService'
import EventEmitter from 'events'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'

export default class AuthController {
  public async lnurlChallenge({ request, response }: HttpContextContract) {
    try {
      const { tag, k1, sig, key } = request.qs()
      if (tag != 'login') {
        return response.send({ "status": "ERROR", "reason": "Not a login request" })
      }
      const result = LnurlService.verifySig(sig, k1, key)
      if (!result) {
        return response.send({ "status": "ERROR", "reason": "Bad signature" })
      }

      const appUrl = Env.get('APP_URL')
      if (request.host() === appUrl.split('://')[1]) {
        let user = await User.query().where('pub_key', key).first()
        if (user === null) {
          await User.create({ pubKey: key })
        }
      }

      const callbackRoute = Route.makeSignedUrl('callback', {
        key,
        k1
      },
        {
          expiresIn: '1m',
        })

      AuthController.eventEmitter.emit('loggedin', { message: 'loggedin', key, k1, sig, callback: appUrl + callbackRoute })

      return response.send({ "status": "OK" })
    } catch (error) {
      return response.send({ "status": "ERROR", "reason": error.message })
    }
  }

  public async callback({ request, response }: HttpContextContract) {
    if (!request.hasValidSignature()) {
      return 'Login failed'
    }
    const tenDays = 1000 * 60 * 60 * 24 * 10
    const domain = request.host()!.split(':')[0]
    response.plainCookie('hello', JSON.stringify({ hello: 'hi' }), {
      secure: true,
      httpOnly: true,
      domain,
      maxAge: tenDays
    })
    response.redirect(request.protocol() + '://' + request.host()!)
    const { k1 } = request.params()
    LnurlService.removeHash(LnurlService.createHash(k1))
  }

  static eventEmitter = new EventEmitter();

  public async sseLnurl({ response, request }: HttpContextContract) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
    response.response.writeHead(200, headers)

    const lnurlChallenge = LnurlService.generateNewUrl()

    response.response.write(`data: ${JSON.stringify({ message: 'challenge', ...lnurlChallenge })}\n\n`)

    const secret = lnurlChallenge.secret
    request.request.on('close', () => {
      LnurlService.removeHash(LnurlService.createHash(secret))
    });

    AuthController.eventEmitter.on('loggedin', (obj: { message: string, k1: string, sig: string, key: string }) => {
      if (obj.k1 === secret) {
        response.response.write(`data: ${JSON.stringify(obj)}\n\n`)
      }
    })
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LnurlService from 'App/Services/LnurlService'
import EventEmitter from 'events'

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

      AuthController.eventEmitter.emit('loggedin', { message: 'loggedin', key, k1, sig })

      return response.send({ "status": "OK" })
    } catch (error) {
      return response.send({ "status": "ERROR", "reason": error.message })
    }
  }

  public async lnurlLogin({ request, response }: HttpContextContract) {
    const { sig, k1, key } = request.body()
    const result = LnurlService.verifySig(sig, k1, key)
    if (!result) {
      return response.badRequest()
    }

    LnurlService.removeHash(LnurlService.createHash(k1))

    const tenDays = 1000 * 60 * 60 * 24 * 10
    response.cookie('test', 'test', {
      secure: true,
      httpOnly: true,
      domain: 'localhost',
      expires: new Date(),
      maxAge: tenDays
    })
    return response.send('ok')
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
      //Todo LnurlAuth.removeHash()
    });

    AuthController.eventEmitter.on('loggedin', (obj: { message: string, k1: string, sig: string, key: string }) => {
      if (obj.k1 === secret) {
        response.response.write(`data: ${JSON.stringify(obj)}\n\n`)
      }
    })

  }
}

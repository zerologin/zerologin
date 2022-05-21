import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as jose from 'jose'
import Env from '@ioc:Adonis/Core/Env'

export default class Jwt {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const jwtCookie = request.plainCookie('jwt')
    if (!jwtCookie) {
      return response.unauthorized("You don't have the permission to access this page")
    }

    try {
      const { payload, protectedHeader } = await jose.jwtVerify(jwtCookie, Buffer.from(Env.get('JWT_SECRET')), {
        algorithms: ['HS256'],
        //TODO: Make more verification. Issuer, Audience, etc
      })
      console.log(protectedHeader)
      console.log(payload)
    } catch (error) {
      return response.unauthorized("You don't have the permission to access this page")
    }

    await next()
  }
}

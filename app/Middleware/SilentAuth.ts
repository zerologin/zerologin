import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
import JwtService from 'App/Services/JwtService'
import Env from '@ioc:Adonis/Core/Env'

export default class SilentAuthMiddleware {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const jwtCookie = JwtService.getFromCookie(ctx)
    if (!jwtCookie) {
      return await next()
    }

    try {
      let secret = Env.get('JWT_SECRET')
      const payload = await JwtService.verify(jwtCookie, secret)
      ctx.request.user = await UserService.getOrCreate(payload.pubKey)
    } catch (error) {
      // console.log(error)
    }

    await next()
  }
}

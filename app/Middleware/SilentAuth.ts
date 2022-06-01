import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
import JwtService from 'App/Services/JwtService'

export default class SilentAuthMiddleware {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const jwtCookie = JwtService.getFromCookie(ctx)
    if (!jwtCookie) {
      return await next()
    }

    try {
      const payload = await JwtService.verify(jwtCookie)
      ctx.request.user = await UserService.getOrCreate(payload.pubKey)
    } catch (error) {
      // console.log(error)
    }

    await next()
  }
}

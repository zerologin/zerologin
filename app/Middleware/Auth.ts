import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
import JwtService from 'App/Services/JwtService'

export default class Jwt {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const jwtCookie = JwtService.getFromCookie(ctx)
    if (!jwtCookie) {
      return ctx.response.unauthorized("You don't have the permission to access this page")
    }

    try {
      const payload = await JwtService.verify(jwtCookie)
      ctx.request.user = await UserService.getOrCreate(payload.pubKey)
    } catch (error) {
      return ctx.response.unauthorized("You don't have the permission to access this page")
    }

    await next()
  }
}

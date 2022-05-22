import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as jose from 'jose'
import Env from '@ioc:Adonis/Core/Env'
import UserService from 'App/Services/UserService'
import JwtPayload from 'Contracts/jwtPayload'
import JwtService from 'App/Services/JwtService'

export default class Jwt {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const jwtCookie = JwtService.getCookie(ctx)
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

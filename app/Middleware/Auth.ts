import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
import JwtService from 'App/Services/JwtService'
import Utils from 'App/Utils'
import Env from '@ioc:Adonis/Core/Env'
import Domain from 'App/Models/Domain'
import Encryption from '@ioc:Adonis/Core/Encryption'

export default class Jwt {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    try {

      if (Utils.isExternal(ctx)) {
        const host = Utils.getHost(ctx, false)
        const externalDomain = await Domain.query().where('root_url', host).first()

        if (!externalDomain) {
          return ctx.response.badRequest("Can't verify your credentials")
        }

        const jwtCookie = JwtService.getFromCookie(ctx, externalDomain.tokenName)
        if (!jwtCookie) {
          return ctx.response.unauthorized("You don't have the permission to access this page")
        }

        if (externalDomain) {
          const decryptedJwtSecret: string | null = Encryption.decrypt(externalDomain.jwtSecret)
          if (!decryptedJwtSecret) {
            return ctx.response.unprocessableEntity()
          }
          const payload = await JwtService.verify(jwtCookie, decryptedJwtSecret)
          ctx.request.user = await UserService.getOrCreate(payload.pubKey)
        }
      } else {
        const jwtCookie = JwtService.getFromCookie(ctx)
        if (!jwtCookie) {
          return ctx.response.unauthorized("You don't have the permission to access this page")
        }

        let secret = Env.get('JWT_SECRET')

        const payload = await JwtService.verify(jwtCookie, secret)
        ctx.request.user = await UserService.getOrCreate(payload.pubKey)
      }

    } catch (error) {
      return ctx.response.unauthorized("You don't have the permission to access this page")
    }

    await next()
  }
}

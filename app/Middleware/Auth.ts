import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
import JwtService from 'App/Services/JwtService'
import Utils from 'App/Utils'
import Env from '@ioc:Adonis/Core/Env'
import Domain from 'App/Models/Domain'
import Encryption from '@ioc:Adonis/Core/Encryption'
import SigauthDomain from 'App/Models/SigauthDomain'

export default class Jwt {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    try {

      if (Utils.isExternal(ctx)) {
        const publicIdCookie = JwtService.getFromCookie(ctx, Utils.publicIdCookieName)
        if (!publicIdCookie) {
          return ctx.response.unauthorized("You don't have the permission to access this page")
        }

        let tokenName: string | null = null
        let jwtSecret: string | null = null
        const lnurlDomain = await Domain.query().where('public_id', publicIdCookie).first()
        const sigauthDomain = await SigauthDomain.query().where('id', publicIdCookie).first()
        if (lnurlDomain) {
          tokenName = lnurlDomain.tokenName
          jwtSecret = lnurlDomain.jwtSecret
        }
        else if (sigauthDomain) {
          tokenName = sigauthDomain.tokenName
          jwtSecret = sigauthDomain.jwtSecret
        }
        else {
          return ctx.response.unauthorized("Cannot find the domain configuration associated with this request")
        }

        const jwtCookie = JwtService.getFromCookie(ctx, tokenName)
        if (!jwtCookie) {
          return ctx.response.unauthorized("You don't have the permission to access this page")
        }

        const decryptedJwtSecret: string | null = Encryption.decrypt(jwtSecret)
        if (!decryptedJwtSecret) {
          return ctx.response.unprocessableEntity()
        }
        const payload = await JwtService.verify(jwtCookie, decryptedJwtSecret)
        ctx.request.user = await UserService.getOrCreate(payload.pubKey)
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

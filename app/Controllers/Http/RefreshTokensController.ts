import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RefreshToken from 'App/Models/RefreshToken'
import JwtService from 'App/Services/JwtService'
import RefreshTokenService from 'App/Services/RefreshTokenService'
import { DateTime } from 'luxon'
import Encryption from '@ioc:Adonis/Core/Encryption'

export default class RefreshTokensController {
  public async refresh(ctx: HttpContextContract) {
    const refreshTokenCookie = RefreshTokenService.getFromCookie(ctx)

    if (!refreshTokenCookie) {
      return ctx.response.unauthorized('refresh_token cookie is missing')
    }

    // Get refreshToken and associated domainUser
    const refreshToken = await RefreshToken.findByOrFail('token', refreshTokenCookie)
    const domainUser = await refreshToken.related('domainUser').query().firstOrFail()

    // Generate a new refreshToken and save it
    const newRefreshToken = await RefreshTokenService.generateToken()
    await domainUser.related('refreshTokens').create(newRefreshToken)

    // Invalidate the current one
    refreshToken.expiredAt = DateTime.utc()
    refreshToken.replacedBy = newRefreshToken.token
    await refreshToken.save()

    // Get related domain
    const domain = await domainUser.related('domain').query().firstOrFail()

    const secret: string | null = Encryption.decrypt(domain.jwtSecret)
    if (!secret) {
      return ctx.response.unprocessableEntity()
    }

    const jwt = await JwtService.generateToken({ pubKey: domainUser.pubKey }, secret)

    ctx.response.append('set-cookie', JwtService.getCookie(jwt, domain.rootUrl, domain.tokenName))
    ctx.response.append(
      'set-cookie',
      RefreshTokenService.getCookie(newRefreshToken.token, domain.rootUrl, domain.refreshTokenName)
    )
    ctx.response.ok('refresh ok')
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RefreshToken from 'App/Models/RefreshToken'
import crypto from 'crypto'
import { DateTime } from 'luxon'
import { string } from '@ioc:Adonis/Core/Helpers'
import Utils from 'App/Utils'

class RefreshTokenService {
  private static maxAge = '7d'
  public getMaxAgeString() {
    return RefreshTokenService.maxAge
  }
  public getMaxAgeSeconds() {
    return string.toMs(RefreshTokenService.maxAge) / 1000
  }

  public getFromCookie(ctx: HttpContextContract) {
    const cookie = ctx.request.request.headers.cookie
      ?.split('; ')
      .find((c) => c.startsWith('refresh_token='))
    if (cookie) {
      return cookie.split('refresh_token=')[1]
    }
    return null
  }

  public getCookie(token: string, domain: string) {
    const clearedDomain = Utils.removeProtocol(domain).split(':')[0]
    return `refresh_token=${token}; Max-Age=${this.getMaxAgeSeconds()}; Domain=${clearedDomain}; Path=/; HttpOnly; Secure`
  }

  public async generateToken(): Promise<RefreshToken> {
    const randomBytes = await this.getRandomBytes(64)
    const refreshToken = new RefreshToken()
    refreshToken.token = Buffer.from(randomBytes).toString('base64')
    refreshToken.expiredAt = DateTime.utc().plus(this.getMaxAgeSeconds() * 1000)
    return refreshToken
  }

  private async getRandomBytes(byteSize: number = 64): Promise<Buffer> {
    return await new Promise((resolve, reject) => {
      crypto.randomBytes(byteSize, (err, buffer) => {
        if (err) {
          reject(-1)
        }
        resolve(buffer)
      })
    })
  }
}

export default new RefreshTokenService()

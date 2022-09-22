import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import * as jose from 'jose'
import JwtPayload from 'Contracts/jwtPayload'
import { string } from '@ioc:Adonis/Core/Helpers'

class JwtService {
  private static maxAge = '2h'
  public getMaxAgeString() {
    return JwtService.maxAge
  }
  public getMaxAgeSeconds() {
    return string.toMs(JwtService.maxAge) / 1000
  }

  public getFromCookie(ctx: HttpContextContract) {
    const cookie = ctx.request.request.headers.cookie?.split('; ').find((c) => c.startsWith('jwt='))
    if (cookie) {
      return cookie.split('=')[1]
    }
    return null
  }

  public getCookie(token: string, domain: string) {
    return `jwt=${token}; Max-Age=${this.getMaxAgeSeconds()}; Domain=${domain}; Path=/; HttpOnly; Secure`
  }

  public async generateToken(pubKey: string, secret: string) {
    return await new jose.SignJWT({ pubKey })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.getMaxAgeString())
      //TODO: Set audience, issuer
      .sign(Buffer.from(secret, 'utf-8'))
  }

  public async verify(jwt: string): Promise<JwtPayload> {
    const { payload } = await jose.jwtVerify(jwt, Buffer.from(Env.get('JWT_SECRET')), {
      algorithms: ['HS256'],
      //TODO: Make more verification. Issuer, Audience, etc
    })
    return <JwtPayload>payload
  }

  public decode(jwt: string): JwtPayload {
    const decoded = jose.decodeJwt(jwt)
    return <JwtPayload>decoded
  }
}

export default new JwtService()

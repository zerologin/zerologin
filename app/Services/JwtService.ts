import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as jose from 'jose'
import JwtPayload from 'Contracts/jwtPayload'
import { string } from '@ioc:Adonis/Core/Helpers'
import Utils from 'App/Utils'

class JwtService {
  private static maxAge = '2h'
  public getMaxAgeString() {
    return JwtService.maxAge
  }
  public getMaxAgeSeconds() {
    return string.toMs(JwtService.maxAge) / 1000
  }

  public getFromCookie(ctx: HttpContextContract, cookieName: string = 'jwt') {
    const cookie = ctx.request.request.headers.cookie?.split('; ').find((c) => c.startsWith(`${cookieName}=`))
    if (cookie) {
      return cookie.split('=')[1]
    }
    return null
  }

  public getCookie(token: string, domain: string, cookieName: string = 'jwt', age: number = this.getMaxAgeSeconds()) {
    const clearedDomain = Utils.removeProtocol(domain).split(':')[0]
    return `${cookieName}=${token}; Max-Age=${age}; Domain=${clearedDomain}; Path=/; HttpOnly; Secure`
  }

  public async generateToken(payload: JwtPayload, secret: string) {
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.getMaxAgeString())
      //TODO: Set audience, issuer
      .sign(Buffer.from(secret, 'utf-8'))
  }

  public async verify(jwt: string, secret: string): Promise<JwtPayload> {
    const { payload } = await jose.jwtVerify(jwt, Buffer.from(secret), {
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

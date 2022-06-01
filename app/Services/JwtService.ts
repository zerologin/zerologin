import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import * as jose from 'jose'
import JwtPayload from 'Contracts/jwtPayload'
import { string } from '@ioc:Adonis/Core/Helpers'

class JwtService {
  public getFromCookie(ctx: HttpContextContract) {
    const cookie = ctx.request.request.headers.cookie?.split('; ').find(c => c.startsWith('jwt='))
    if (cookie) {
      return cookie.split('=')[1]
    }
    return null
  }

  public getCookie(token: string, domain: string, maxAge: string) {
    const maxAgeNumber = string.toMs(maxAge) / 1000
    return `jwt=${token}; Max-Age=${maxAgeNumber}; Domain=${domain}; Path=/; HttpOnly; Secure`
  }

  public async generateToken(pubKey: string, maxAge: string, secret: string) {
    return await new jose.SignJWT({ pubKey })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(maxAge)
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
}

export default new JwtService()

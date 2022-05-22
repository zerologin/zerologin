import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import * as jose from 'jose'
import JwtPayload from 'Contracts/jwtPayload'

class JwtService {

    public getCookie(ctx: HttpContextContract) {
        return ctx.request.plainCookie('jwt')
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
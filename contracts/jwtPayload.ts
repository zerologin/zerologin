import jose from 'jose'
export default interface JwtPayload extends jose.JWTPayload {
    pubKey: string
}
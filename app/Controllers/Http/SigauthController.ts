import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schnorr } from '@noble/curves/secp256k1'
import SigauthDomain from 'App/Models/SigauthDomain'
import LnurlService from 'App/Services/LnurlService'
import Utils, { Protocols } from 'App/Utils'
import base64url from "base64url"
import NDK from "@nostr-dev-kit/ndk";
import JwtService from 'App/Services/JwtService'
import Encryption from '@ioc:Adonis/Core/Encryption'
import crypto from 'crypto'

const TRANSPORT_WEBRTC = 'webrtc'
const TRANSPORT_REDIRECT = 'redirect'
const TRANSPORT_POLLING = 'polling'
let challenges: Map<string, string> = new Map()

export default class SigauthController {
  public async index(ctx: HttpContextContract) {
    // TODO: Identify domain/who did this request. Then later, verify this is the same person/client that sent the RTC token.
    const { id } = ctx.request.qs()

    if (!id) throw new Error('No publicId provided')

    const sigauthDomain = await SigauthDomain.query().where('id', id).firstOrFail()

    const transports: string[] = []
    if (sigauthDomain.transportWebrtc) transports.push(TRANSPORT_WEBRTC)
    if (sigauthDomain.transportRedirect) transports.push(TRANSPORT_REDIRECT)
    if (sigauthDomain.transportPolling) transports.push(TRANSPORT_POLLING)

    const challenge = LnurlService.generateSecret()


    let appUrl = Utils.getProtocol() + sigauthDomain.zerologinUrl

    const authRequest = {
      id: "",
      challenge,
      callback: appUrl + '/api/v2/sigauth/verify/' + sigauthDomain.id,
      origin: Utils.getFQDN(sigauthDomain.zerologinUrl),
      transports,
      signaling: Utils.switchProtocol(appUrl, Protocols.ws),
    }

    const challengeId = crypto
      .createHash('sha256')
      .update(JSON.stringify({ challenge: authRequest.challenge, callback: authRequest.callback, origin: authRequest.origin, transports: authRequest.transports, signaling: authRequest.signaling }))
      .digest('hex');

    authRequest.id = challengeId

    const authRequestEncoded = base64url.encode(JSON.stringify(authRequest))

    challenges.set(challengeId, authRequestEncoded)

    return { challengeId, challenge: `sigauth:${authRequestEncoded}` }
  }

  public async verify(ctx: HttpContextContract) {
    const { token, sig, redirect } = ctx.request.all()
    const { id: domainId } = ctx.request.params()

    const sigauthDomain = await SigauthDomain.query().where('id', domainId).firstOrFail()

    const authRequest = base64url.decode(token)
    const decodedAuthRequest = JSON.parse(authRequest)

    const existingAuthRequest = challenges.get(decodedAuthRequest.id)
    if (!existingAuthRequest) {
      return ctx.response.forbidden({ error: 'Challenge not found' })
    }
    const decodedExistingAuthRequest = JSON.parse(base64url.decode(existingAuthRequest))
    if (
      decodedAuthRequest.id !== decodedExistingAuthRequest.id ||
      decodedAuthRequest.challenge !== decodedExistingAuthRequest.challenge ||
      decodedAuthRequest.callback !== decodedExistingAuthRequest.callback ||
      decodedAuthRequest.origin !== decodedExistingAuthRequest.origin ||
      decodedAuthRequest.transport !== decodedExistingAuthRequest.transport
    ) {
      return ctx.response.forbidden({ error: 'Challenge has been altered' })
    }

    const message = Buffer.from(`${decodedAuthRequest.challenge}:${decodedAuthRequest.origin}`, 'utf-8').toString('hex')
    const sigValid = schnorr.verify(sig, message, decodedAuthRequest.publicKey)

    let jwt = ''

    if (sigValid) {
      challenges.delete(decodedAuthRequest.id)

      const decryptedJwtSecret: string | null = Encryption.decrypt(sigauthDomain.jwtSecret)
      if (!decryptedJwtSecret) {
        return ctx.response.unprocessableEntity()
      }

      // Nostr DID
      if (decodedAuthRequest.nostr?.relays?.length > 0) {
        const ndk = new NDK({ explicitRelayUrls: decodedAuthRequest.nostr?.relays });
        await ndk.connect();
        const user = ndk.getUser({
          hexpubkey: decodedAuthRequest.publicKey,
        });
        await user.fetchProfile();

        jwt = await JwtService.generateToken({
          pubKey: decodedAuthRequest.publicKey,
          nostr: {
            npub: user.npub,
            ...user.profile,
          }
        },
          decryptedJwtSecret)
      }
      else {
        jwt = await JwtService.generateToken({
          pubKey: decodedAuthRequest.publicKey
        },
          decryptedJwtSecret)
      }

      if (sigauthDomain.issueCookies) {
        const hostDomain = Utils.getRootDomain(sigauthDomain.zerologinUrl)
        ctx.response.append('set-cookie', JwtService.getCookie(jwt, hostDomain, sigauthDomain.tokenName))
      }
      if (redirect && sigauthDomain.transportRedirect && sigauthDomain.redirectUrl) {
        const redirectUrl = new URL(sigauthDomain.redirectUrl)
        redirectUrl.searchParams.append('token', jwt)
        return ctx.response.redirect(redirectUrl.toString())
      }

      return { jwt, pubkey: decodedAuthRequest.publicKey }
    }
    else {
      return ctx.response.forbidden({ error: 'Invalid signature' })
    }
  }
}

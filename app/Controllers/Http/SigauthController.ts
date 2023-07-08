import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schnorr } from '@noble/curves/secp256k1'
import SigauthDomain from 'App/Models/SigauthDomain'
import LnurlService from 'App/Services/LnurlService'
import Utils, { Protocols } from 'App/Utils'
import base64url from "base64url"
import NDK from "@nostr-dev-kit/ndk";
import Env from '@ioc:Adonis/Core/Env'
import JwtService from 'App/Services/JwtService'
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


    let appUrl = ctx.request.protocol() + '://' + sigauthDomain.zerologinUrl

    const result = {
      id: "",
      challenge,
      callback: appUrl + '/api/v2/sigauth/verify',
      origin: Utils.getRootDomain(sigauthDomain.zerologinUrl),
      transports,
      signaling: Utils.switchProtocol(appUrl, Protocols.ws),
    }

    const challengeId = crypto
      .createHash('sha256')
      .update(JSON.stringify({ challenge: result.challenge, callback: result.callback, origin: result.origin, transports: result.transports, signaling: result.signaling }))
      .digest('hex');

    result.id = challengeId

    const challengeEncoded = base64url.encode(JSON.stringify(result))

    challenges.set(challengeId, challengeEncoded)

    return { challengeId, challenge: `sigauth:${challengeEncoded}` }
  }

  public async verify(ctx: HttpContextContract) {
    const { token, sig } = ctx.request.all()
    const challenge = base64url.decode(token)
    const decodedChallenge = JSON.parse(challenge)

    const existingChallenge = challenges.get(decodedChallenge.id)
    if (!existingChallenge) {
      return 'Challenge not found'
    }
    const decodedExistingChallenge = JSON.parse(base64url.decode(existingChallenge))
    if (
      decodedChallenge.id !== decodedExistingChallenge.id ||
      decodedChallenge.challenge !== decodedExistingChallenge.challenge ||
      decodedChallenge.callback !== decodedExistingChallenge.callback ||
      decodedChallenge.origin !== decodedExistingChallenge.origin ||
      decodedChallenge.transport !== decodedExistingChallenge.transport
    ) {
      return 'Challenge has been altered.'
    }

    // TODO Verify challenge?

    const sigValid = schnorr.verify(this.toBufferArray(sig), this.toBufferArray(challenge), this.toBufferArray(decodedChallenge.publicKey))

    if (sigValid) {
      challenges.delete(decodedChallenge.id)

      // Nostr DID
      if (decodedChallenge.nostr?.relays?.length > 0) {
        const ndk = new NDK({ explicitRelayUrls: decodedChallenge.nostr?.relays });
        await ndk.connect();
        const user = ndk.getUser({
          hexpubkey: decodedChallenge.publicKey,
        });
        await user.fetchProfile();

        const jwt = await JwtService.generateToken({
          pubKey: decodedChallenge.publicKey,
          nostr: {
            npub: user.npub,
            ...user.profile,
          }
        },
          Env.get('JWT_SECRET'))

        const hostDomain = Utils.getHost(ctx, true)
        ctx.response.append('set-cookie', JwtService.getCookie(jwt, hostDomain))

        return { jwt, pubkey: decodedChallenge.publicKey }
      }
      else {
        const jwt = await JwtService.generateToken({
          pubKey: decodedChallenge.publicKey
        },
          Env.get('JWT_SECRET'))

        const hostDomain = Utils.getHost(ctx, true)
        ctx.response.append('set-cookie', JwtService.getCookie(jwt, hostDomain))

        return { jwt, pubkey: decodedChallenge.publicKey }
      }
    }
    else {
      return 'Failed'
    }
  }

  // TODO Move to utils
  private toBufferArray(msg: string) {
    return Buffer.from(msg, 'hex')
  }
}

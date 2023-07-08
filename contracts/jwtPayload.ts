import jose from 'jose'
export default interface JwtPayload extends jose.JWTPayload {
  pubKey: string,
  nostr?: NostrJwtPayload;
}

interface NostrJwtPayload {
  npub: string;
  name?: string;
  displayName?: string;
  image?: string;
  banner?: string;
  bio?: string;
  nip05?: string;
  lud06?: string;
  lud16?: string;
  about?: string;
  zapService?: string;
  website?: string;
}

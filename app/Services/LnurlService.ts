import lnurl from 'lnurl'
import crypto from 'crypto'
import * as zlnurl from '@zerologin/lnurl'
// TODO Use @zerologin/lnurl instead of lnurl

class LnurlAuth {
  private _usedHashes: string[] = []

  public generateSecret(): string {
    let secret: string | null = null
    const maxAttempts = 5
    let attempt = 0
    while (secret === null && attempt < maxAttempts) {
      secret = crypto.randomBytes(32).toString('hex')
      const hash = this.createHash(secret)
      if (this.isHashUsed(hash)) {
        secret = null
      }
      attempt++
    }
    if (!secret) {
      const message = 'Too many failed attempts to generate unique secret'
      throw new Error(message)
    }
    return secret
  }

  private isHashUsed(hash: string) {
    return this._usedHashes.some((u) => u === hash)
  }

  private addHash(hash: string) {
    this._usedHashes.push(hash)
  }

  public removeHash(hash: string) {
    this._usedHashes = this._usedHashes.filter((h) => h !== hash)
  }

  public generateNewUrl(hostname: string, publicId?: string, keyauth: boolean = false) {
    const secret = this.generateSecret()
    this.addHash(this.createHash(secret))
    const url = new URL(hostname + '/lnurl')

    url.searchParams.append('tag', 'login')
    url.searchParams.append('k1', secret)

    if (publicId) {
      url.searchParams.append('publicId', publicId)
    }

    const urlString = url.toString()
    const encoded = zlnurl.encode(urlString, keyauth)

    return {
      url: urlString,
      encoded: keyauth ? encoded : encoded.toUpperCase(),
      secret,
    }
  }

  public verifySig(sig: string, k1: string, key: string) {
    if (!lnurl.verifyAuthorizationSignature(sig, k1, key)) {
      const message = 'Signature verification failed'
      throw new Error(message)
    }
    const hash = this.createHash(k1)
    return { key, hash }
  }

  public createHash(data: string | Buffer) {
    if (!(typeof data === 'string' || Buffer.isBuffer(data))) {
      throw new Error(
        JSON.stringify({ status: 'ERROR', reason: 'Secret must be a string or a Buffer' })
      )
    }
    if (typeof data === 'string') {
      data = Buffer.from(data, 'hex')
    }
    return crypto.createHash('sha256').update(data).digest('hex')
  }
}

export default new LnurlAuth()

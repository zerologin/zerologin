import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

class Utils {
  public publicIdCookieName = 'zerologin_public_id'

  public isExternal({ request }: HttpContextContract) {
    return request.parsedUrl.path?.includes('api/v1')
  }

  public getHost({ request }: HttpContextContract, protocol: boolean = false) {
    if (request.headers().origin) {
      const host = request.headers().origin!
      if (protocol) {
        return host
      }
      return this.removeProtocol(host)
    }

    if (protocol) {
      return request.protocol() + '://' + request.host()
    }
    return request.host()!
  }

  public removeProtocol(url: string) {
    if (url.includes('://')) {
      url = url.split('://')[1]
    }
    return url
  }

  public getRootDomain(url: string) {
    //Regex doesn't work without protocol, so add a default one
    if (!url.includes('://')) {
      url = 'http://' + url
    }

    const regex = /^.*:\/\/(?:[wW]{3}\.)?([^:\/]*).*$/gm
    const result = regex.exec(url)
    if (result && result.length > 1) {
      return result[1]
    }
    throw new Error(`Cannot get root domain for "${url}"`)
  }

  // Check url params protocol, http:// or https:// or ws:// or wss:// and switch to the given protocol (http => ws, https => wss)
  public switchProtocol(url: string, protocol: Protocols = Protocols.http) {
    if (url.includes('://')) {
      const urlProtocol = url.split('://')[0]
      if (urlProtocol.includes(Protocols.http)) {
        url = url.replace(Protocols.http, protocol)
      } else if (urlProtocol.includes(Protocols.ws)) {
        url = url.replace(Protocols.ws, protocol)
      }
    }
    else {
      url = protocol + '://' + url
    }
    return url
  }
}

export enum Protocols {
  http = 'http',
  ws = 'ws',
}

export default new Utils()

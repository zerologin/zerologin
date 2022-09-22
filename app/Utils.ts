import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

class Utils {
  public isExternal({ request }: HttpContextContract) {
    return !request.parsedUrl.path?.includes('api/internal')
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
}

export default new Utils()

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

class Utils {
  public isExternal(host: string) {
    return Env.get('APP_URL').split('://')[1] !== this.removeProtocol(host)
  }

  public getHost({ request }: HttpContextContract, protocol: boolean = false) {
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

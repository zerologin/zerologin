import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

class Utils {
  public isExternal(host: string) {
    return Env.get('APP_URL').split('://')[1] !== host
  }

  public getHost({ request }: HttpContextContract) {
    return request.protocol() + '://' + request.host()
  }
}

export default new Utils()

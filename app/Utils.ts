import Env from '@ioc:Adonis/Core/Env'

class Utils {
    public isExternal(host: string){
        return Env.get('APP_URL').split('://')[1] !== host
    }
}

export default new Utils()
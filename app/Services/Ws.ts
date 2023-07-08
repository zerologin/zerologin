import ws from 'ws'
import Server from '@ioc:Adonis/Core/Server'

class Ws {
    public ws: ws.Server
    private booted = false

    public boot() {
        /**
         * Ignore multiple calls to the boot method
         */
        if (this.booted) {
            return
        }

        this.booted = true
        this.ws = new ws.Server({ server: Server.instance! })
    }
}

export default new Ws()
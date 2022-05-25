import EventEmitter from 'events'

class SseLoginService {

    private eventEmitter = new EventEmitter()
    private responses = new Map<string, any>()

    constructor() {
        this.watchResponses()
    }

    public add(secret: string, response: any) {
        this.responses.set(secret, response)
    }

    public delete(secret: string) {
        if (this.responses.has(secret)) {
            this.responses.delete(secret)
        }
    }

    public emit(event: string, payload: { message: string, key: string, k1: string, sig: string, callback: string }) {
        this.eventEmitter.emit(event, payload)
    }

    private watchResponses() {
        this.eventEmitter.on(
            'loggedin',
            (obj: { message: string; k1: string; sig: string; key: string }) => {
                if (this.responses.has(obj.k1)) {
                    this.responses.get(obj.k1).response.write(`data: ${JSON.stringify(obj)}\n\n`)
                    this.responses.delete(obj.k1)
                }
            }
        )
    }
}

export default new SseLoginService()
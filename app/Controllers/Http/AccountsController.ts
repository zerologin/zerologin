import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AccountsController {
    public async index({ response }: HttpContextContract) {
        response.send('Connected')
    }
}

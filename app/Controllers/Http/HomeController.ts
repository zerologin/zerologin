import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class HomeController {
    public async index({ inertia }: HttpContextContract) {
        return inertia.render('Home/Index');
    }
}

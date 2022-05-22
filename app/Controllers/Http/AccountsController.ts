import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DomainService from 'App/Services/DomainService'

export default class AccountsController {
  public async index({ request, inertia }: HttpContextContract) {
    const domains = await DomainService.getAll(request.user)
    return inertia.render('Accounts/Index', { domains })
  }
}

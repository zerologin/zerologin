import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DomainService from 'App/Services/DomainService'
import SigauthDomainService from 'App/Services/SigauthDomainService'

export default class AccountsController {
  public async index({ request, inertia }: HttpContextContract) {
    const domains = await DomainService.getAll(request.user)
    const sigauthDomains = await SigauthDomainService.getAll(request.user)
    return inertia.render('Account/Index', { domains, sigauthDomains })
  }
}

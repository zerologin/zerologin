import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Utils from 'App/Utils'
import Encryption from '@ioc:Adonis/Core/Encryption'
import DomainValidator from 'App/Validators/DomainValidator'

export default class DomainsController {
  public async create({ inertia }: HttpContextContract) {
    return inertia.render('Domain/CreateUpdate')
  }

  public async store({ request, response }: HttpContextContract) {
    const { zerologinUrl, rootUrl, secret, issueCookies, tokenName, refreshTokenName, isKeyauth } = await request.validate(DomainValidator)

    let parsedZerologinUrl = Utils.getRootDomain(zerologinUrl)
    let parsedRootUrl = Utils.getRootDomain(rootUrl)
    const encryptedSecret = Encryption.encrypt(secret)

    await request.user.related('domains').create({
      rootUrl: parsedRootUrl,
      zerologinUrl: parsedZerologinUrl,
      jwtSecret: encryptedSecret,
      issueCookies,
      tokenName,
      refreshTokenName,
      isKeyauth
    })
    response.redirect().toRoute('account_index')
  }

  public async edit({ request, inertia }: HttpContextContract) {
    const { id } = request.params()
    const domain = await request.user.related('domains').query().where('id', id).firstOrFail()
    return inertia.render('Domain/CreateUpdate', {
      domain: { ...domain.serialize(), jwt_secret: Encryption.decrypt(domain.jwtSecret) },
    })
  }

  public async update({ request, response }: HttpContextContract) {
    const { zerologinUrl, rootUrl, secret, issueCookies, tokenName, refreshTokenName, isKeyauth } = await request.validate(DomainValidator)

    const { id } = request.params()
    const domain = await request.user.related('domains').query().where('id', id).firstOrFail()

    let parsedZerologinUrl = Utils.getRootDomain(zerologinUrl)
    let parsedRootUrl = Utils.getRootDomain(rootUrl)
    const encryptedSecret = Encryption.encrypt(secret)

    domain.merge({
      rootUrl: parsedRootUrl,
      zerologinUrl: parsedZerologinUrl,
      jwtSecret: encryptedSecret,
      issueCookies,
      tokenName: tokenName ?? '',
      refreshTokenName: refreshTokenName ?? '',
      isKeyauth
    })
    await domain.save()
    response.redirect().toRoute('account_index')
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params()
    const domain = await request.user.related('domains').query().where('id', id).firstOrFail()
    await domain.delete()
    response.redirect().back()
  }
}

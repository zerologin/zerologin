import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Utils from 'App/Utils'
import Encryption from '@ioc:Adonis/Core/Encryption'
import SigauthDomainValidator from 'App/Validators/SigauthDomainValidator'

export default class SigauthDomainsController {
  public async create({ inertia }: HttpContextContract) {
    return inertia.render('SigauthDomain/CreateUpdate')
  }

  public async store({ request, response }: HttpContextContract) {
    const { zerologinUrl, redirectUrl, secret, issueCookies, tokenName, transportPolling, transportRedirect, transportWebrtc } = await request.validate(SigauthDomainValidator)

    let parsedZerologinUrl = Utils.getRootDomain(zerologinUrl)
    const encryptedSecret = Encryption.encrypt(secret)

    await request.user.related('sigauthDomains').create({
      zerologinUrl: parsedZerologinUrl,
      redirectUrl,
      jwtSecret: encryptedSecret,
      issueCookies,
      tokenName,
      transportWebrtc,
      transportRedirect,
      transportPolling,
    })
    response.redirect().toRoute('account_index')
  }

  public async edit({ request, inertia }: HttpContextContract) {
    const { id } = request.params()
    const domain = await request.user.related('sigauthDomains').query().where('id', id).firstOrFail()
    return inertia.render('SigauthDomain/CreateUpdate', {
      domain: { ...domain.serialize(), jwt_secret: Encryption.decrypt(domain.jwtSecret) },
    })
  }

  public async update({ request, response }: HttpContextContract) {
    const { zerologinUrl, redirectUrl, secret, issueCookies, tokenName, transportPolling, transportRedirect, transportWebrtc } = await request.validate(SigauthDomainValidator)

    const { id } = request.params()
    const domain = await request.user.related('sigauthDomains').query().where('id', id).firstOrFail()

    let parsedZerologinUrl = Utils.getRootDomain(zerologinUrl)
    const encryptedSecret = Encryption.encrypt(secret)

    domain.merge({
      zerologinUrl: parsedZerologinUrl,
      redirectUrl,
      jwtSecret: encryptedSecret,
      issueCookies,
      tokenName: tokenName ?? '',
      transportWebrtc,
      transportRedirect,
      transportPolling,
    })
    await domain.save()
    response.redirect().toRoute('account_index')
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params()
    const domain = await request.user.related('sigauthDomains').query().where('id', id).firstOrFail()
    await domain.delete()
    response.redirect().back()
  }
}

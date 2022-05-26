import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Utils from 'App/Utils'
import Encryption from '@ioc:Adonis/Core/Encryption'

export default class DomainsController {
  public async store({ request, response }: HttpContextContract) {
    const urlSchema = schema.string({ trim: true }, [
      rules.url({
        protocols: ['http', 'https'],
        requireTld: true,
        requireProtocol: false,
        requireHost: true,
        bannedHosts: ['zerologin.co'],
      })])
    const validationSchema = schema.create({
      zerologinUrl: urlSchema,
      rootUrl: urlSchema,
      secret: schema.string({ trim: true }),
    })
    const { zerologinUrl, rootUrl, secret } = await request.validate({
      schema: validationSchema,
      messages: {
        'required': 'The {{ field }} is required',
        'domain.url': 'Root domain must be a valid url',
      },
    })

    let parsedZerologinUrl = Utils.getRootDomain(zerologinUrl)
    let parsedRootUrl = Utils.getRootDomain(rootUrl)
    const encryptedSecret = Encryption.encrypt(secret)

    await request.user.related('domains').create({ rootUrl: parsedRootUrl, zerologinUrl: parsedZerologinUrl, jwtSecret: encryptedSecret })
    response.redirect().back()
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params()
    const domain = await request.user.related('domains').query().where('id', id).firstOrFail()
    await domain.delete()
    response.redirect().back()
  }
}

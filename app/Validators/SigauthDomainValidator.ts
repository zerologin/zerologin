import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class SigauthDomainValidator {
  constructor(protected ctx: HttpContextContract) { }

  private urlSchema = Env.get('NODE_ENV') !== 'production' ?
    schema.string({ trim: true }) :
    schema.string({ trim: true }, [
      rules.url({
        protocols: ['http', 'https'],
        requireTld: true,
        requireProtocol: false,
        requireHost: false,
        bannedHosts: ['zerologin.co'],
      }),
    ])

  public schema = schema.create({
    zerologinUrl: this.urlSchema,
    redirectUrl: this.urlSchema,
    secret: schema.string({ trim: true }),
    issueCookies: schema.boolean(),
    tokenName: schema.string.optional([
      rules.requiredWhen('issueCookies', '=', true),
      rules.trim(),
      rules.escape(),
    ]),
    transportWebrtc: schema.boolean(),
    transportRedirect: schema.boolean(),
    transportPolling: schema.boolean(),
  })

  public messages = {
    'required': 'The {{ field }} is required',
    'zerologinUrl.url': 'Zerologin url must be a valid url (eg. domain.com)',
  }
}

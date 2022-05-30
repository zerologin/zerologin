import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DomainValidator {
  constructor(protected ctx: HttpContextContract) { }

  private urlSchema = schema.string({ trim: true }, [
    rules.url({
      protocols: ['http', 'https'],
      requireTld: true,
      requireProtocol: false,
      requireHost: true,
      bannedHosts: ['zerologin.co'],
    })])
  public schema = schema.create({
    zerologinUrl: this.urlSchema,
    rootUrl: this.urlSchema,
    secret: schema.string({ trim: true }),
  })

  public messages = {
    'required': 'The {{ field }} is required',
    'domain.url': 'Root domain must be a valid url',
  }
}

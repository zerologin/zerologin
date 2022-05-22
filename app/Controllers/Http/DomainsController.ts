import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class DomainsController {

    public async store({ request, response }: HttpContextContract) {
        const validationSchema = schema.create({
            domain: schema.string({ trim: true }, [
                rules.url({
                    protocols: ['http', 'https'],
                    requireTld: true,
                    requireProtocol: false,
                    requireHost: true,
                    bannedHosts: ['zerologin.co'],
                })
            ]),
            secret: schema.string({ trim: true })
        })
        const { domain, secret } = await request.validate({
            schema: validationSchema,
            messages: {
                required: 'The {{ field }} is required',
                'domain.url': 'Root domain must be a valid url'
            }
        })

        let parsedDomain = domain
        if (parsedDomain.includes('://')) {
            parsedDomain = parsedDomain.split('://')[1]
        }
        if (parsedDomain.includes('/')) {
            parsedDomain = parsedDomain.split('/')[0]
        }

        await request.user.related('domains').create({ name: parsedDomain, jwtSecret: secret })
        response.redirect().back()
    }

    public async delete({ request, response }: HttpContextContract) {
        const { id } = request.params()
        const domain = await request.user.related('domains').query().where('id', id).firstOrFail()
        await domain.delete()
        response.redirect().back()
    }

}

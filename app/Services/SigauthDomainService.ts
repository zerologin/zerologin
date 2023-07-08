import SigauthDomain from 'App/Models/SigauthDomain'
import User from 'App/Models/User'

class SigauthDomainService {
  public async getAll(user: User): Promise<SigauthDomain[]> {
    return await user.related('sigauthDomains').query().orderBy('created_at', 'asc')
  }
}

export default new SigauthDomainService()

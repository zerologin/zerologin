import User from 'App/Models/User'

class UserService {
  public async getOrCreate(pubKey: string): Promise<User> {
    return await User.firstOrCreate({ pubKey }, { pubKey })
  }
}

export default new UserService()

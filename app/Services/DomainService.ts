import Domain from "App/Models/Domain";
import User from "App/Models/User";

class DomainService {

    public async getAll(user: User): Promise<Domain[]> {
        return await user.related('domains').query().orderBy('created_at', 'asc')
    }

}

export default new DomainService()
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import DomainUser from 'App/Models/DomainUser'

export default class Domain extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public rootUrl: string

  @column()
  public zerologinUrl: string

  @column()
  public userId: string
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public jwtSecret: string

  @column()
  public publicId: string

  @hasMany(() => DomainUser)
  public domainUsers: HasMany<typeof DomainUser>
}

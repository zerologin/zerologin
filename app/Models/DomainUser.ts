import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Domain from 'App/Models/Domain'
import RefreshToken from 'App/Models/RefreshToken'

export default class DomainUser extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public pubKey: string

  @column()
  public domainId: string
  @belongsTo(() => Domain)
  public domain: BelongsTo<typeof Domain>

  @hasMany(() => RefreshToken)
  public refreshTokens: HasMany<typeof RefreshToken>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

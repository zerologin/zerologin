import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Domain from 'App/Models/Domain'

export default class DomainUser extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public pubKey: string

  @column()
  public domainId: string
  @belongsTo(() => Domain)
  public domain: BelongsTo<typeof Domain>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

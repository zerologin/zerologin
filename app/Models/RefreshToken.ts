import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import DomainUser from 'App/Models/DomainUser'

export default class RefreshToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public token: string

  @column.dateTime()
  public expiredAt: DateTime

  @column.dateTime()
  public revokedAt?: DateTime

  @column()
  public replacedBy?: string

  @column()
  public domainUserId: string
  @belongsTo(() => DomainUser)
  public domainUser: BelongsTo<typeof DomainUser>

  @computed()
  public get isExpired() {
    return DateTime.utc() >= this.expiredAt
  }

  @computed()
  public get isActive() {
    return this.revokedAt == null && !this.isExpired
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

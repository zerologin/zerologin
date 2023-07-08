import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class SigauthDomain extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public redirectUrl: string

  @column()
  public zerologinUrl: string

  @column()
  public issueCookies: boolean

  @column()
  public tokenName: string

  @column()
  public userId: string
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public jwtSecret: string

  @column()
  public transportWebrtc: boolean

  @column()
  public transportRedirect: boolean

  @column()
  public transportPolling: boolean
}

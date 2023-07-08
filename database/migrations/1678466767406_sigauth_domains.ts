import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigauth_domains'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').notNullable().references('id').inTable('users')
      table.string('redirect_url').nullable()
      table.string('zerologin_url').notNullable()
      table.string('jwt_secret').notNullable()
      table.boolean('issue_cookies').defaultTo(true).notNullable()
      table.string('token_name').defaultTo('jwt')
      table.boolean('transport_webrtc').defaultTo(true).notNullable()
      table.boolean('transport_redirect').defaultTo(true).notNullable()
      table.boolean('transport_polling').defaultTo(false).notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

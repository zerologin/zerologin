import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RefreshTokens extends BaseSchema {
  protected tableName = 'refresh_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('domain_user_id').notNullable().references('id').inTable('domain_users')
      table.string('token').notNullable()
      table.dateTime('expired_at').notNullable()
      table.dateTime('revoked_at').nullable()
      table.string('replaced_by').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

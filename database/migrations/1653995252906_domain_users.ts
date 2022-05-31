import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DomainUsers extends BaseSchema {
  protected tableName = 'domain_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('pub_key').notNullable()
      table.uuid('domain_id').notNullable().references('id').inTable('domains')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

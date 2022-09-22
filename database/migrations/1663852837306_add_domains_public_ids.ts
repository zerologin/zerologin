import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Domains extends BaseSchema {
  protected tableName = 'domains'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('public_id').defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('public_id')
    })
  }
}

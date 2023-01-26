import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'domains'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_keyauth').defaultTo(false).notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_keyauth')
    })
  }
}

import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'domains'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('issue_cookies').defaultTo(true).notNullable()
      table.string('token_name').defaultTo('jwt')
      table.string('refresh_token_name').defaultTo('refresh_token')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('issue_cookies')
      table.dropColumn('token_name')
      table.dropColumn('refresh_token_name')
    })
  }
}

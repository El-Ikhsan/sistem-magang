/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const up = function(knex) {
  return knex.schema.createTable('sertifikat', function(table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string('user_id', 36).notNullable();
    table.string('certificate_number', 100).unique().notNullable();
    table.string('file_url').notNullable();
    table.text('description');
    table.date('issued_date').notNullable();
    table.string('issued_by', 36).notNullable();
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('issued_by').references('id').inTable('users');
    table.index(['user_id']);
    table.index(['certificate_number']);
  });
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const down = function(knex) {
  return knex.schema.dropTable('sertifikat');
};

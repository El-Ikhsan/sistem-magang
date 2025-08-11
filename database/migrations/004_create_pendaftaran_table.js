/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const up = function(knex) {
  return knex.schema.createTable('pendaftaran', function(table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string('user_id', 36).notNullable();
    table.text('motivation_letter');
    table.date('start_date');
    table.date('end_date');
    table.string('ktp_file_path');
    table.string('cv_file_path');
    table.string('certificate_file_path');
    table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.text('admin_notes');
    table.string('approved_by', 36).nullable();
    table.timestamp('approved_at');
    table.timestamps(true, true);
    table.enum('status_magang', ['dalam_magang', 'lulus', 'tidak_lulus']).defaultTo('dalam_magang');

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('approved_by').references('id').inTable('users');
    table.index(['user_id']);
    table.index(['status']);
  });
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const down = function(knex) {
  return knex.schema.dropTable('pendaftaran');
};

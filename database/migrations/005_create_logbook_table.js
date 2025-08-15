/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const up = function(knex) {
  return knex.schema.createTable('logbook', function(table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string('user_id', 36).notNullable();
    table.date('tanggal').notNullable();
    table.enum('kehadiran', ['wfo', 'wfh', 'izin', 'sakit']).notNullable();
    table.string('kegiatan', 500).notNullable();
    table.text('deskripsi');
    table.time('jam_mulai');
    table.time('jam_selesai');
    table.enum('status', ['pending', 'validated', 'rejected']).defaultTo('pending');
    table.text('admin_feedback');
    table.string('validated_by', 36).nullable();
    table.timestamp('validated_at');
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('validated_by').references('id').inTable('users');
    table.index(['user_id']);
    table.index(['status']);
    table.index(['tanggal']);
  });
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const down = function(knex) {
  return knex.schema.dropTable('logbook');
};

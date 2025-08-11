/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const up = function (knex) {
  return knex.schema.createTable('ktp', function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string('user_id', 36).notNullable();
    table.string('nik', 20).notNullable();
    table.string('name', 255).notNullable();
    table.date('birth_date').notNullable();
    table.string('birth_place', 255).notNullable();
    table.string('address', 500).notNullable();
    table.string('rt_rw', 20).nullable();
    table.string('kelurahan', 255).nullable();
    table.string('kecamatan', 255).nullable();
    table.string('city', 255).nullable();
    table.string('province', 255).nullable();
    table.enum('gender', ['male', 'female']).notNullable();
    table.enum('marital_status', ['single', 'married', 'divorced']).notNullable();
    table.string('occupation', 255).nullable();
    table.string('citizenship', 50).defaultTo('WNI');
    table.string('photo_url', 255).nullable();
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['user_id']);
    table.index(['nik']);
  });
};

export const down = function (knex) {
  return knex.schema.dropTable('ktp');
};

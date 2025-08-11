/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const up = function (knex) {
    return knex.schema.createTable("institutions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string('user_id', 36).notNullable();
    table
      .enum("type", ["universitas", "SMA", "Politeknik", "SMK", "lainnya"])
      .notNullable();
    table.string("name", 255).notNullable();
    table.string("email", 255).notNullable();
    table.text("address").notNullable();
    table.string("lecturer_name", 255); // dosen/guru pembimbing
    table.string("whatsapp_supervisor", 20); // no WA pembimbing
    table.string("student_id_number", 50); // NIM/NIS/NISN
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });  
}

export const down = function (knex) {
  return knex.schema.dropTable('institutions');
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("name", 100).notNullable();
    table.string("email", 100).notNullable().unique();
    table.string("password", 255).notNullable();
    table.enum("role", ["admin", "user"]).notNullable();
    table.enum("status", ["active", "inactive"]).defaultTo("active");
    table.string("avatar_url", 255).nullable();
    table.timestamps(true, true);

    table.index(['email']);
    table.index(['role']);
  });
};

export const down = function (knex) {
  return knex.schema.dropTable('users');
};

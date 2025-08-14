/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const up = function (knex) {
  return knex.schema.createTable('refresh_tokens', function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("user_id").notNullable();
    table.string("token", 255).notNullable().unique();
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);
    
    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.index(['user_id']);
  });
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export const down = function (knex) {
  return knex.schema.dropTable('refresh_tokens');
};
export const up = function(knex) {
  return knex.schema.createTable('sertifikat_configs', function(table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string('template_name', 255).notNullable();
    table.string('company_name', 255).notNullable();
    table.text('company_logo_url').notNullable();
    table.text('background_image_url').notNullable();
    table.string('leader_name', 255).notNullable();
    table.text('description').notNullable();
    table.string('certificate_prefix', 50).notNullable();
    table.boolean('is_active').defaultTo(false).notNullable();
    table.uuid('admin_id').notNullable();
    table.foreign('admin_id').references("id").inTable("users").onDelete("CASCADE");
    
    table.timestamps(true, true);
    table.index(['is_active']);
  });
};


export const down = function(knex) {
  return knex.schema.dropTable('sertifikat_configs');
};

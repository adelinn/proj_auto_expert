exports.up = async function (knex) {
  await knex.schema.createTable('allowed_domains', function (table) {
    table.increments('id').primary();
    table.string('domain').notNullable().unique();
    table.integer('created_by').nullable(); // optional user id who added it
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('allowed_domains');
};
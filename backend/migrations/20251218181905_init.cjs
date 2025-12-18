const fs = require("fs");
const path = require("path");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const sqlPath = path.join(__dirname, '..', '..', 'db', 'db.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Rulează schema exact așa cum este
  await knex.raw(sql);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  
};

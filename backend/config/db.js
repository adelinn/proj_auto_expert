import knex from 'knex';
import knexfile from '../knexfile.js';

// Use configured environment (development by default)
const env = process.env.NODE_ENV || 'development';
const config = knexfile[env] || knexfile.development || knexfile;

const db = knex(config);

/**
 * Apply pending migrations (call from server startup if desired)
 * Use RUN_MIGRATIONS_ON_START=1 to run automatically on start
 */
export async function migrateLatest() {
  if (process.env.RUN_MIGRATIONS_ON_START === '1') {
    console.log('Running DB migrations (RUN_MIGRATIONS_ON_START=1)');
    await db.migrate.latest();
    console.log('DB migrations finished');
  }
}

/**
 * Graceful shutdown helper to destroy the Knex connection pool
 */
export function destroyDb() {
  return db.destroy();
}

export default db;

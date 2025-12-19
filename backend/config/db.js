import knex from 'knex';
import knexfile from '../knexfile.js';

// Use configured environment (development by default)
const env = process.env.NODE_ENV || 'development';
const config = knexfile[env] || knexfile.development || knexfile;

const db = knex(config);
import logger from '../server/logger.js';

/**
 * Apply pending migrations (call from server startup if desired)
 * Use RUN_MIGRATIONS_ON_START=1 to run automatically on start
 */
export async function migrateLatest() {
  if (process.env.RUN_MIGRATIONS_ON_START === '1') {
    try {
      logger.info('Running DB migrations (RUN_MIGRATIONS_ON_START=1)');
      await db.migrate.latest();
      logger.info('DB migrations finished');
    } catch (err) {
      logger.error({ err }, 'DB migration failed');
      throw err;
    }
  }
} 

/**
 * Graceful shutdown helper to destroy the Knex connection pool
 */
export async function destroyDb() {
  try {
    await db.destroy();
    logger.info('Database connection pool closed');
  } catch (err) {
    logger.error({ err }, 'Error closing database connection pool');
    throw err;
  }
}

export default db;

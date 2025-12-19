import db from '../config/db.js';
import logger from './logger.js';

export async function getAllowedDomains() {
  try {
    const rows = await db('allowed_domains').select('id', 'domain', 'created_by', 'created_at').orderBy('domain');
    return rows;
  } catch (err) {
    logger.error({ err }, 'Error fetching allowed domains from database');
    throw err;
  }
}

export async function addAllowedDomain(domain, createdBy = null) {
  try {
    const [id] = await db('allowed_domains').insert({ domain, created_by: createdBy });
    return { id, domain };
  } catch (err) {
    logger.error({ err, domain, createdBy }, 'Error adding allowed domain to database');
    throw err;
  }
}

export async function removeAllowedDomain(id) {
  try {
    return await db('allowed_domains').where({ id }).del();
  } catch (err) {
    logger.error({ err, domainId: id }, 'Error removing allowed domain from database');
    throw err;
  }
}

export async function findDomain(domain) {
  try {
    const row = await db('allowed_domains').where({ domain }).first();
    return row;
  } catch (err) {
    logger.error({ err, domain }, 'Error finding domain in database');
    throw err;
  }
}
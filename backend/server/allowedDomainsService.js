import db from '../config/db.js';

export async function getAllowedDomains() {
  const rows = await db('allowed_domains').select('id', 'domain', 'created_by', 'created_at').orderBy('domain');
  return rows;
}

export async function addAllowedDomain(domain, createdBy = null) {
  const [id] = await db('allowed_domains').insert({ domain, created_by: createdBy });
  return { id, domain };
}

export async function removeAllowedDomain(id) {
  return db('allowed_domains').where({ id }).del();
}

export async function findDomain(domain) {
  const row = await db('allowed_domains').where({ domain }).first();
  return row;
}
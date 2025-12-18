import db from '../config/db.js';

const TABLE = 'pozeQ';
const PK = 'id_poza';

function toPublic(row) {
  if (!row) return null;
  return {
    id: row[PK],
    uri: row.uri
  };
}

export async function getAllPoze() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getPozaById(id) {
  const row = await db(TABLE).where(PK, id).first();
  return toPublic(row);
}

export async function createPoza(data) {
  const payload = {
    uri: data.uri || 'sample.jpg'
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getPozaById(insertId);
}

export async function updatePoza(id, changes) {
  const payload = {};
  if (changes.uri !== undefined) payload.uri = changes.uri;
  await db(TABLE).where(PK, id).update(payload);
  return getPozaById(id);
}

export function deletePoza(id) {
  return db(TABLE).where(PK, id).del();
}

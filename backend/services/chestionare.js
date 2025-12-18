import db from '../config/db.js';

const TABLE = 'chestionare';
const PK = 'id';

function toPublic(row) {
  if (!row) return null;
  return {
    id: row[PK],
    id_test: row.id_test,
    id_intrebare: row.id_intrebare,
    valoareQ: row.valoareQ
  };
}

export async function getAllChestionare() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getChestionareById(id) {
  const row = await db(TABLE).where(PK, id).first();
  return toPublic(row);
}

export async function createChestionare(data) {
  const payload = {
    id_test: data.id_test,
    id_intrebare: data.id_intrebare,
    valoareQ: typeof data.valoareQ !== 'undefined' ? data.valoareQ : 1
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getChestionareById(insertId);
}

export async function updateChestionare(id, changes) {
  const payload = {};
  if (changes.id_test !== undefined) payload.id_test = changes.id_test;
  if (changes.id_intrebare !== undefined) payload.id_intrebare = changes.id_intrebare;
  if (changes.valoareQ !== undefined) payload.valoareQ = changes.valoareQ;

  await db(TABLE).where(PK, id).update(payload);
  return getChestionareById(id);
}

export function deleteChestionare(id) {
  return db(TABLE).where(PK, id).del();
}

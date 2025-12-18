import db from '../config/db.js';

const TABLE = 'raspunsuriQ';
const PK = 'id_raspunsQ';

function toPublic(row) {
  if (!row) return null;
  return {
    id: row[PK],
    id_intrebare: row.id_intrebare,
    text: row.text,
    corect: row.corect
  };
}

export async function getAllRaspunsuriQ() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getRaspunsQById(id) {
  const row = await db(TABLE).where(PK, id).first();
  return toPublic(row);
}

export async function createRaspunsQ(data) {
  const payload = {
    id_intrebare: data.id_intrebare,
    text: data.text || '',
    corect: data.corect ?? 0
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getRaspunsQById(insertId);
}

export async function updateRaspunsQ(id, changes) {
  const payload = {};
  if (changes.id_intrebare !== undefined) payload.id_intrebare = changes.id_intrebare;
  if (changes.text !== undefined) payload.text = changes.text;
  if (changes.corect !== undefined) payload.corect = changes.corect;
  await db(TABLE).where(PK, id).update(payload);
  return getRaspunsQById(id);
}

export function deleteRaspunsQ(id) {
  return db(TABLE).where(PK, id).del();
}

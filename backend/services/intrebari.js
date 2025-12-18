import db from '../config/db.js';

// This service works with the `intrebari` table from your db.sql
const TABLE = 'intrebari';
const PK = 'id_intrebare';

function toPublic(row) {
  if (!row) return null;
  return {
    id: row[PK],
    text: row.text,
    id_poza: row.id_poza,
    tipQ_1xR: row.tipQ_1xR
  };
}

export async function getAllIntrebari() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getIntrebareById(id) {
  const row = await db(TABLE).where(PK, id).first();
  return toPublic(row);
}

export async function createQuestion(data) {
  // data: { text, id_poza, tipQ_1xR }
  const [insertId] = await db(TABLE).insert({
    text: data.text,
    id_poza: data.id_poza ?? null,
    tipQ_1xR: typeof data.tipQ_1xR !== 'undefined' ? data.tipQ_1xR : 1
  });
  return getIntrebareById(insertId);
}

export async function updateIntrebare(id, changes) {
  const payload = {};
  if (changes.text !== undefined) payload.text = changes.text;
  if (changes.id_poza !== undefined) payload.id_poza = changes.id_poza;
  if (changes.tipQ_1xR !== undefined) payload.tipQ_1xR = changes.tipQ_1xR;
  await db(TABLE).where(PK, id).update(payload);
  return getIntrebareById(id);
}

export function deleteIntrebare(id) {
  return db(TABLE).where(PK, id).del();
}

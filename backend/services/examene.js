import db from '../config/db.js';

const TABLE = 'examene';
const PK = 'id_examen';

function toPublic(row) {
  if (!row) return null;
  return {
    id: row[PK],
    id_user: row.id_user,
    id_test: row.id_test,
    data: row.data,
    start_time: row.start_time,
    scor: row.scor,
    durata: row.durata
  };
}

export async function getAllExamene() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getExamenById(id) {
  const row = await db(TABLE).where(PK, id).first();
  return toPublic(row);
}

export async function createExamen(data) {
  const payload = {
    id_user: data.id_user,
    id_test: data.id_test,
    data: data.data,
    start_time: data.start_time || null,
    scor: data.scor ?? null,
    durata: data.durata
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getExamenById(insertId);
}

export async function updateExamen(id, changes) {
  const payload = {};
  if (changes.id_user !== undefined) payload.id_user = changes.id_user;
  if (changes.id_test !== undefined) payload.id_test = changes.id_test;
  if (changes.data !== undefined) payload.data = changes.data;
  if (changes.start_time !== undefined) payload.start_time = changes.start_time;
  if (changes.scor !== undefined) payload.scor = changes.scor;
  if (changes.durata !== undefined) payload.durata = changes.durata;

  await db(TABLE).where(PK, id).update(payload);
  return getExamenById(id);
}

export function deleteExamen(id) {
  return db(TABLE).where(PK, id).del();
}

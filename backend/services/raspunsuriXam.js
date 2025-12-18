import db from '../config/db.js';

const TABLE = 'raspunsuriXam';
const PK = 'id_raspunsXam';

function toPublic(row) {
  if (!row) return null;
  return {
    id: row[PK],
    id_examen: row.id_examen,
    id_raspunsQ: row.id_raspunsQ,
    valoare: row.valoare
  };
}

export async function getAllRaspunsuriXam() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getRaspunsXamById(id) {
  const row = await db(TABLE).where(PK, id).first();
  return toPublic(row);
}

export async function createRaspunsXam(data) {
  const payload = {
    id_examen: data.id_examen,
    id_raspunsQ: data.id_raspunsQ,
    valoare: typeof data.valoare !== 'undefined' ? data.valoare : 0
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getRaspunsXamById(insertId);
}

export async function updateRaspunsXam(id, changes) {
  const payload = {};
  if (changes.id_examen !== undefined) payload.id_examen = changes.id_examen;
  if (changes.id_raspunsQ !== undefined) payload.id_raspunsQ = changes.id_raspunsQ;
  if (changes.valoare !== undefined) payload.valoare = changes.valoare;
  await db(TABLE).where(PK, id).update(payload);
  return getRaspunsXamById(id);
}

export function deleteRaspunsXam(id) {
  return db(TABLE).where(PK, id).del();
}

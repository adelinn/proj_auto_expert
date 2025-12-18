import db from '../config/db.js';

const TABLE = 'teste';
const PK = 'id_test';

function toPublic(row) {
  if (!row) return null;
  return {
    id: row[PK],
    nume: row.nume,
    punctajStart: row.punctajStart,
    punctajMinim: row.punctajMinim,
    timpLimitaS: row.timpLimitaS,
    enabled: row.enabled,
    versiune: row.versiune,
    copyOf: row.copyOf
  };
}

export async function getAllTeste() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getTestById(id) {
  const row = await db(TABLE).where(PK, id).first();
  return toPublic(row);
}

export async function createTest(data) {
  const payload = {
    nume: data.nume || 'noName',
    punctajStart: data.punctajStart ?? 0,
    punctajMinim: data.punctajMinim ?? 0,
    timpLimitaS: data.timpLimitaS || 0,
    enabled: typeof data.enabled !== 'undefined' ? data.enabled : 1,
    versiune: data.versiune ?? 1,
    copyOf: data.copyOf ?? null
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getTestById(insertId);
}

export async function updateTest(id, changes) {
  const payload = {};
  if (changes.nume !== undefined) payload.nume = changes.nume;
  if (changes.punctajStart !== undefined) payload.punctajStart = changes.punctajStart;
  if (changes.punctajMinim !== undefined) payload.punctajMinim = changes.punctajMinim;
  if (changes.timpLimitaS !== undefined) payload.timpLimitaS = changes.timpLimitaS;
  if (changes.enabled !== undefined) payload.enabled = changes.enabled;
  if (changes.versiune !== undefined) payload.versiune = changes.versiune;
  if (changes.copyOf !== undefined) payload.copyOf = changes.copyOf;

  await db(TABLE).where(PK, id).update(payload);
  return getTestById(id);
}

export function deleteTest(id) {
  return db(TABLE).where(PK, id).del();
}

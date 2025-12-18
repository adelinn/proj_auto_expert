import db from '../config/db.js';

const TABLE = 'useri';
const PK = 'id_user';

function toPublic(row) {
  if (!row) return null;
  return {
    id: row[PK],
    email: row.email,
    username: row.username,
    nume: row.nume,
    telefon: row.telefon,
    enabled: row.enabled
  };
}

export async function getAllUsers() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getUserById(id) {
  const row = await db(TABLE).where(PK, id).first();
  return toPublic(row);
}

export async function getUserByEmail(email) {
  const row = await db(TABLE).where('email', email).first();
  return toPublic(row);
}

export async function createUser(data) {
  const payload = {
    email: data.email,
    username: data.username ?? null,
    parola: data.parola, // password handling is outside scope; ensure hashing elsewhere
    nume: data.nume,
    telefon: data.telefon ?? null,
    enabled: typeof data.enabled !== 'undefined' ? data.enabled : 1
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getUserById(insertId);
}

export async function updateUser(id, changes) {
  const payload = {};
  if (changes.email !== undefined) payload.email = changes.email;
  if (changes.username !== undefined) payload.username = changes.username;
  if (changes.parola !== undefined) payload.parola = changes.parola;
  if (changes.nume !== undefined) payload.nume = changes.nume;
  if (changes.telefon !== undefined) payload.telefon = changes.telefon;
  if (changes.enabled !== undefined) payload.enabled = changes.enabled;

  await db(TABLE).where(PK, id).update(payload);
  return getUserById(id);
}

export function deleteUser(id) {
  return db(TABLE).where(PK, id).del();
}

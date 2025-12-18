import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { z } from "zod";
import { parseDb, parseInput, zFlag01, zId } from "./zod.js";

const TABLE = 'useri';
const PK = 'id_user';

const zUserPublic = z.object({
  id: zId,
  email: z.email(),
  username: z.string().nullable(),
  nume: z.string().nullable(),
  telefon: z.string().nullable(),
  enabled: zFlag01
});

const zUserCreate = z.object({
  email: z.email(),
  username: z.string().min(1).nullable().optional().default(null),
  parola: z.string().min(1),
  nume: z.string().min(1).nullable().optional().default(null),
  telefon: z.string().min(1).nullable().optional().default(null),
  enabled: zFlag01.optional().default(1)
});

const zUserUpdate = z
  .object({
    email: z.email().optional(),
    username: z.string().min(1).nullable().optional(),
    parola: z.string().min(1).optional(),
    nume: z.string().min(1).nullable().optional(),
    telefon: z.string().min(1).nullable().optional(),
    enabled: zFlag01.optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No changes provided" });

function toPublic(row) {
  if (!row) return null;
  return parseDb(
    zUserPublic,
    {
      id: row[PK],
      email: row.email,
      username: row.username ?? null,
      nume: row.nume ?? null,
      telefon: row.telefon ?? null,
      enabled: row.enabled
    },
    "Invalid useri row"
  );
}

export async function getAll() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getById(id) {
  const safeId = parseInput(zId, id, "Invalid user id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function getByEmail(email) {
  const safeEmail = parseInput(z.string().email(), email, "Invalid email");
  const row = await db(TABLE).where('email', safeEmail).first();
  return toPublic(row);
}

export async function create(data) {
  const safe = parseInput(zUserCreate, data, "Invalid user create payload");
  // hash password before storing
  const hashed = await bcrypt.hash(safe.parola, 12);

  const payload = {
    email: safe.email,
    username: safe.username ?? null,
    parola: hashed,
    nume: safe.nume ?? null,
    telefon: safe.telefon ?? null,
    enabled: safe.enabled
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getUserById(insertId);
}

export async function update(id, changes) {
  const safeId = parseInput(zId, id, "Invalid user id");
  const safe = parseInput(zUserUpdate, changes, "Invalid user update payload");
  const payload = {};
  if (safe.email !== undefined) payload.email = safe.email;
  if (safe.username !== undefined) payload.username = safe.username;
  if (safe.parola !== undefined) payload.parola = await bcrypt.hash(safe.parola, 12);
  if (safe.nume !== undefined) payload.nume = safe.nume;
  if (safe.telefon !== undefined) payload.telefon = safe.telefon;
  if (safe.enabled !== undefined) payload.enabled = safe.enabled;

  await db(TABLE).where(PK, safeId).update(payload);
  return getUserById(safeId);
}

export function del(id) {
  const safeId = parseInput(zId, id, "Invalid user id");
  return db(TABLE).where(PK, safeId).del();
}

export async function getAllUsers(...args) {
  return getAll(...args);
}
export async function getUserById(...args) {
  return getByI(...args);
}
export async function getUserByEmail(...args) {
  return getByEmail(...args);
}
export async function createUser(...args) {
  return create(...args);
}
export async function updateUser(...args) {
  return update(...args);
}
export function deleteUser() {
  return del();
}

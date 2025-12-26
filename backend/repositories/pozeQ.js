import db from '../config/db.js';
import { z } from "zod";
import { parseDb, parseInput, zId, zNonEmptyString } from "./zod.js";

const TABLE = 'pozeQ';
const PK = 'id_poza';

const zPozaPublic = z.object({
  id: zId,
  uri: zNonEmptyString
});

const zPozaCreate = z.object({
  uri: z.string().optional().default("sample.jpg")
});

const zPozaUpdate = z
  .object({
    uri: z.string().optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No changes provided" });

function toPublic(row) {
  if (!row) return null;
  return parseDb(
    zPozaPublic,
    { id: row[PK], uri: row.uri ?? "" },
    "Invalid pozeQ row"
  );
}

export async function getAll() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getById(id) {
  const safeId = parseInput(zId, id, "Invalid poza id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function create(data) {
  const safe = parseInput(zPozaCreate, data, "Invalid poza create payload");
  const payload = {
    uri: safe.uri
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getById(insertId);
}

export async function update(id, changes) {
  const safeId = parseInput(zId, id, "Invalid poza id");
  const safe = parseInput(zPozaUpdate, changes, "Invalid poza update payload");
  const payload = {};
  if (safe.uri !== undefined) payload.uri = safe.uri;
  await db(TABLE).where(PK, safeId).update(payload);
  return getById(safeId);
}

export function del(id) {
  const safeId = parseInput(zId, id, "Invalid poza id");
  return db(TABLE).where(PK, safeId).del();
}

export async function getAllPoze(...args) {
  return getAll(...args);
}
export async function getPozaById(...args) {
  return getById(...args);
}
export async function createPoza(...args) {
  return create(...args);
}
export async function updatePoza(...args) {
  return update(...args);
}
export function deletePoza(...args) {
  return del(...args);
}

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

export async function getAllPoze() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getPozaById(id) {
  const safeId = parseInput(zId, id, "Invalid poza id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function createPoza(data) {
  const safe = parseInput(zPozaCreate, data, "Invalid poza create payload");
  const payload = {
    uri: safe.uri
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getPozaById(insertId);
}

export async function updatePoza(id, changes) {
  const safeId = parseInput(zId, id, "Invalid poza id");
  const safe = parseInput(zPozaUpdate, changes, "Invalid poza update payload");
  const payload = {};
  if (safe.uri !== undefined) payload.uri = safe.uri;
  await db(TABLE).where(PK, safeId).update(payload);
  return getPozaById(safeId);
}

export function deletePoza(id) {
  const safeId = parseInput(zId, id, "Invalid poza id");
  return db(TABLE).where(PK, safeId).del();
}

export default {
  getAll: getAllPoze,
  getById: getPozaById,
  create: createPoza,
  update: updatePoza,
  delete: deletePoza
};

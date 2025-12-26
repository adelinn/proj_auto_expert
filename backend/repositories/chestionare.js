import db from '../config/db.js';
import { z } from "zod";
import { parseDb, parseInput, zId, zNonNegInt } from "./zod.js";

const TABLE = 'chestionare';
const PK = 'id';

const zChestionarPublic = z.object({
  id: zId,
  id_test: zId,
  id_intrebare: zId,
  valoareQ: zNonNegInt
});

const zChestionarCreate = z.object({
  id_test: zId,
  id_intrebare: zId,
  valoareQ: zNonNegInt.optional().default(1)
});

const zChestionarUpdate = z
  .object({
    id_test: zId.optional(),
    id_intrebare: zId.optional(),
    valoareQ: zNonNegInt.optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No changes provided" });

function toPublic(row) {
  if (!row) return null;
  return parseDb(
    zChestionarPublic,
    {
      id: row[PK],
      id_test: row.id_test,
      id_intrebare: row.id_intrebare,
      valoareQ: row.valoareQ
    },
    "Invalid chestionare row"
  );
}

export async function getAll() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getById(id) {
  const safeId = parseInput(zId, id, "Invalid chestionar id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function create(data) {
  const safe = parseInput(zChestionarCreate, data, "Invalid chestionare create payload");
  const payload = {
    id_test: safe.id_test,
    id_intrebare: safe.id_intrebare,
    valoareQ: safe.valoareQ
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getById(insertId);
}

export async function update(id, changes) {
  const safeId = parseInput(zId, id, "Invalid chestionare id");
  const safe = parseInput(zChestionarUpdate, changes, "Invalid chestionare update payload");
  const payload = {};
  if (safe.id_test !== undefined) payload.id_test = safe.id_test;
  if (safe.id_intrebare !== undefined) payload.id_intrebare = safe.id_intrebare;
  if (safe.valoareQ !== undefined) payload.valoareQ = safe.valoareQ;

  await db(TABLE).where(PK, safeId).update(payload);
  return getById(safeId);
}

export function del(id) {
  const safeId = parseInput(zId, id, "Invalid chestionare id");
  return db(TABLE).where(PK, safeId).del();
}

export async function getAllChestionare(...args) {
  return getAll(...args);
}
export async function getChestionareById(...args) {
  return getById(...args);
}
export async function createChestionare(...args) {
  return create(...args);
}
export async function updateChestionare(...args) {
  return update(...args);
}
export function deleteChestionare(...args) {
  return del(...args);
}
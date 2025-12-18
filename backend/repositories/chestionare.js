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

export async function getAllChestionare() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getChestionareById(id) {
  const safeId = parseInput(zId, id, "Invalid chestionar id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function createChestionare(data) {
  const safe = parseInput(zChestionarCreate, data, "Invalid chestionare create payload");
  const payload = {
    id_test: safe.id_test,
    id_intrebare: safe.id_intrebare,
    valoareQ: safe.valoareQ
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getChestionareById(insertId);
}

export async function updateChestionare(id, changes) {
  const safeId = parseInput(zId, id, "Invalid chestionare id");
  const safe = parseInput(zChestionarUpdate, changes, "Invalid chestionare update payload");
  const payload = {};
  if (safe.id_test !== undefined) payload.id_test = safe.id_test;
  if (safe.id_intrebare !== undefined) payload.id_intrebare = safe.id_intrebare;
  if (safe.valoareQ !== undefined) payload.valoareQ = safe.valoareQ;

  await db(TABLE).where(PK, safeId).update(payload);
  return getChestionareById(safeId);
}

export function deleteChestionare(id) {
  const safeId = parseInput(zId, id, "Invalid chestionare id");
  return db(TABLE).where(PK, safeId).del();
}

export default {
  getAll: getAllChestionare,
  getById: getChestionareById,
  create: createChestionare,
  update: updateChestionare,
  delete: deleteChestionare
};
import db from '../config/db.js';
import { z } from "zod";
import { parseDb, parseInput, zFlag01, zId, zNonEmptyString, zNullableId } from "./zod.js";

// This service works with the `intrebari` table from your db.sql
const TABLE = 'intrebari';
const PK = 'id_intrebare';

const zIntrebarePublic = z.object({
  id: zId,
  text: zNonEmptyString,
  id_poza: zNullableId,
  tipQ_1xR: zFlag01
});

const zIntrebareCreate = z.object({
  text: zNonEmptyString,
  id_poza: zNullableId.optional().default(null),
  tipQ_1xR: zFlag01.optional().default(1)
});

const zIntrebareUpdate = z
  .object({
    text: zNonEmptyString.optional(),
    id_poza: zNullableId.optional(),
    tipQ_1xR: zFlag01.optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No changes provided" });

function toPublic(row) {
  if (!row) return null;
  return parseDb(
    zIntrebarePublic,
    {
      id: row[PK],
      text: row.text ?? "",
      id_poza: row.id_poza ?? null,
      tipQ_1xR: row.tipQ_1xR
    },
    "Invalid intrebari row"
  );
}

export async function getAllIntrebari() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getIntrebareById(id) {
  const safeId = parseInput(zId, id, "Invalid intrebare id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function createIntrebare(data) {
  // data: { text, id_poza, tipQ_1xR }
  const safe = parseInput(zIntrebareCreate, data, "Invalid intrebare create payload");
  const [insertId] = await db(TABLE).insert({
    text: safe.text,
    id_poza: safe.id_poza,
    tipQ_1xR: safe.tipQ_1xR
  });
  return getIntrebareById(insertId);
}

export async function updateIntrebare(id, changes) {
  const safeId = parseInput(zId, id, "Invalid intrebare id");
  const safe = parseInput(zIntrebareUpdate, changes, "Invalid intrebare update payload");
  const payload = {};
  if (safe.text !== undefined) payload.text = safe.text;
  if (safe.id_poza !== undefined) payload.id_poza = safe.id_poza;
  if (safe.tipQ_1xR !== undefined) payload.tipQ_1xR = safe.tipQ_1xR;
  await db(TABLE).where(PK, safeId).update(payload);
  return getIntrebareById(safeId);
}

export function deleteIntrebare(id) {
  const safeId = parseInput(zId, id, "Invalid intrebare id");
  return db(TABLE).where(PK, safeId).del();
}

export default {
  getAll: getAllIntrebari,
  getById: getIntrebareById,
  create: createIntrebare,
  update: updateIntrebare,
  delete: deleteIntrebare
};

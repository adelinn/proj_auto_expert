import db from '../config/db.js';
import { z } from "zod";
import { parseDb, parseInput, zFlag01, zId, zNonEmptyString } from "./zod.js";

const TABLE = 'raspunsuriQ';
const PK = 'id_raspunsQ';

const zRaspunsQPublic = z.object({
  id: zId,
  id_intrebare: zId,
  text: zNonEmptyString,
  corect: zFlag01
});

const zRaspunsQCreate = z.object({
  id_intrebare: zId,
  text: z.string().optional().default(""),
  corect: zFlag01.optional().default(0)
});

const zRaspunsQUpdate = z
  .object({
    id_intrebare: zId.optional(),
    text: z.string().optional(),
    corect: zFlag01.optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No changes provided" });

function toPublic(row) {
  if (!row) return null;
  return parseDb(
    zRaspunsQPublic,
    {
      id: row[PK],
      id_intrebare: row.id_intrebare,
      text: row.text ?? "",
      corect: row.corect
    },
    "Invalid raspunsuriQ row"
  );
}

export async function getAll() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getById(id) {
  const safeId = parseInput(zId, id, "Invalid raspunsQ id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function create(data) {
  const safe = parseInput(zRaspunsQCreate, data, "Invalid raspunsQ create payload");
  const payload = {
    id_intrebare: safe.id_intrebare,
    text: safe.text,
    corect: safe.corect
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getById(insertId);
}

export async function update(id, changes) {
  const safeId = parseInput(zId, id, "Invalid raspunsQ id");
  const safe = parseInput(zRaspunsQUpdate, changes, "Invalid raspunsQ update payload");
  const payload = {};
  if (safe.id_intrebare !== undefined) payload.id_intrebare = safe.id_intrebare;
  if (safe.text !== undefined) payload.text = safe.text;
  if (safe.corect !== undefined) payload.corect = safe.corect;
  await db(TABLE).where(PK, safeId).update(payload);
  return getById(safeId);
}

export function del(id) {
  const safeId = parseInput(zId, id, "Invalid raspunsQ id");
  return db(TABLE).where(PK, safeId).del();
}

export async function getAllRaspunsuriQ(...args) {
  return getAll(...args);
}
export async function getRaspunsQById(...args) {
  return getById(...args);
}
export async function createRaspunsQ(...args) {
  return create(...args);
}
export async function updateRaspunsQ(...args) {
  return update(...args);
}
export function deleteRaspunsQ(...args) {
  return del(...args);
}

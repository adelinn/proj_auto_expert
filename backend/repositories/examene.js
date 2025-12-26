import db from '../config/db.js';
import { z } from "zod";
import { parseDb, parseInput, zId, zNonNegInt, zNullableId } from "./zod.js";

const TABLE = 'examene';
const PK = 'id_examen';

const zExamenPublic = z.object({
  id: zId,
  id_user: zId,
  id_test: zId,
  data: z.any(),
  start_time: z.any().nullable(),
  scor: z.coerce.number().nullable(),
  durata: zNonNegInt.nullable().optional()
});

const zExamenCreate = z.object({
  id_user: zId,
  id_test: zId,
  data: z.any(),
  start_time: z.any().nullable().optional().default(null),
  scor: z.coerce.number().nullable().optional().default(null),
  durata: zNonNegInt.optional()
});

const zExamenUpdate = z
  .object({
    id_user: zId.optional(),
    id_test: zId.optional(),
    data: z.any().optional(),
    start_time: z.any().nullable().optional(),
    scor: z.coerce.number().nullable().optional(),
    durata: zNonNegInt.optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No changes provided" });

function toPublic(row) {
  if (!row) return null;
  return parseDb(
    zExamenPublic,
    {
      id: row[PK],
      id_user: row.id_user,
      id_test: row.id_test,
      data: row.data,
      start_time: row.start_time ?? null,
      scor: row.scor ?? null,
      durata: row.durata ?? null
    },
    "Invalid examene row"
  );
}

export async function getAll() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getById(id) {
  const safeId = parseInput(zId, id, "Invalid examen id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function create(data) {
  const safe = parseInput(zExamenCreate, data, "Invalid examen create payload");
  const payload = {
    id_user: safe.id_user,
    id_test: safe.id_test,
    data: safe.data,
    start_time: safe.start_time,
    scor: safe.scor,
    durata: safe.durata
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getById(insertId);
}

export async function update(id, changes) {
  const safeId = parseInput(zId, id, "Invalid examen id");
  const safe = parseInput(zExamenUpdate, changes, "Invalid examen update payload");
  const payload = {};
  if (safe.id_user !== undefined) payload.id_user = safe.id_user;
  if (safe.id_test !== undefined) payload.id_test = safe.id_test;
  if (safe.data !== undefined) payload.data = safe.data;
  if (safe.start_time !== undefined) payload.start_time = safe.start_time;
  if (safe.scor !== undefined) payload.scor = safe.scor;
  if (safe.durata !== undefined) payload.durata = safe.durata;

  await db(TABLE).where(PK, safeId).update(payload);
  return getById(safeId);
}

export function del(id) {
  const safeId = parseInput(zId, id, "Invalid examen id");
  return db(TABLE).where(PK, safeId).del();
}

export async function getAllExamene(...args) {
  return getAll(...args);
}
export async function getExamenById(...args) {
  return getById(...args);
}
export async function createExamen(...args) {
  return create(...args);
}
export async function updateExamen(...args) {
  return update(...args);
}
export function deleteExamen(...args) {
  return del(...args);
}

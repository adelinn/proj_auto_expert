import db from '../config/db.js';
import { z } from "zod";
import { parseDb, parseInput, zFlag01, zId, zNonEmptyString, zNonNegInt, zNullableId } from "./zod.js";

const TABLE = 'teste';
const PK = 'id_test';

const zTestPublic = z.object({
  id: zId,
  nume: zNonEmptyString,
  punctajStart: zNonNegInt,
  punctajMinim: zNonNegInt,
  timpLimitaS: zNonNegInt,
  enabled: zFlag01,
  versiune: zNonNegInt,
  copyOf: zNullableId
});

const zTestCreate = z.object({
  nume: zNonEmptyString.optional().default("noName"),
  punctajStart: zNonNegInt.optional().default(0),
  punctajMinim: zNonNegInt.optional().default(0),
  timpLimitaS: zNonNegInt.optional().default(0),
  enabled: zFlag01.optional().default(1),
  versiune: zNonNegInt.optional().default(1),
  copyOf: zNullableId.optional().default(null)
});

const zTestUpdate = z
  .object({
    nume: zNonEmptyString.optional(),
    punctajStart: zNonNegInt.optional(),
    punctajMinim: zNonNegInt.optional(),
    timpLimitaS: zNonNegInt.optional(),
    enabled: zFlag01.optional(),
    versiune: zNonNegInt.optional(),
    copyOf: zNullableId.optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No changes provided" });

function toPublic(row) {
  if (!row) return null;
  return parseDb(
    zTestPublic,
    {
      id: row[PK],
      nume: row.nume,
      punctajStart: row.punctajStart,
      punctajMinim: row.punctajMinim,
      timpLimitaS: row.timpLimitaS,
      enabled: row.enabled,
      versiune: row.versiune,
      copyOf: row.copyOf
    },
    "Invalid teste row"
  );
}

export async function getAllTeste() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getTestById(id) {
  const safeId = parseInput(zId, id, "Invalid test id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function createTest(data) {
  const safe = parseInput(zTestCreate, data, "Invalid test create payload");
  const payload = {
    nume: safe.nume,
    punctajStart: safe.punctajStart,
    punctajMinim: safe.punctajMinim,
    timpLimitaS: safe.timpLimitaS,
    enabled: safe.enabled,
    versiune: safe.versiune,
    copyOf: safe.copyOf
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getTestById(insertId);
}

export async function updateTest(id, changes) {
  const safeId = parseInput(zId, id, "Invalid test id");
  const safe = parseInput(zTestUpdate, changes, "Invalid test update payload");
  const payload = {};
  if (safe.nume !== undefined) payload.nume = safe.nume;
  if (safe.punctajStart !== undefined) payload.punctajStart = safe.punctajStart;
  if (safe.punctajMinim !== undefined) payload.punctajMinim = safe.punctajMinim;
  if (safe.timpLimitaS !== undefined) payload.timpLimitaS = safe.timpLimitaS;
  if (safe.enabled !== undefined) payload.enabled = safe.enabled;
  if (safe.versiune !== undefined) payload.versiune = safe.versiune;
  if (safe.copyOf !== undefined) payload.copyOf = safe.copyOf;

  await db(TABLE).where(PK, safeId).update(payload);
  return getTestById(safeId);
}

export function deleteTest(id) {
  const safeId = parseInput(zId, id, "Invalid test id");
  return db(TABLE).where(PK, safeId).del();
}

export default {
  getAll: getAllTeste,
  getById: getTestById,
  create: createTest,
  update: updateTest,
  delete: deleteTest
};

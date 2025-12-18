import db from '../config/db.js';
import { z } from "zod";
import { parseDb, parseInput, zId, zNonNegInt } from "./zod.js";

const TABLE = 'raspunsuriXam';
const PK = 'id_raspunsXam';

const zRaspunsXamPublic = z.object({
  id: zId,
  id_examen: zId,
  id_raspunsQ: zId,
  valoare: zNonNegInt
});

const zRaspunsXamCreate = z.object({
  id_examen: zId,
  id_raspunsQ: zId,
  valoare: zNonNegInt.optional().default(0)
});

const zRaspunsXamUpdate = z
  .object({
    id_examen: zId.optional(),
    id_raspunsQ: zId.optional(),
    valoare: zNonNegInt.optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No changes provided" });

function toPublic(row) {
  if (!row) return null;
  return parseDb(
    zRaspunsXamPublic,
    {
      id: row[PK],
      id_examen: row.id_examen,
      id_raspunsQ: row.id_raspunsQ,
      valoare: row.valoare
    },
    "Invalid raspunsuriXam row"
  );
}

export async function getAllRaspunsuriXam() {
  const rows = await db(TABLE).select('*');
  return rows.map(toPublic);
}

export async function getRaspunsXamById(id) {
  const safeId = parseInput(zId, id, "Invalid raspunsXam id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}

export async function createRaspunsXam(data) {
  const safe = parseInput(zRaspunsXamCreate, data, "Invalid raspunsXam create payload");
  const payload = {
    id_examen: safe.id_examen,
    id_raspunsQ: safe.id_raspunsQ,
    valoare: safe.valoare
  };
  const [insertId] = await db(TABLE).insert(payload);
  return getRaspunsXamById(insertId);
}

export async function updateRaspunsXam(id, changes) {
  const safeId = parseInput(zId, id, "Invalid raspunsXam id");
  const safe = parseInput(zRaspunsXamUpdate, changes, "Invalid raspunsXam update payload");
  const payload = {};
  if (safe.id_examen !== undefined) payload.id_examen = safe.id_examen;
  if (safe.id_raspunsQ !== undefined) payload.id_raspunsQ = safe.id_raspunsQ;
  if (safe.valoare !== undefined) payload.valoare = safe.valoare;
  await db(TABLE).where(PK, safeId).update(payload);
  return getRaspunsXamById(safeId);
}

export function deleteRaspunsXam(id) {
  const safeId = parseInput(zId, id, "Invalid raspunsXam id");
  return db(TABLE).where(PK, safeId).del();
}

export default {
  getAll: getAllRaspunsuriXam,
  getById: getRaspunsXamById,
  create: createRaspunsXam,
  update: updateRaspunsXam,
  delete: deleteRaspunsXam
};

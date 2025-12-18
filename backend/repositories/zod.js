import { z } from "zod";

export const zId = z.coerce.number().int().positive();
export const zFlag01 = z.coerce.number().int().min(0).max(1);
export const zNonEmptyString = z.string().min(1);
export const zNullableString = z.string().nullable();
export const zNullableId = zId.nullable();
export const zNonNegInt = z.coerce.number().int().min(0);

function makeHttpError(message, status, details) {
  const err = new Error(message);
  err.status = status;
  if (details !== undefined) err.details = details;
  return err;
}

/**
 * Validate user input at repository boundary.
 * Throws an Error with `status=400` on validation failure.
 */
export function parseInput(schema, value, message = "Invalid input") {
  const res = schema.safeParse(value);
  if (res.success) return res.data;
  throw makeHttpError(message, 400, res.error.flatten());
}

/**
 * Validate data coming from DB (invariants).
 * Throws an Error with `status=500` on validation failure.
 */
export function parseDb(schema, value, message = "Invalid data from database") {
  const res = schema.safeParse(value);
  if (res.success) return res.data;
  throw makeHttpError(message, 500, res.error.flatten());
}



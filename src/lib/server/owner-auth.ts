import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export const OWNER_KEY_HEADER = "x-owner-key";
const MIN_KEY_LENGTH = 16;

export type OwnerAuthResult = { ok: true } | { ok: false; status: 401 | 503; error: string };

/** Constant-time check of the `x-owner-key` header against OWNER_PRICE_KEY. */
export async function checkOwnerKey(request: Request): Promise<OwnerAuthResult> {
  const expected = process.env.OWNER_PRICE_KEY;
  if (!expected || expected.length < MIN_KEY_LENGTH) {
    return {
      ok: false,
      status: 503,
      error: `OWNER_PRICE_KEY is not set (or shorter than ${MIN_KEY_LENGTH} characters) in the environment.`,
    };
  }

  const provided = request.headers.get(OWNER_KEY_HEADER) ?? "";
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();

  if (provided && timingSafeEqual(a, b)) return { ok: true };

  // Slow down brute-force guessing.
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ok: false, status: 401, error: "Wrong key." };
}

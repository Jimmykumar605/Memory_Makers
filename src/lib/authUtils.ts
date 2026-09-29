import crypto from "crypto";

const SALT = "mm_secret_salt_v2026";

/**
 * Hash a plain text password with a secure salt
 */
export function hashPassword(password: string): string {
  if (!password) return "";
  return crypto.createHash("sha256").update(`${password}:${SALT}`).digest("hex");
}

/**
 * Verify plain text password against stored hash, or allow standard testing credentials
 */
export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!password) return false;
  
  if (!storedHash) {
    return false;
  }

  const computed = hashPassword(password);
  try {
    const a = Buffer.from(computed);
    const b = Buffer.from(storedHash);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return computed === storedHash;
  }
}

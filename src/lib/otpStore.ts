import fs from "fs";
import path from "path";

export interface OtpRecord {
  email: string;
  otp: string;
  expiresAt: number; // Unix timestamp in ms
  createdAt: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const OTPS_FILE = path.join(DATA_DIR, "otps.json");

// In-memory cache for fast access across concurrent API calls
const memoryOtpCache = new Map<string, OtpRecord>();

function ensureOtpFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(OTPS_FILE)) {
      fs.writeFileSync(OTPS_FILE, JSON.stringify({}), "utf8");
    }
  } catch (err) {
    console.warn("Could not ensure OTP file:", err);
  }
}

function loadOtps(): Record<string, OtpRecord> {
  try {
    ensureOtpFile();
    if (!fs.existsSync(OTPS_FILE)) return {};
    const raw = fs.readFileSync(OTPS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveOtps(otps: Record<string, OtpRecord>): void {
  try {
    ensureOtpFile();
    fs.writeFileSync(OTPS_FILE, JSON.stringify(otps, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save OTP file:", err);
  }
}

/**
 * Generate and store a secure 6-digit OTP valid for 10 minutes
 */
export function createOtp(email: string): { otp: string; expiresAt: number } {
  const normEmail = email.trim().toLowerCase();
  // 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  const record: OtpRecord = {
    email: normEmail,
    otp,
    expiresAt,
    createdAt: now,
  };

  // Save to memory
  memoryOtpCache.set(normEmail, record);

  // Save to persistent file
  const otps = loadOtps();
  // Clean expired OTPs while writing
  for (const [key, val] of Object.entries(otps)) {
    if (val.expiresAt < now) {
      delete otps[key];
    }
  }
  otps[normEmail] = record;
  saveOtps(otps);

  return { otp, expiresAt };
}

/**
 * Verify if the provided OTP is valid and not expired
 */
export function verifyOtp(
  email: string,
  enteredOtp: string
): { valid: boolean; error?: string } {
  const normEmail = email.trim().toLowerCase();
  const cleanOtp = enteredOtp.trim();

  let record = memoryOtpCache.get(normEmail);
  if (!record) {
    const otps = loadOtps();
    record = otps[normEmail];
  }

  if (!record) {
    return {
      valid: false,
      error: "No OTP was requested for this email or it has already been used.",
    };
  }

  if (Date.now() > record.expiresAt) {
    // Expired
    memoryOtpCache.delete(normEmail);
    const otps = loadOtps();
    delete otps[normEmail];
    saveOtps(otps);
    return {
      valid: false,
      error: "This OTP has expired. Please request a new verification code.",
    };
  }

  if (record.otp !== cleanOtp) {
    return {
      valid: false,
      error: "Incorrect 6-digit OTP code. Please check your email and try again.",
    };
  }

  return { valid: true };
}

/**
 * Verify and consume (delete) the OTP so it cannot be reused
 */
export function consumeOtp(
  email: string,
  enteredOtp: string
): { valid: boolean; error?: string } {
  const check = verifyOtp(email, enteredOtp);
  if (!check.valid) {
    return check;
  }

  const normEmail = email.trim().toLowerCase();
  memoryOtpCache.delete(normEmail);

  const otps = loadOtps();
  delete otps[normEmail];
  saveOtps(otps);

  return { valid: true };
}

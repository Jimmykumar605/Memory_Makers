export interface OtpRecord {
  email: string;
  otp: string;
  expiresAt: number; // Unix timestamp in ms
  createdAt: number;
}

// Pure in-memory cache for dynamic OTP verification (No JSON files on disk)
const memoryOtpCache = new Map<string, OtpRecord>();

/**
 * Generate and store a secure 6-digit OTP valid for 10 minutes purely in dynamic memory
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

  // Save to in-memory map
  memoryOtpCache.set(normEmail, record);

  // Automatically purge when expired after 10 minutes
  setTimeout(() => {
    const existing = memoryOtpCache.get(normEmail);
    if (existing && existing.expiresAt <= Date.now()) {
      memoryOtpCache.delete(normEmail);
    }
  }, 10 * 60 * 1000).unref?.();

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

  const record = memoryOtpCache.get(normEmail);

  if (!record) {
    return {
      valid: false,
      error: "No OTP was requested for this email or it has already expired.",
    };
  }

  if (Date.now() > record.expiresAt) {
    memoryOtpCache.delete(normEmail);
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

  return { valid: true };
}

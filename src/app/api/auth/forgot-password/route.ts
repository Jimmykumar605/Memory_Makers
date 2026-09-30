import { NextRequest, NextResponse } from "next/server";
import {
  fetchUserByEmailFromSupabase,
  fetchAllPhotographersFromSupabase,
  updateUserPasswordInSupabase,
} from "@/lib/supabase/service";
import { createOtp, verifyOtp, consumeOtp } from "@/lib/otpStore";
import { sendPasswordResetOtpEmail } from "@/lib/mailer";
import { hashPassword } from "@/lib/authUtils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, otp, newPassword } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid registered email address." },
        { status: 400 }
      );
    }

    const normEmail = email.trim().toLowerCase();

    // -------------------------------------------------------------------------
    // ACTION 1: SEND OTP TO REGISTERED EMAIL
    // -------------------------------------------------------------------------
    if (!action || action === "send_otp") {
      // 1. Verify that this email is registered in Supabase users or photographer profiles
      const dbUser = await fetchUserByEmailFromSupabase(normEmail);
      const allPhotographers = await fetchAllPhotographersFromSupabase();
      const photographerProfile =
        allPhotographers?.find((p) => p.email?.toLowerCase() === normEmail) || null;

      if (!dbUser && !photographerProfile) {
        return NextResponse.json(
          {
            error:
              "No account found with this email address. Please verify your email or sign up for a new account.",
          },
          { status: 404 }
        );
      }

      const userName =
        dbUser?.name || photographerProfile?.name || normEmail.split("@")[0];

      // 2. Generate 6-digit OTP (valid for 10 minutes)
      const { otp: generatedOtp } = createOtp(normEmail);

      // 3. Dispatch Email via SMTP or local audit store
      const mailResult = await sendPasswordResetOtpEmail({
        to: normEmail,
        userName,
        otp: generatedOtp,
      });

      return NextResponse.json({
        success: true,
        message:
          "A 6-digit verification code has been dispatched to your email address.",
        mode: mailResult.mode,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: VERIFY OTP
    // -------------------------------------------------------------------------
    if (action === "verify_otp") {
      if (!otp || typeof otp !== "string" || otp.trim().length < 6) {
        return NextResponse.json(
          { error: "Please enter the complete 6-digit verification code." },
          { status: 400 }
        );
      }

      const check = verifyOtp(normEmail, otp);
      if (!check.valid) {
        return NextResponse.json(
          { error: check.error || "Invalid or expired OTP code." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully. You may now enter your new password.",
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 3: RESET PASSWORD (DIRECT DATABASE UPDATE)
    // -------------------------------------------------------------------------
    if (action === "reset_password") {
      if (!otp || typeof otp !== "string" || otp.trim().length < 6) {
        return NextResponse.json(
          { error: "Verification code is required to reset your password." },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      // Verify and consume OTP so it cannot be used again
      const check = consumeOtp(normEmail, otp);
      if (!check.valid) {
        return NextResponse.json(
          { error: check.error || "Invalid or expired OTP code." },
          { status: 400 }
        );
      }

      // Hash the new password using secure SHA-256 with salt
      const newPasswordHash = hashPassword(newPassword.trim());

      // Update password directly in Supabase Database (public.users table)
      const updateOk = await updateUserPasswordInSupabase(normEmail, newPasswordHash);
      if (!updateOk) {
        return NextResponse.json(
          { error: "Could not update password in database. Please verify your connection and try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Your password has been successfully reset in the database! You can now sign in with your new password.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("API /api/auth/forgot-password error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

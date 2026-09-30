import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  updatePhotographerStatusInSupabase,
  fetchAllPhotographersFromSupabase,
  fetchUserByEmailFromSupabase,
} from "@/lib/supabase/service";
import { sendPhotographerApprovalEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photographerId, reason } = body;

    if (!photographerId) {
      return NextResponse.json(
        { error: "Photographer ID is required." },
        { status: 400 }
      );
    }

    // 1. Fetch photographer details from Supabase or local list
    const photographers = await fetchAllPhotographersFromSupabase();
    const targetPhotographer = photographers?.find((p) => p.id === photographerId);

    // 2. Update status in Supabase profiles table
    if (isSupabaseConfigured()) {
      await updatePhotographerStatusInSupabase(photographerId, "approved");
      // Set verified to true
      await supabase
        .from("profiles")
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq("id", photographerId);
    }

    // 3. Update status in Supabase public.users directly
    const emailToMatch = targetPhotographer?.email?.toLowerCase().trim();
    if (emailToMatch && isSupabaseConfigured()) {
      const existingUser = await fetchUserByEmailFromSupabase(emailToMatch);
      if (existingUser) {
        await supabase.rpc("create_or_update_user", {
          p_id: existingUser.id,
          p_name: existingUser.name || targetPhotographer?.name || "Member",
          p_email: emailToMatch,
          p_phone: existingUser.phone || targetPhotographer?.phone || "",
          p_role: "photographer",
          p_status: "active",
          p_city: existingUser.city || targetPhotographer?.city || "Amritsar",
          p_state: existingUser.state || targetPhotographer?.state || "Punjab",
          p_joined_date: existingUser.joinedDate || "Recent",
          p_password_hash: existingUser.passwordHash || "",
        });
      }
    }

    // 4. Send Official Approval Email to the Photographer
    let emailResult = null;
    if (emailToMatch) {
      emailResult = await sendPhotographerApprovalEmail({
        to: emailToMatch,
        photographerName: targetPhotographer?.name || "Visual Artist",
        businessName: targetPhotographer?.businessName || targetPhotographer?.name || "Your Studio",
        slug: targetPhotographer?.slug,
        city: targetPhotographer?.city,
        state: targetPhotographer?.state,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Photographer ${targetPhotographer?.businessName || photographerId} has been successfully approved!`,
      emailSent: emailResult?.success ?? false,
      emailMode: emailResult?.mode || "none",
      recipient: emailToMatch,
    });
  } catch (err: any) {
    console.error("Error approving photographer:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to approve photographer." },
      { status: 500 }
    );
  }
}

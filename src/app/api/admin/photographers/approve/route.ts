import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  updatePhotographerStatusInSupabase,
  fetchAllPhotographersFromSupabase,
} from "@/lib/supabase/service";
import { getServerUsers, saveServerUser } from "@/lib/serverUserStore";
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

    // 3. Update status in Supabase public.users and users.json
    const emailToMatch = targetPhotographer?.email?.toLowerCase().trim();
    if (emailToMatch) {
      if (isSupabaseConfigured()) {
        await supabase
          .from("users")
          .update({ status: "active" })
          .ilike("email", emailToMatch);
      }

      // Update in server user store
      const serverUsers = getServerUsers();
      const userRecord = serverUsers.find((u) => u.email.toLowerCase() === emailToMatch);
      if (userRecord) {
        saveServerUser({
          ...userRecord,
          status: "active",
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

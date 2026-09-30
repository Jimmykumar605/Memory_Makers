import { NextRequest, NextResponse } from "next/server";
import {
  fetchUserByEmailFromSupabase,
  fetchAllPhotographersFromSupabase,
  updateUserEmailInSupabase,
  updatePhotographerStudioInSupabase,
} from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { oldEmail, newEmail, photographerId, role = "photographer" } = body;

    if (!oldEmail || !oldEmail.includes("@")) {
      return NextResponse.json(
        { error: "Current email is missing or invalid." },
        { status: 400 }
      );
    }

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid new email address." },
        { status: 400 }
      );
    }

    const normOld = oldEmail.trim().toLowerCase();
    const normNew = newEmail.trim().toLowerCase();

    if (normOld === normNew) {
      return NextResponse.json({
        success: true,
        message: "Email address is unchanged.",
        email: normNew,
      });
    }

    // 1. Check if newEmail is already taken by a different user in Supabase
    const existingDbUser = await fetchUserByEmailFromSupabase(normNew);
    const allPhotographers = await fetchAllPhotographersFromSupabase();

    const existingPhotographer = allPhotographers?.find(
      (p) => p.email?.toLowerCase() === normNew && p.id !== photographerId
    );

    if (
      (existingDbUser && existingDbUser.email.toLowerCase() !== normOld) ||
      existingPhotographer
    ) {
      return NextResponse.json(
        {
          error:
            "This email address is already in use by another account. Please use a unique email address.",
        },
        { status: 409 }
      );
    }

    // 2. Update email directly in Supabase (both users and profiles tables)
    if (isSupabaseConfigured()) {
      await updateUserEmailInSupabase(normOld, normNew, undefined, photographerId);
      if (photographerId) {
        await updatePhotographerStudioInSupabase(photographerId, {
          email: normNew,
        });
      }
    }

    // 3. Fetch the updated user record directly from Supabase DB
    const updatedUser = await fetchUserByEmailFromSupabase(normNew);
    const targetP = allPhotographers?.find(
      (p) => p.id === photographerId || p.email?.toLowerCase() === normOld
    );

    const safeUser = updatedUser
      ? (({ passwordHash: _, ...rest }) => rest)(updatedUser)
      : {
          id: photographerId || targetP?.id || "usr-" + Date.now(),
          name: targetP?.name || normNew.split("@")[0],
          email: normNew,
          phone: targetP?.phone,
          role: (role as any) || "photographer",
          status: "active",
          city: targetP?.city || "Amritsar",
          state: targetP?.state || "Punjab",
          joinedDate: targetP?.appliedDate || "Recent",
        };

    return NextResponse.json({
      success: true,
      message:
        "Your email address and login ID have been successfully updated in the database.",
      email: normNew,
      user: safeUser,
    });
  } catch (err: any) {
    console.error("API /api/auth/update-email error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update email address." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  createUserInSupabase,
  registerPhotographerInSupabase,
  fetchUserByEmailFromSupabase,
} from "@/lib/supabase/service";
import { hashPassword } from "@/lib/authUtils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role = "client",
      phone = "",
      gender = "other",
      experienceYears = 3,
      city = "New Delhi",
      state = "Delhi NCR",
      businessName,
      startingPrice = 50000,
      tagline = "",
    } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (role === "photographer") {
      const cleanPhone = (phone || "").trim();
      if (!cleanPhone) {
        return NextResponse.json(
          { error: "Mobile number is compulsory for photographer registration." },
          { status: 400 }
        );
      }
      const digitsOnly = cleanPhone.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        return NextResponse.json(
          { error: "Please provide a valid 10-digit mobile number for photographer verification." },
          { status: 400 }
        );
      }
    }

    const normEmail = email.trim().toLowerCase();

    // Prevent self-registration of admin accounts through public signup
    if (role === "admin") {
      return NextResponse.json(
        { error: "Administrator accounts cannot be self-registered via public signup. Please contact the system owner." },
        { status: 403 }
      );
    }

    // 1. Check if email already registered in public.users
    const existing = await fetchUserByEmailFromSupabase(normEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 2. Perform Supabase Auth signup (creates auth.users credentials in DB backend)
    let authUserId: string | null = null;
    if (isSupabaseConfigured() && password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normEmail,
          password: password,
          options: {
            data: {
              full_name: name,
              role: role,
              business_name: businessName || null,
            },
          },
        });
        if (authData?.user) {
          authUserId = authData.user.id;
        }
      } catch (authErr) {
        console.warn("Supabase auth signUp non-fatal error:", authErr);
      }
    }

    // 3. Create record in public.users table in Supabase PostgreSQL
    const hashedPassword = password ? hashPassword(password) : undefined;
    const cleanPhone = phone ? phone.trim() : undefined;
    const userToSave = {
      id: authUserId || "usr-" + Date.now(),
      name,
      email: normEmail,
      phone: cleanPhone,
      gender: gender || "other",
      role: role as any,
      city,
      state,
      passwordHash: hashedPassword,
      status: "active" as const,
      joinedDate: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    };

    const createdUser = await createUserInSupabase(userToSave);

    if (!createdUser) {
      return NextResponse.json(
        {
          error:
            "Could not save user to the Supabase database. Please ensure Row-Level Security (RLS) is disabled or the create_or_update_user procedure is created.",
        },
        { status: 500 }
      );
    }

    // 4. If photographer, create a pending applicant profile in public.profiles table
    let photographerProfile = null;
    if (role === "photographer") {
      const biz = businessName || `${name} Photography`;
      const rawSlug = biz
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      photographerProfile = await registerPhotographerInSupabase({
        name,
        businessName: biz,
        slug: `${rawSlug}-${Date.now().toString().slice(-4)}`,
        email: normEmail,
        phone: cleanPhone || "+91 98000 00000",
        gender: gender || "other",
        experienceYears: Number(experienceYears) || 3,
        status: "pending", // strictly pending for Master Admin approval!
        appliedDate: "Just now (" + new Date().toLocaleDateString("en-IN") + ")",
        city,
        state,
        startingPrice: Number(startingPrice) || 50000,
        tagline: tagline || `Artisan Visual Storyteller • ${city}, ${state}`,
        bio: `Professional wedding and celebration visual artist based in ${city}, ${state}. Awaiting verification.`,
        specialties: ["Wedding", "Pre-Wedding"],
      });
    }

    const safeUser = createdUser
      ? (({ passwordHash: _, ...rest }) => rest)(createdUser)
      : {
          id: authUserId || "usr-" + Date.now(),
          name,
          email: normEmail,
          role,
          status: "active" as const,
          city,
          state,
          joinedDate: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        };

    return NextResponse.json({
      success: true,
      user: safeUser,
      isPendingPhotographer: role === "photographer",
      photographer: photographerProfile,
    });
  } catch (err: any) {
    console.error("API /api/auth/signup error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during account creation." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchUserByEmailFromSupabase,
  fetchAllPhotographersFromSupabase,
  createUserInSupabase,
} from "@/lib/supabase/service";
import { verifyPassword } from "@/lib/authUtils";
import { UserAccount } from "@/lib/types";
import { findServerUserByEmail } from "@/lib/serverUserStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, adminOnly, preferredRole } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    const normEmail = email.trim().toLowerCase();

    // 1. Query dynamic user account from Supabase DB public.users table or persistent store
    let dbUser = await fetchUserByEmailFromSupabase(normEmail);
    if (!dbUser) {
      dbUser = findServerUserByEmail(normEmail) || null;
    }

    // 1b. Check if this email belongs to a photographer in public.profiles!
    let photographerProfile = null;
    let isPendingApproval = false;

    const allPhotographers = await fetchAllPhotographersFromSupabase();
    photographerProfile =
      allPhotographers?.find(
        (p) => p.email?.toLowerCase() === normEmail || (dbUser && p.id === dbUser.id)
      ) || null;

    if (!dbUser && photographerProfile) {
      dbUser = {
        id: photographerProfile.id,
        name: photographerProfile.name,
        email: normEmail,
        phone: photographerProfile.phone,
        role: "photographer",
        status: photographerProfile.status === "approved" ? "active" : "active",
        city: photographerProfile.city,
        state: photographerProfile.state,
        joinedDate: photographerProfile.appliedDate || "2024",
      };
      // Asynchronously sync to public.users table in Supabase
      createUserInSupabase(dbUser).catch(() => { });
    }


    // 3. Authenticate with Supabase Auth if configured and password provided
    let authUser = null;
    if (isSupabaseConfigured() && password) {
      try {
        const { data: authData } = await supabase.auth.signInWithPassword({
          email: normEmail,
          password,
        });
        if (authData?.user) {
          authUser = authData.user;
        }
      } catch (authErr) {
        console.warn("Supabase auth signIn non-fatal:", authErr);
      }
    }

    // If user does not exist anywhere
    if (!dbUser && !authUser) {
      return NextResponse.json(
        {
          error:
            "No account found with this email. Please check your credentials or create a new account.",
        },
        { status: 404 }
      );
    }

    // Build unified active user object from database record
    const activeUser: UserAccount = dbUser || {
      id: authUser?.id || "usr-" + Date.now(),
      name: authUser?.user_metadata?.full_name || normEmail.split("@")[0],
      email: normEmail,
      role: (authUser?.user_metadata?.role as any) || "client",
      status: "active" as const,
      city: "New Delhi",
      state: "Delhi NCR",
      joinedDate: "Recent",
    };

    // 4. Role Assignment & Access Guard (Purely dynamic from DB record)
    if (adminOnly) {
      if (activeUser.role !== "admin") {
        return NextResponse.json(
          {
            error:
              "Access Denied: Only administrator accounts can access the Admin Portal. Please use the Creator / Client sign-in page.",
          },
          { status: 403 }
        );
      }
    } else {
      // Public User & Photographer Login (/login)
      if (activeUser.role === "admin") {
        return NextResponse.json(
          {
            error:
              "Access Denied: Administrator accounts cannot sign in through the public user/photographer portal. Please use the dedicated Master Admin Portal directly.",
          },
          { status: 403 }
        );
      }

      if (preferredRole === "photographer" && photographerProfile) {
        activeUser.role = "photographer";
      }
    }

    // 5. Verify password dynamically against database password hash
    let isValid = false;
    if (activeUser.passwordHash) {
      isValid = verifyPassword(password, activeUser.passwordHash);
    }

    if (!isValid && !authUser) {
      return NextResponse.json(
        {
          error: adminOnly
            ? "Incorrect security passkey for Administrator."
            : "Incorrect password. Please verify and try again.",
        },
        { status: 401 }
      );
    }

    // 5. Check if account is suspended by Master Admin
    if (activeUser.status === "suspended") {
      return NextResponse.json(
        {
          error:
            "This account has been suspended by the Master Administrator. Please contact support.",
        },
        { status: 403 }
      );
    }

    // 6. If photographer, check approval status in public.profiles table
    if (activeUser.role === "photographer") {
      if (!photographerProfile && allPhotographers) {
        photographerProfile =
          allPhotographers.find(
            (p) => p.email?.toLowerCase() === normEmail || p.id === activeUser.id
          ) || null;
      }

      if (photographerProfile) {
        activeUser.photographerStatus = photographerProfile.status || "approved";
        activeUser.businessName = photographerProfile.businessName;
        if (photographerProfile.status === "pending") {
          isPendingApproval = true;
          activeUser.status = "pending";
        }
      }
    }

    // 7. Determine redirect path
    let redirectTo = "/photographers";
    if (activeUser.role === "admin") {
      redirectTo = "/admin";
    } else if (activeUser.role === "photographer") {
      redirectTo = "/dashboard";
    }

    // Strip sensitive password hash before returning user to client
    const { passwordHash: _, ...safeUser } = activeUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
      photographer: activeUser.role === "photographer" ? photographerProfile : null,
      isPendingApproval: activeUser.role === "photographer" ? isPendingApproval : false,
      redirectTo,
    });
  } catch (err: any) {
    console.error("API /api/auth/login error:", err);
    return NextResponse.json(
      { error: err.message || "An authentication error occurred." },
      { status: 500 }
    );
  }
}

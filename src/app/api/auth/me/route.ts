import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchUserByEmailFromSupabase,
  fetchAllPhotographersFromSupabase,
} from "@/lib/supabase/service";
import { findServerUserByEmail } from "@/lib/serverUserStore";

export async function GET(req: NextRequest) {
  try {
    const emailHeader = req.headers.get("x-user-email");
    const roleHeader = req.headers.get("x-user-role");

    if (emailHeader) {
      const normEmail = emailHeader.trim().toLowerCase();
      // 1. Query registered user account from Supabase DB or server user store
      let user = await fetchUserByEmailFromSupabase(normEmail);
      if (!user) {
        user = findServerUserByEmail(normEmail) || null;
      }

      // 2. Only if no user record exists, check if unlinked photographer profile exists
      if (!user) {
        const photographers = await fetchAllPhotographersFromSupabase();
        const p = photographers?.find((item) => item.email?.toLowerCase() === normEmail);
        if (p) {
          user = {
            id: p.id,
            name: p.name,
            email: normEmail,
            phone: p.phone,
            role: "photographer",
            status: p.status === "approved" ? "active" : "active",
            city: p.city,
            state: p.state,
            joinedDate: p.appliedDate || "2024",
          };
        }
      }

      if (user) {
        // Attach dynamic photographer status if role is photographer
        let photographerStatus = "approved";
        let studioBizName: string | undefined = undefined;
        if (user.role === "photographer") {
          const photographers = await fetchAllPhotographersFromSupabase();
          const p = photographers?.find((item) => item.email?.toLowerCase() === normEmail || item.id === user?.id);
          if (p) {
            photographerStatus = p.status || "approved";
            studioBizName = p.businessName;
            if (p.status === "pending") {
              user.status = "pending";
            } else if (p.status === "approved") {
              user.status = "active";
            }
          }
        }

        const { passwordHash: _, ...safeUser } = user;
        return NextResponse.json({
          success: true,
          user: {
            ...safeUser,
            photographerStatus,
            businessName: studioBizName || safeUser.businessName,
          },
        });
      }
    }

    if (isSupabaseConfigured()) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.email) {
        let dbUser = await fetchUserByEmailFromSupabase(user.email);
        if (!dbUser) {
          dbUser = findServerUserByEmail(user.email) || null;
        }
        const safe = dbUser ? (({ passwordHash: _, ...rest }) => rest)(dbUser) : null;
        return NextResponse.json({
          success: true,
          user: safe || {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split("@")[0],
            role: user.user_metadata?.role || "client",
            status: "active",
            city: "New Delhi",
            state: "Delhi NCR",
            joinedDate: "Recent",
          },
        });
      }
    }

    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}

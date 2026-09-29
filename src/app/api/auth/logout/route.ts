import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    return NextResponse.json({ success: true, message: "Logged out successfully." });
  } catch {
    return NextResponse.json({ success: true });
  }
}

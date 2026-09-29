import { NextResponse } from "next/server";
import { getSentEmails } from "@/lib/mailer";

export async function GET() {
  try {
    const list = getSentEmails();
    return NextResponse.json({ success: true, emails: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

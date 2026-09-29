import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchAllPhotographersFromSupabase } from "@/lib/supabase/service";
import { sendPhotographerInquiryEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      photographerId,
      photographerEmail,
      photographerName,
      businessName,
      clientName,
      clientEmail,
      clientPhone,
      occasion,
      eventDate,
      location,
      budget,
      notes,
    } = body;

    if (!photographerId || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: "Photographer ID, Client Name, Email, and Phone are required." },
        { status: 400 }
      );
    }

    // 1. Insert into Supabase 'inquiries' table if configured
    let savedInquiryId = "inq-" + Date.now();
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("inquiries")
        .insert({
          photographer_id: photographerId,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          occasion: occasion || "Wedding",
          event_date: eventDate || null,
          location: location || null,
          budget: budget ? parseFloat(String(budget)) : null,
          notes: notes || null,
          status: "pending",
        })
        .select()
        .single();

      if (data?.id) {
        savedInquiryId = data.id;
      }
    }

    // 2. Resolve Photographer's email & studio details
    let targetEmail = photographerEmail?.trim();
    let targetPhotographerName = photographerName || "Visual Artist";
    let targetBusinessName = businessName || "Your Studio";

    if (!targetEmail) {
      // Look up photographer in Supabase profiles or cache
      const photographers = await fetchAllPhotographersFromSupabase();
      const matched = photographers?.find((p) => p.id === photographerId);
      if (matched) {
        targetEmail = matched.email?.trim();
        targetPhotographerName = matched.name || targetPhotographerName;
        targetBusinessName = matched.businessName || targetBusinessName;
      }
    }

    // 3. Send Notification Email to the Photographer
    let emailResult = null;
    if (targetEmail) {
      emailResult = await sendPhotographerInquiryEmail({
        to: targetEmail,
        photographerName: targetPhotographerName,
        businessName: targetBusinessName,
        clientName,
        clientEmail,
        clientPhone,
        occasion: occasion || "Wedding",
        eventDate: eventDate || "Date to be confirmed",
        venueLocation: location || "To be confirmed",
        budget: budget ? String(budget) : undefined,
        notes: notes || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      inquiryId: savedInquiryId,
      message: "Inquiry recorded successfully.",
      emailSent: emailResult?.success ?? false,
      emailMode: emailResult?.mode || "none",
      recipient: targetEmail || "Not on file",
    });
  } catch (err: any) {
    console.error("Error processing booking inquiry:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to submit booking inquiry." },
      { status: 500 }
    );
  }
}

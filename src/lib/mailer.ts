import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export interface SentEmailRecord {
  id: string;
  recipient: string;
  subject: string;
  photographerName: string;
  businessName: string;
  sentAt: string;
  status: "delivered" | "dispatched_local" | "failed";
  error?: string;
  previewHtml?: string;
  type?: "approval" | "inquiry";
}

const DATA_DIR = path.join(process.cwd(), "data");
const SENT_EMAILS_FILE = path.join(DATA_DIR, "sent_emails.json");

function ensureSentEmailsFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SENT_EMAILS_FILE)) {
      fs.writeFileSync(SENT_EMAILS_FILE, JSON.stringify([]), "utf8");
    }
  } catch (err) {
    console.warn("Could not initialize sent emails store:", err);
  }
}

export function getSentEmails(): SentEmailRecord[] {
  try {
    ensureSentEmailsFile();
    if (!fs.existsSync(SENT_EMAILS_FILE)) return [];
    const raw = fs.readFileSync(SENT_EMAILS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSentEmailRecord(record: SentEmailRecord): void {
  try {
    ensureSentEmailsFile();
    const list = getSentEmails();
    list.unshift(record);
    fs.writeFileSync(SENT_EMAILS_FILE, JSON.stringify(list.slice(0, 100), null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save sent email record:", err);
  }
}

// -----------------------------------------------------------------------------
// Internal Dispatch Helper (SMTP or Local Audit Log)
// -----------------------------------------------------------------------------
async function dispatchEmail(params: {
  to: string;
  subject: string;
  textContent: string;
  htmlContent: string;
  photographerName: string;
  businessName: string;
  type: "approval" | "inquiry";
}): Promise<{
  success: boolean;
  messageId?: string;
  mode: "smtp" | "local_store";
  error?: string;
}> {
  const { to, subject, textContent, htmlContent, photographerName, businessName, type } = params;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"MemoryMakers Curation" <admin@memorymakers.com>`;

  const emailRecord: SentEmailRecord = {
    id: "email-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    recipient: to,
    subject,
    photographerName,
    businessName,
    sentAt: new Date().toISOString(),
    status: "dispatched_local",
    previewHtml: htmlContent,
    type,
  };

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      emailRecord.status = "delivered";
      saveSentEmailRecord(emailRecord);

      return {
        success: true,
        messageId: info.messageId,
        mode: "smtp",
      };
    } catch (err: any) {
      console.warn("SMTP send failed, saving to local audit record:", err?.message || err);
      emailRecord.status = "failed";
      emailRecord.error = err?.message || "SMTP connection failed";
      saveSentEmailRecord(emailRecord);
      return {
        success: false,
        error: err?.message,
        mode: "smtp",
      };
    }
  }

  // Local fallback storage & audit
  saveSentEmailRecord(emailRecord);
  return {
    success: true,
    messageId: emailRecord.id,
    mode: "local_store",
  };
}

// -----------------------------------------------------------------------------
// 1. Photographer Approval Email
// -----------------------------------------------------------------------------
export interface SendApprovalEmailParams {
  to: string;
  photographerName: string;
  businessName: string;
  slug?: string;
  city?: string;
  state?: string;
}

export async function sendPhotographerApprovalEmail(params: SendApprovalEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  mode: "smtp" | "local_store";
  error?: string;
}> {
  const { to, photographerName, businessName, slug, city = "Punjab", state = "India" } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/dashboard`;
  const profileUrl = slug ? `${baseUrl}/photographer/${slug}` : `${baseUrl}/photographers`;

  const subject = `🎉 Congratulations! Your MemoryMakers Account Has Been Approved (${businessName})`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved - MemoryMakers</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #040507; color: #e4e4e7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #080d0a; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #06160e 0%, #0d281a 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid rgba(16, 185, 129, 0.2); }
    .logo-badge { display: inline-block; padding: 8px 18px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(52, 211, 153, 0.4); color: #34d399; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; font-family: Georgia, serif; }
    .subtitle { color: #a1a1aa; font-size: 13px; margin-top: 8px; }
    .body { padding: 32px 30px; }
    .greeting { font-size: 16px; color: #f4f4f5; font-weight: 600; margin-bottom: 16px; }
    .paragraph { font-size: 14px; line-height: 1.65; color: #a1a1aa; margin-bottom: 20px; }
    .status-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 14px; padding: 20px; margin: 24px 0; }
    .status-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 13px; }
    .status-row:last-child { border-bottom: none; }
    .label { color: #71717a; font-weight: 500; }
    .value { color: #ffffff; font-weight: 600; text-align: right; }
    .badge-approved { background: rgba(52, 211, 153, 0.2); color: #34d399; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
    .next-steps-box { background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 14px; padding: 18px 20px; margin: 24px 0; font-size: 13px; }
    .next-steps-title { color: #34d399; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
    .next-step-item { color: #d4d4d8; line-height: 1.6; margin-bottom: 6px; }
    .cta-container { text-align: center; margin: 32px 0 24px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }
    .secondary-link { display: block; text-align: center; margin-top: 14px; font-size: 12px; color: #34d399; text-decoration: none; }
    .footer { background: #040605; padding: 24px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #52525b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">Official Verification Notice</div>
      <h1 class="title">Your Account Has Been Approved!</h1>
      <p class="subtitle">Welcome to the MemoryMakers Elite Visual Artisans Directory</p>
    </div>
    
    <div class="body">
      <p class="greeting">Dear ${photographerName || "Visual Artist"},</p>
      <p class="paragraph">
        Great news! Your creator account and studio application for <strong style="color: #34d399;">${businessName}</strong> have been <strong>officially approved</strong> by the MemoryMakers curation team. Your studio profile is now verified and published live on our marketplace!
      </p>

      <div class="status-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
          <tr>
            <td style="color: #71717a;">Studio Business Name</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${businessName}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Lead Photographer</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${photographerName}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Location Hub</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${city}, ${state}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Marketplace Status</td>
            <td style="text-align: right;"><span class="badge-approved">VERIFIED & LIVE</span></td>
          </tr>
        </table>
      </div>

      <div class="next-steps-box">
        <div class="next-steps-title">What you can update right now:</div>
        <div class="next-step-item">✅ <strong>Update Your Studio Profile:</strong> Add your biography, awards, gear list, and studio mobile number.</div>
        <div class="next-step-item">✅ <strong>Upload Portfolio Albums:</strong> Showcase your best wedding, pre-wedding, and cultural shots in full resolution.</div>
        <div class="next-step-item">✅ <strong>Manage Pricing & Packages:</strong> Set up transparent packages and deliverables for interested clients.</div>
        <div class="next-step-item">✅ <strong>Receive Direct Bookings:</strong> Clients can now send inquiry requests directly to your studio inbox.</div>
      </div>

      <div class="cta-container">
        <a href="${dashboardUrl}" class="cta-btn">Update Profile & Studio Dashboard →</a>
        <a href="${profileUrl}" class="secondary-link">Preview Your Live Marketplace Profile</a>
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} MemoryMakers Inc. All rights reserved.</p>
      <p>This curation notice was sent to ${to}. For concierge assistance, email admin@memorymakers.com</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Congratulations ${photographerName}!
Your MemoryMakers studio account for ${businessName} has been officially approved!

Your studio profile is now live on MemoryMakers (${city}, ${state}).
You can now update your profile, upload your portfolio albums, manage pricing packages, and start receiving direct inquiries.

Access your Studio Dashboard: ${dashboardUrl}
Preview your public profile: ${profileUrl}

Welcome to MemoryMakers!
  `;

  return dispatchEmail({
    to,
    subject,
    textContent,
    htmlContent,
    photographerName,
    businessName,
    type: "approval",
  });
}

// -----------------------------------------------------------------------------
// 2. New Booking Inquiry Email (Notifies Photographer of Client Request)
// -----------------------------------------------------------------------------
export interface SendInquiryEmailParams {
  to: string;
  photographerName: string;
  businessName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  occasion: string;
  eventDate?: string;
  venueLocation?: string;
  budget?: string | number;
  notes?: string;
}

export async function sendPhotographerInquiryEmail(params: SendInquiryEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  mode: "smtp" | "local_store";
  error?: string;
}> {
  const {
    to,
    photographerName,
    businessName,
    clientName,
    clientEmail,
    clientPhone,
    occasion,
    eventDate = "Date to be confirmed",
    venueLocation = "Not specified",
    budget,
    notes,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/dashboard`;
  const cleanPhone = clientPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hi ${clientName}, thank you for inquiring about ${businessName} on MemoryMakers! I'd love to discuss your ${occasion} photography plans.`
  )}`;

  const subject = `✨ New Booking Inquiry from ${clientName} (${occasion} Photography) - MemoryMakers`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Inquiry - MemoryMakers</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #040507; color: #e4e4e7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #080d0a; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #06160e 0%, #0d281a 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid rgba(16, 185, 129, 0.2); }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 9999px; background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.4); color: #34d399; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 10px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; font-family: Georgia, serif; }
    .subtitle { color: #a1a1aa; font-size: 13px; margin-top: 8px; }
    .body { padding: 32px 30px; }
    .greeting { font-size: 15px; color: #f4f4f5; font-weight: 600; margin-bottom: 16px; }
    .paragraph { font-size: 14px; line-height: 1.65; color: #a1a1aa; margin-bottom: 20px; }
    .client-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 22px; margin: 24px 0; }
    .card-title { color: #34d399; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    .info-row:last-child { border-bottom: none; }
    .label { color: #71717a; font-weight: 500; }
    .value { color: #ffffff; font-weight: 600; text-align: right; }
    .notes-box { background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 12px 14px; margin-top: 14px; font-size: 13px; color: #d4d4d8; font-style: italic; border-left: 3px solid #34d399; }
    .actions-grid { display: flex; gap: 10px; margin: 28px 0 16px 0; flex-wrap: wrap; justify-content: center; }
    .btn-whatsapp { display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .btn-call { display: inline-block; background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.4); color: #34d399; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 700; font-size: 12px; text-transform: uppercase; }
    .btn-dashboard { display: block; text-align: center; margin-top: 14px; font-size: 12px; color: #a1a1aa; text-decoration: underline; }
    .footer { background: #040605; padding: 24px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #52525b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">New Booking Inquiry</div>
      <h1 class="title">A Client Inquired to Book You!</h1>
      <p class="subtitle">Direct client inquiry submitted via your MemoryMakers profile</p>
    </div>

    <div class="body">
      <p class="greeting">Hello ${photographerName || "Artist"},</p>
      <p class="paragraph">
        You have received a new booking inquiry for <strong style="color: #34d399;">${businessName}</strong>! 
        <strong style="color: #ffffff;">${clientName}</strong> wants to book your photography services. 
        Please review their details below and contact them promptly to confirm availability and discuss package pricing.
      </p>

      <div class="client-card">
        <div class="card-title">Client Contact & Celebration Details</div>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
          <tr>
            <td style="color: #71717a;">Client Name:</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${clientName}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Client Mobile / WhatsApp:</td>
            <td style="color: #34d399; font-weight: 600; text-align: right;"><a href="tel:${cleanPhone}" style="color: #34d399; text-decoration: none;">${clientPhone}</a></td>
          </tr>
          <tr>
            <td style="color: #71717a;">Client Email:</td>
            <td style="color: #ffffff; text-align: right;"><a href="mailto:${clientEmail}" style="color: #ffffff; text-decoration: underline;">${clientEmail}</a></td>
          </tr>
          <tr>
            <td style="color: #71717a;">Celebration Occasion:</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${occasion}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Requested Event Date:</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${eventDate}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Venue / City:</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${venueLocation}</td>
          </tr>
          ${
            budget
              ? `<tr>
            <td style="color: #71717a;">Estimated Budget:</td>
            <td style="color: #34d399; font-weight: 600; text-align: right;">₹${Number(budget).toLocaleString("en-IN")}</td>
          </tr>`
              : ""
          }
        </table>

        ${
          notes
            ? `<div style="margin-top: 14px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 600;">Client Vision & Notes:</div>
                <div class="notes-box">"${notes}"</div>
              </div>`
            : ""
        }
      </div>

      <p class="paragraph" style="font-size: 13px;">
        💡 <strong>Pro Tip:</strong> Reaching out to the client within the first 2 hours increases your booking conversion rate by over 70%.
      </p>

      <div class="actions-grid">
        ${cleanPhone ? `<a href="${whatsappUrl}" class="btn-whatsapp">💬 Message on WhatsApp</a>` : ""}
        ${cleanPhone ? `<a href="tel:${cleanPhone}" class="btn-call">📞 Call Client</a>` : ""}
        <a href="mailto:${clientEmail}?subject=Re:%20Booking%20Inquiry%20for%20${encodeURIComponent(businessName)}" class="btn-call">✉️ Email Client</a>
      </div>

      <a href="${dashboardUrl}" class="btn-dashboard">Open Studio Dashboard to Manage Inquiries →</a>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} MemoryMakers Inc. All rights reserved.</p>
      <p>This booking alert was dispatched to ${to}. Need support? Email admin@memorymakers.com</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
New Booking Inquiry Received for ${businessName}!

Client Details:
- Name: ${clientName}
- Mobile/WhatsApp: ${clientPhone}
- Email: ${clientEmail}
- Occasion: ${occasion}
- Event Date: ${eventDate}
- Venue/Location: ${venueLocation}
${budget ? `- Estimated Budget: ₹${budget}` : ""}
${notes ? `- Client Notes: "${notes}"` : ""}

Please contact the client promptly to confirm availability and discuss package options.
Access your Studio Dashboard: ${dashboardUrl}
  `;

  return dispatchEmail({
    to,
    subject,
    textContent,
    htmlContent,
    photographerName,
    businessName,
    type: "inquiry",
  });
}

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

  const subject = `🎉 Congratulations! Your MemoryMakers Studio Application is Approved (${businessName})`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Approved - MemoryMakers</title>
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
      <h1 class="title">Application Approved!</h1>
      <p class="subtitle">Welcome to the MemoryMakers Elite Visual Artisans Directory</p>
    </div>
    
    <div class="body">
      <p class="greeting">Dear ${photographerName || "Creator"},</p>
      <p class="paragraph">
        We are thrilled to inform you that your application for <strong style="color: #34d399;">${businessName}</strong> has been officially approved by the Master Administrator. Your studio profile is now active and published on MemoryMakers!
      </p>

      <div class="status-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
          <tr>
            <td style="color: #71717a;">Studio Name</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${businessName}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Location</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${city}, ${state}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Verification Status</td>
            <td style="text-align: right;"><span class="badge-approved">APPROVED & VERIFIED</span></td>
          </tr>
          <tr>
            <td style="color: #71717a;">Dashboard Access</td>
            <td style="color: #34d399; font-weight: 600; text-align: right;">Unlocked</td>
          </tr>
        </table>
      </div>

      <p class="paragraph">
        Your Creator Studio Workspace is now unlocked. You can now log in, upload your high-resolution portfolio albums, configure your wedding and pre-wedding packages, manage camera gear, and start receiving direct inquiries from discerning clients.
      </p>

      <div class="cta-container">
        <a href="${dashboardUrl}" class="cta-btn">Access Studio Dashboard →</a>
        <a href="${profileUrl}" class="secondary-link">Preview Your Public Marketplace Profile</a>
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} MemoryMakers Inc. All rights reserved.</p>
      <p>This is an automated curation notification sent to ${to}. For inquiries, contact concierge@memorymakers.art</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Congratulations ${photographerName}!
Your studio application for ${businessName} has been approved by the Master Administrator.

Your studio profile is now live on MemoryMakers (${city}, ${state}).
Access your Creator Studio Workspace here: ${dashboardUrl}
View your public profile: ${profileUrl}

Welcome to MemoryMakers!
  `;

  // 1. Check if SMTP configuration exists in environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"MemoryMakers Curation" <admin@memorymakers.com>`;

  let emailRecord: SentEmailRecord = {
    id: "email-" + Date.now(),
    recipient: to,
    subject,
    photographerName,
    businessName,
    sentAt: new Date().toISOString(),
    status: "dispatched_local",
    previewHtml: htmlContent,
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
      console.warn("SMTP send failed, falling back to local dispatch record:", err?.message || err);
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

  // Local fallback dispatch & storage
  saveSentEmailRecord(emailRecord);
  return {
    success: true,
    messageId: emailRecord.id,
    mode: "local_store",
  };
}

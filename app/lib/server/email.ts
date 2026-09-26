import nodemailer from "nodemailer";
import {
  passwordChangedEmailContent,
  passwordResetEmailContent,
  welcomeEmailContent,
} from "./email-templates";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}

function transporter() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set in .env.local");
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

function fromAddress(): string {
  const user = process.env.SMTP_USER!.trim();
  const configured = process.env.SMTP_FROM?.trim();
  // Gmail requires From to match the authenticated account (or verified alias)
  if (configured && configured.toLowerCase().includes(user.toLowerCase())) {
    return configured;
  }
  return `IMTIAZ BIOS <${user}>`;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email not configured (set SMTP_USER and SMTP_PASS)" };
  }
  try {
    await transporter().sendMail({
      from: fromAddress(),
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    console.error("[email]", message);
    return { ok: false, error: message };
  }
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  trialEndDate?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const content = welcomeEmailContent(name, trialEndDate);
  return sendMail({ to, ...content });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  name?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const content = passwordResetEmailContent(name, resetUrl);
  return sendMail({ to, ...content });
}

export async function sendPasswordChangedEmail(
  to: string,
  name?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const content = passwordChangedEmailContent(name);
  return sendMail({ to, ...content });
}

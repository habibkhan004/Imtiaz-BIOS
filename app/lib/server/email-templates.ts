/** Branded HTML email templates — dark cyan IMTIAZ BIOS theme (inline CSS for clients). */

const COLORS = {
  bg: "#071018",
  card: "#0c1a24",
  border: "rgba(0, 212, 255, 0.22)",
  cyan: "#00d4ff",
  cyanDark: "#0099cc",
  text: "#e8f4fa",
  muted: "#8aa4b5",
  gold: "#d4a84b",
};

function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function brandMarkHtml(): string {
  const customLogo = process.env.EMAIL_LOGO_URL?.trim();
  const mark = customLogo
    ? `<img src="${escapeHtml(customLogo)}" width="56" height="56" alt="IMTIAZ BIOS" style="display:block;margin:0 auto;border:0;border-radius:12px;" />`
    : `<div style="width:48px;height:48px;margin:0 auto;border-radius:10px;border:2px solid ${COLORS.cyan};background:linear-gradient(145deg, rgba(0,212,255,0.25), rgba(0,153,204,0.08));line-height:48px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:${COLORS.cyan};letter-spacing:0.5px;">IB</div>`;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
      <tr>
        <td align="center" style="padding:0;">${mark}</td>
      </tr>
      <tr>
        <td align="center" style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;">
          <div style="font-size:20px;font-weight:700;letter-spacing:1px;color:${COLORS.text};">IMTIAZ <span style="color:${COLORS.cyan};">BIOS</span></div>
          <div style="font-size:11px;color:${COLORS.muted};letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;">Advanced Repair Lab</div>
        </td>
      </tr>
    </table>`;
}

function layout(opts: {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}): string {
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
        <tr>
          <td align="center" style="border-radius:10px;background:linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.cyanDark});">
            <a href="${escapeHtml(opts.ctaHref)}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#041018;text-decoration:none;letter-spacing:0.3px;">${escapeHtml(opts.ctaLabel)}</a>
          </td>
        </tr>
      </table>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.cyanDark}, ${COLORS.gold});"></td>
          </tr>
          <tr>
            <td style="padding:32px 28px 12px;">
              ${brandMarkHtml()}
              <h1 style="margin:8px 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:${COLORS.text};text-align:center;">${opts.title}</h1>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${COLORS.muted};text-align:left;">
                ${opts.bodyHtml}
              </div>
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${COLORS.muted};text-align:center;border-top:1px solid ${COLORS.border};">
              <p style="margin:16px 0 0;">© ${new Date().getFullYear()} IMTIAZ BIOS · Advanced Repair Lab</p>
              <p style="margin:6px 0 0;"><a href="${escapeHtml(appUrl())}" style="color:${COLORS.cyan};text-decoration:none;">${escapeHtml(appUrl())}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailContent(name: string, trialEndDate?: string) {
  const portalUrl = `${appUrl()}/portal`;
  const safeName = escapeHtml(name.trim() || "Technician");
  const trialLine = trialEndDate
    ? `<p style="margin:0 0 14px;">Your introductory access is active until <strong style="color:${COLORS.cyan};">${escapeHtml(new Date(trialEndDate).toLocaleDateString())}</strong>.</p>`
    : "";

  const html = layout({
    preheader: `Welcome to IMTIAZ BIOS, ${name.trim() || "friend"}. Your account is ready.`,
    title: "Account created successfully",
    bodyHtml: `
      <p style="margin:0 0 14px;color:${COLORS.text};">Dear <strong style="color:${COLORS.cyan};">${safeName}</strong>,</p>
      <p style="margin:0 0 14px;">Your account in <strong style="color:${COLORS.text};">IMTIAZ BIOS</strong> is successfully created.</p>
      <p style="margin:0 0 14px;">You can now browse the library, request files, upload dumps for review, and manage your portal.</p>
      ${trialLine}
      <p style="margin:0;">If you did not create this account, contact support right away.</p>
    `,
    ctaLabel: "Open your portal",
    ctaHref: portalUrl,
  });

  const text = [
    `Dear ${name.trim() || "Technician"},`,
    ``,
    `Your account in IMTIAZ BIOS is successfully created.`,
    trialEndDate
      ? `Introductory access until: ${new Date(trialEndDate).toLocaleDateString()}`
      : "",
    ``,
    `Open your portal: ${portalUrl}`,
    ``,
    `— IMTIAZ BIOS Advanced Repair Lab`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: "Welcome to IMTIAZ BIOS — account created",
    html,
    text,
  };
}

export function passwordResetEmailContent(name: string | undefined, resetUrl: string) {
  const safeName = escapeHtml((name || "there").trim());
  const html = layout({
    preheader: "Reset your IMTIAZ BIOS password — link expires in 1 hour.",
    title: "Reset your password",
    bodyHtml: `
      <p style="margin:0 0 14px;color:${COLORS.text};">Dear <strong style="color:${COLORS.cyan};">${safeName}</strong>,</p>
      <p style="margin:0 0 14px;">We received a request to reset the password for your <strong style="color:${COLORS.text};">IMTIAZ BIOS</strong> account.</p>
      <p style="margin:0 0 14px;">Click the button below to choose a new password. This link is <strong style="color:${COLORS.gold};">single-use</strong> and expires in <strong style="color:${COLORS.gold};">1 hour</strong>.</p>
      <p style="margin:0 0 14px;font-size:13px;word-break:break-all;">Or paste this URL into your browser:<br/><a href="${escapeHtml(resetUrl)}" style="color:${COLORS.cyan};">${escapeHtml(resetUrl)}</a></p>
      <p style="margin:0;">If you did not request a reset, you can safely ignore this email — your password will stay the same.</p>
    `,
    ctaLabel: "Reset password",
    ctaHref: resetUrl,
  });

  const text = [
    `Dear ${name || "there"},`,
    ``,
    `Reset your IMTIAZ BIOS password (valid 1 hour, single use):`,
    resetUrl,
    ``,
    `If you did not request this, ignore this email.`,
    ``,
    `— IMTIAZ BIOS Advanced Repair Lab`,
  ].join("\n");

  return {
    subject: "Reset your IMTIAZ BIOS password",
    html,
    text,
  };
}

export function passwordChangedEmailContent(name: string | undefined) {
  const loginUrl = `${appUrl()}/login`;
  const safeName = escapeHtml((name || "there").trim());
  const html = layout({
    preheader: "Your IMTIAZ BIOS password was updated successfully.",
    title: "Password updated",
    bodyHtml: `
      <p style="margin:0 0 14px;color:${COLORS.text};">Dear <strong style="color:${COLORS.cyan};">${safeName}</strong>,</p>
      <p style="margin:0 0 14px;">Your <strong style="color:${COLORS.text};">IMTIAZ BIOS</strong> password was reset successfully.</p>
      <p style="margin:0;">You can sign in with your new password anytime.</p>
    `,
    ctaLabel: "Sign in",
    ctaHref: loginUrl,
  });
  const text = [
    `Dear ${name || "there"},`,
    ``,
    `Your IMTIAZ BIOS password was reset successfully.`,
    `Sign in: ${loginUrl}`,
    ``,
    `— IMTIAZ BIOS Advanced Repair Lab`,
  ].join("\n");
  return {
    subject: "Your IMTIAZ BIOS password was updated",
    html,
    text,
  };
}

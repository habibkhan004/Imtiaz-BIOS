const TELEGRAM_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/IMTIAZBIOS1";
const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/10000000000";

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M9.04 15.29 8.9 19.1c.3 0 .43-.13.59-.29l1.42-1.36 2.94 2.16c.54.3 1.09.14 1.26-.5l2.28-10.74c.2-.9-.33-1.25-.91-.99L4.3 11.3c-.87.34-.86.82-.15 1.04l3.73 1.16 8.66-5.45c.41-.27.78-.12.47.15z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.04 21.6h-.02a9.57 9.57 0 0 1-4.87-1.33l-.35-.21-3.62.95.97-3.53-.23-.36a9.56 9.56 0 0 1-1.46-5.1 9.6 9.6 0 0 1 9.6-9.58c2.56 0 4.97 1 6.78 2.81a9.53 9.53 0 0 1 2.8 6.77 9.6 9.6 0 0 1-9.6 9.58zm0-17.54a7.94 7.94 0 0 0-7.94 7.93c0 1.4.37 2.76 1.06 3.96l.16.27-.63 2.29 2.35-.62.26.15a7.9 7.9 0 0 0 4.74 1.54h.01a7.94 7.94 0 0 0 7.94-7.93 7.9 7.9 0 0 0-2.33-5.61 7.9 7.9 0 0 0-5.62-2.33z"
      />
    </svg>
  );
}

export function FloatingContactButtons() {
  return (
    <div className="floating-contact" aria-label="Quick contact">
      <a
        href={TELEGRAM_URL}
        className="floating-contact-btn floating-telegram"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on Telegram"
        title="Telegram"
      >
        <TelegramIcon />
      </a>
      <a
        href={WHATSAPP_URL}
        className="floating-contact-btn floating-whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="WhatsApp"
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}

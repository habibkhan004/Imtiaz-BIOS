import { Suspense } from "react";
import { ContactForm } from "../components/contact/ContactForm";
import { SiteShell } from "../components/SiteShell";

export const metadata = {
  title: "Contact",
  description: "Open a BIOS file or unlock request with IMTIAZ BIOS.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">CONTACT</span>
            <h2>
              Open a <span className="gradient-cyan">request</span>
            </h2>
            <p>Send the board number and what you need — or reach us on Telegram.</p>
          </div>
          <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading form…</p>}>
            <ContactForm />
          </Suspense>
        </div>
      </section>
    </SiteShell>
  );
}

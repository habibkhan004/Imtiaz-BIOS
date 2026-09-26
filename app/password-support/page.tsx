import { SiteShell } from "../components/SiteShell";
import { PasswordSupportForm } from "../components/portal/PasswordSupportForm";

export const metadata = {
  title: "Password / firmware support",
  description:
    "Authorized password and firmware support requests for hardware you own or are authorized to service.",
};

export default function PasswordSupportPage() {
  return (
    <SiteShell>
      <section className="auth-section">
        <div className="auth-wrap" style={{ maxWidth: 640 }}>
          <div className="auth-card reveal">
            <div className="auth-card-head">
              <h1>
                Password <span className="gradient-cyan">support</span>
              </h1>
              <p>
                Firmware / BIOS password assistance. You must confirm ownership or
                authorization before submit (FR-22).
              </p>
            </div>
            <PasswordSupportForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

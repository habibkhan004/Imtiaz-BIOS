import { SiteShell } from "../components/SiteShell";
import { ResetPasswordForm } from "../components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset password",
  description: "Choose a new password for your IMTIAZ BIOS account.",
};

export default function ResetPasswordPage() {
  return (
    <SiteShell>
      <section className="auth-section">
        <div className="auth-wrap">
          <div className="auth-card reveal">
            <div className="auth-card-head">
              <h1>
                Choose a <span className="gradient-cyan">new password</span>
              </h1>
              <p>This link works once and expires after one hour.</p>
            </div>
            <ResetPasswordForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

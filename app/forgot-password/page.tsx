import { SiteShell } from "../components/SiteShell";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot password",
  description: "Reset your IMTIAZ BIOS account password.",
};

export default function ForgotPasswordPage() {
  return (
    <SiteShell>
      <section className="auth-section">
        <div className="auth-wrap">
          <div className="auth-card reveal">
            <div className="auth-card-head">
              <h1>
                Reset <span className="gradient-cyan">password</span>
              </h1>
              <p>We will email a one-time link if the account exists.</p>
            </div>
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

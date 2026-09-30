import { Suspense } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { SiteShell } from "../components/SiteShell";
import { LoginForm } from "../components/auth/LoginForm";

export const metadata = {
  title: "Login",
  description: "Sign in to IMTIAZ BIOS.",
};

export default function LoginPage() {
  return (
    <SiteShell>
      <section className="auth-section">
        <div className="auth-wrap">
          <div className="auth-card reveal">
            <BrandLogo
              className="logo auth-logo"
              subtitle="Advanced Repair Lab"
              gradId="loginLogoGrad"
            />
            <div className="auth-card-head">
              <h1>
                Welcome <span className="gradient-cyan">back</span>
              </h1>
              <p>Sign in to access your library and portal.</p>
            </div>
            <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

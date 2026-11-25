import { BrandLogo } from "../components/BrandLogo";
import { SiteShell } from "../components/SiteShell";
import { RegisterForm } from "../components/auth/RegisterForm";

export const metadata = {
  title: "Register",
  description: "Create an IMTIAZ BIOS account.",
};

export default function RegisterPage() {
  return (
    <SiteShell>
      <section className="auth-section">
        <div className="auth-wrap">
          <div className="auth-card reveal">
            <BrandLogo
              className="logo auth-logo"
              subtitle="Advanced Repair Lab"
              gradId="registerLogoGrad"
            />
            <div className="auth-card-head">
              <h1>
                Create your <span className="gradient-cyan">account</span>
              </h1>
              <p>Sign up to request files and manage downloads.</p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

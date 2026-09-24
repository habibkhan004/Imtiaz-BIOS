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
            <div className="logo auth-logo">
              <svg className="logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden>
                <rect
                  x="8"
                  y="8"
                  width="18"
                  height="18"
                  rx="3"
                  stroke="url(#registerLogoGrad)"
                  strokeWidth="2"
                />
                <rect
                  x="13"
                  y="13"
                  width="8"
                  height="8"
                  rx="2"
                  fill="url(#registerLogoGrad)"
                />
                <path
                  d="M12 2V8M17 2V8M22 2V8M12 26V32M17 26V32M22 26V32M2 12H8M2 17H8M2 22H8M26 12H32M26 17H32M26 22H32"
                  stroke="#4a6a8a"
                  strokeWidth="1.4"
                />
                <defs>
                  <linearGradient
                    id="registerLogoGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#0099cc" />
                  </linearGradient>
                </defs>
              </svg>
              <span>
                <span className="logo-text">IMTIAZ BIOS</span>
                <small>Advanced Repair Lab</small>
              </span>
            </div>
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

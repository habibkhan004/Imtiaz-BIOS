import { Suspense } from "react";
import { SiteShell } from "../components/SiteShell";
import { LoginForm } from "../components/auth/LoginForm";

export const metadata = {
  title: "Login",
  description: "Sign in to IMTIAZ BIOS.",
};

function AuthLogo({ gradientId }: { gradientId: string }) {
  return (
    <div className="logo auth-logo">
      <svg className="logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden>
        <rect
          x="8"
          y="8"
          width="18"
          height="18"
          rx="3"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
        />
        <rect
          x="13"
          y="13"
          width="8"
          height="8"
          rx="2"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M12 2V8M17 2V8M22 2V8M12 26V32M17 26V32M22 26V32M2 12H8M2 17H8M2 22H8M26 12H32M26 17H32M26 22H32"
          stroke="#4a6a8a"
          strokeWidth="1.4"
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
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
  );
}

export default function LoginPage() {
  return (
    <SiteShell>
      <section className="auth-section">
        <div className="auth-wrap">
          <div className="auth-card reveal">
            <AuthLogo gradientId="loginLogoGrad" />
            <div className="auth-card-head">
              <h1>
                Welcome <span className="gradient-cyan">back</span>
              </h1>
              <p>Sign in to open your customer portal.</p>
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

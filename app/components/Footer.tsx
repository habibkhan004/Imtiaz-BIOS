import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer>
      <div className="wrap footer-row">
        <BrandLogo
          href="/"
          className="logo"
          gradId="footerLogoGrad"
          showMark
        />
        <span className="footer-copy">
          © 2026 IMTIAZ BIOS. For lawful repair use on hardware you own or service
          with authorization.
        </span>
      </div>
    </footer>
  );
}

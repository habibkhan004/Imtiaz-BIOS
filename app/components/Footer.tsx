import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="wrap footer-row">
        <span className="logo">
          <span className="logo-text">IMTIAZ BIOS</span>
        </span>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/library">Library</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/testimonials">Testimonials</Link>
          <Link href="/login">Login</Link>
          <a
            href="https://t.me/IMTIAZBIOS1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>
        </div>
        <span className="footer-copy">
          © 2026 IMTIAZ BIOS. For lawful repair use on hardware you own or service
          with authorization.
        </span>
      </div>
    </footer>
  );
}

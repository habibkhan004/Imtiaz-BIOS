import type { ReactNode } from "react";
import { FloatingContactButtons } from "./FloatingContactButtons";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Loader } from "./Loader";
import { Particles } from "./Particles";
import { ScrollTop } from "./ScrollTop";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Loader />
      <Particles />
      <Header />
      <main id="top" className="site-main">
        {children}
      </main>
      <Footer />
      <FloatingContactButtons />
      <ScrollTop />
    </>
  );
}

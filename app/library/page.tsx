import { Suspense } from "react";
import { LibraryBrowser } from "../components/library/LibraryBrowser";
import { SiteShell } from "../components/SiteShell";

export const metadata = {
  title: "File Library",
  description:
    "Search and filter verified BIOS dumps, boardviews, schematics, and EC firmware.",
};

export default function LibraryPage() {
  return (
    <SiteShell>
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">FILE LIBRARY</span>
            <h2>
              Find a tested file, or{" "}
              <span className="gradient-gold">request one</span>
            </h2>
            <p>
              Search by board number and filter by brand, type, category, and
              verification status.
            </p>
          </div>
          <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading library…</p>}>
            <LibraryBrowser />
          </Suspense>
        </div>
      </section>
    </SiteShell>
  );
}

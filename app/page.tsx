import { Hero } from "./components/Hero";
import {
  HomeCategoriesPreview,
  HomeContactCta,
  HomeLibraryPreview,
  HomeServicesPreview,
  HomeTestimonialsPreview,
} from "./components/home/HomePreviews";
import { SiteShell } from "./components/SiteShell";

function Divider() {
  return (
    <div className="wrap">
      <div className="divider" />
    </div>
  );
}

export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <Divider />
      <HomeServicesPreview />
      <Divider />
      <HomeLibraryPreview />
      <Divider />
      <HomeCategoriesPreview />
      <Divider />
      <HomeTestimonialsPreview />
      <Divider />
      <HomeContactCta />
    </SiteShell>
  );
}

import { Contact } from "./components/Contact";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Library } from "./components/Library";
import { Loader } from "./components/Loader";
import { Particles } from "./components/Particles";
import { ScrollTop } from "./components/ScrollTop";
import { Services } from "./components/Services";
import { Testimonials } from "./components/Testimonials";
import { Unlock } from "./components/Unlock";
import { WhyUs } from "./components/WhyUs";

function Divider() {
  return (
    <div className="wrap">
      <div className="divider" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Loader />
      <Particles />
      <Header />
      <main id="top">
        <Hero />
        <Divider />
        <Services />
        <Divider />
        <Library />
        <Divider />
        <Unlock />
        <Divider />
        <Testimonials />
        <Divider />
        <WhyUs />
        <Divider />
        <Faq />
        <Divider />
        <Contact />
      </main>
      <Footer />
      <ScrollTop />
    </>
  );
}

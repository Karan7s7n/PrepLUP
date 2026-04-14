import { useEffect } from "react";

import { HeroSection } from "../components/Content/HeroSection";
import { ContactUs } from "../components/Content/ContactUs";
import { Features } from "../components/Content/Features";

export default function Home() {

  // ✅ Replace Next.js metadata
  useEffect(() => {
    document.title = "Preplup";
  }, []);

  return (
    <main>
      <HeroSection />
      <Features />
      <ContactUs />
    </main>
  );
}

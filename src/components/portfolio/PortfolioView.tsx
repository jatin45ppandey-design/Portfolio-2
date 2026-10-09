import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { Achievements } from "@/components/sections/Achievements";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { Education } from "@/components/sections/Education";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Hero } from "@/components/sections/Hero";
import { Leadership } from "@/components/sections/Leadership";
import { Skills } from "@/components/sections/Skills";
import type { PortfolioDocument } from "@/lib/content/schema";

type PortfolioViewProps = {
  document: PortfolioDocument;
};

/**
 * Fixed public portfolio presentation driven exclusively by a validated
 * PortfolioDocument. Both the public route and Studio draft preview use this
 * exact component tree.
 */
export function PortfolioView({ document }: PortfolioViewProps) {
  return (
    <div className="site-shell">
      <Navbar navigation={document.navigation} profile={document.profile} />
      <main>
        <Hero hero={document.hero} profile={document.profile} />
        <AboutPreview about={document.about} />
        <FeaturedWork projects={document.projects} />
        <Skills skills={document.skills} />
        <Education education={document.education} />
        <Leadership leadership={document.leadership} />
        <Certifications certifications={document.certifications} />
        <Achievements achievements={document.achievements} />
        <Contact contact={document.contact} profile={document.profile} />
      </main>
      <Footer footer={document.footer} navigation={document.navigation.footer} profile={document.profile} />
    </div>
  );
}

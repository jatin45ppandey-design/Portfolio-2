import Image from "next/image";
import { ArrowDownRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type AboutPreviewProps = {
  about: PortfolioDocument["about"];
};

export function AboutPreview({ about }: AboutPreviewProps) {
  return (
    <section id="about" className="section about-section">
      <div className="container about-grid">
        <ScrollReveal className="about-image-column" variant="media">
          <div className="image-frame about-image-frame">
            <Image
              src={about.image.src}
              alt={about.image.alt}
              fill
              sizes="(max-width: 900px) 100vw, 34vw"
              className="cover-image"
            />
          </div>
          <span className="image-note">{about.imageNote}</span>
        </ScrollReveal>

        <ScrollReveal className="about-copy" delay={0.08}>
          <div className="section-kicker">
            <span>{about.section.eyebrow}</span>
            <span>{about.section.label}</span>
          </div>
          <h2>{about.section.heading}</h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <div className="about-facts">
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <span>{fact.label}</span>
                <small>{fact.value}</small>
              </div>
            ))}
          </div>
          <a className="text-link" href={about.cta.href}>
            {about.cta.label} <ArrowDownRight size={17} />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}

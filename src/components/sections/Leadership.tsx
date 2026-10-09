import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type LeadershipProps = {
  leadership: PortfolioDocument["leadership"];
};

export function Leadership({ leadership }: LeadershipProps) {
  return (
    <section id="leadership" className="section leadership-section">
      <div className="container">
        <ScrollReveal className="section-heading-row">
          <div className="section-kicker">
            <span>{leadership.eyebrow}</span>
            <span>{leadership.label}</span>
          </div>
          <span className="section-heading-note">Student leadership</span>
        </ScrollReveal>

        <div className="leadership-layout">
          <ScrollReveal className="leadership-copy" delay={0.05}>
            <p className="project-context">{leadership.community}</p>
            <h2>{leadership.heading}</h2>
            <h3>{leadership.role}</h3>
            <p className="leadership-organization">{leadership.organization}</p>
            <p className="leadership-description">{leadership.contribution}</p>

            <div className="leadership-meta">
              <div>
                <span>Started</span>
                <strong>{leadership.start}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{leadership.status}</strong>
              </div>
            </div>

            <div className="leadership-contribution">
              <p className="details-label">What I contribute</p>
              <ul>
                {leadership.responsibilities.map((responsibility) => (
                  <li key={responsibility}>{responsibility}</li>
                ))}
              </ul>
            </div>

            <div className="leadership-event">
              <span>Highlighted event</span>
              <strong>{leadership.highlightedEvent}</strong>
            </div>
          </ScrollReveal>

          <ScrollReveal className="leadership-visual-reveal" variant="media">
            <figure className="leadership-visual">
              <Image
                src={leadership.image.src}
                alt={leadership.image.alt}
                fill
                sizes="(max-width: 900px) 100vw, 54vw"
                className="cover-image"
              />
              <figcaption>{leadership.image.label}</figcaption>
            </figure>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

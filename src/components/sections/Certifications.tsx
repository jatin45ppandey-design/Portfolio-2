import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type CertificationsProps = {
  certifications: PortfolioDocument["certifications"];
};

export function Certifications({ certifications }: CertificationsProps) {
  const featuredCertifications = [...certifications.items]
    .filter((certificate) => certificate.visible && certificate.featured)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));

  return (
    <section id="certifications" className="section certifications-section">
      <div className="container">
        <ScrollReveal>
          <div className="section-heading-row">
            <div className="section-kicker">
              <span>{certifications.section.eyebrow}</span>
              <span>{certifications.section.label}</span>
            </div>
            <span className="section-heading-note">Selected technical learning</span>
          </div>

          <div className="certifications-intro">
            <h2>{certifications.section.heading}</h2>
            <p>{certifications.section.description}</p>
          </div>
        </ScrollReveal>

        <div className="certification-grid">
          {featuredCertifications.map((certificate, index) => (
            <ScrollReveal
              className={index === 0 ? "certification-reveal certification-reveal--lead" : "certification-reveal"}
              delay={0.04 + index * 0.055}
              key={certificate.id}
              variant="item"
            >
              <article className={`certification-card certification-card--${certificate.slug}`}>
                <figure className="certification-image">
                  <Image
                    src={certificate.image.src}
                    alt={certificate.image.alt}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw"
                    className="cover-image"
                  />
                </figure>
                <div className="certification-content">
                  <p className="certification-category">{certificate.category}</p>
                  <h3>{certificate.title}</h3>
                  <p className="certification-issuer">{certificate.issuer}</p>
                  {certificate.date ? <span className="certification-date">{certificate.date}</span> : null}
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

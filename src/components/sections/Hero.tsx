import Image from "next/image";
import { ArrowUpRight, GitBranch, Link, MapPin } from "lucide-react";
import { ScrollReveal, StaggerItem, StaggerReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type HeroProps = {
  profile: PortfolioDocument["profile"];
  hero: PortfolioDocument["hero"];
};

export function Hero({ profile, hero }: HeroProps) {
  return (
    <section id="home" className="hero-section">
      <div className="container hero-grid">
        <StaggerReveal className="hero-copy" delay={0.04}>
          <StaggerItem>
            <div className="availability-pill">
              <span className="availability-dot" />
              {profile.status}
            </div>
          </StaggerItem>

          <StaggerItem>
            <p className="eyebrow">{hero.eyebrow}</p>
          </StaggerItem>
          <StaggerItem>
            <h1>
              <span>{profile.firstName}</span>
              <span className="accent-text">{profile.lastName}</span>
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="hero-role">{profile.role}</p>
          </StaggerItem>
          <StaggerItem>
            <p className="hero-summary">{profile.summary}</p>
          </StaggerItem>

          <StaggerItem>
            <div className="hero-ctas">
              <a className="button button-primary" href={hero.primaryCta.href}>
                {hero.primaryCta.label} <ArrowUpRight size={17} />
              </a>
              <a className="button button-secondary" href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
              </a>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="hero-meta">
              <div className="hero-socials">
                <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <GitBranch size={16} /> GitHub
                </a>
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <Link size={16} /> LinkedIn
                </a>
                <a href={profile.links.leetcode} target="_blank" rel="noreferrer">
                  LeetCode
                </a>
              </div>
              <span className="location-meta">
                <MapPin size={15} /> {profile.location}
              </span>
            </div>
          </StaggerItem>
        </StaggerReveal>

        <ScrollReveal className="hero-visual" delay={0.16} variant="media">
          <div className="image-frame hero-image-frame">
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 44vw"
              className="cover-image"
            />
            <div className="image-shade" />
            <div className="image-caption">
              <span>Current focus</span>
              <strong>{hero.currentFocus}</strong>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

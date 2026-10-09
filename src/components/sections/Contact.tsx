import { ArrowUpRight, Code2, GitBranch, Link, Mail, MapPin } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type ContactProps = {
  profile: PortfolioDocument["profile"];
  contact: PortfolioDocument["contact"];
};

export function Contact({ profile, contact }: ContactProps) {
  return (
    <section id="contact" className="section contact-section">
      <ScrollReveal className="container">
        <div className="section-heading-row">
          <div className="section-kicker">
            <span>{contact.eyebrow}</span>
            <span>{contact.label}</span>
          </div>
          <span className="section-heading-note">Open to a good conversation</span>
        </div>

        <div className="contact-layout">
          <div className="contact-copy">
            <h2>{contact.heading}</h2>
            <p>{contact.description}</p>
          </div>

          <div className="contact-panel">
            <a className="button button-primary contact-email" href={`mailto:${contact.email}`}>
              <Mail size={18} />
              <span>
                <small>Email me</small>
                <strong>{contact.email}</strong>
              </span>
              <ArrowUpRight size={18} />
            </a>

            <div className="contact-links" aria-label="Contact links">
              <a href={profile.links.github} target="_blank" rel="noreferrer">
                <GitBranch size={17} /> GitHub <ArrowUpRight size={15} />
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                <Link size={17} /> LinkedIn <ArrowUpRight size={15} />
              </a>
              <a href={profile.links.leetcode} target="_blank" rel="noreferrer">
                <Code2 size={17} /> LeetCode <ArrowUpRight size={15} />
              </a>
            </div>

            <div className="contact-meta">
              <div>
                <span>Status</span>
                <strong>{profile.status}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong><MapPin size={14} /> {profile.location}</strong>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

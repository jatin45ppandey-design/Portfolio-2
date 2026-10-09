import { Code2, GitBranch, Link } from "lucide-react";
import type { PortfolioDocument } from "@/lib/content/schema";

type FooterProps = {
  profile: PortfolioDocument["profile"];
  navigation: PortfolioDocument["navigation"]["footer"];
  footer: PortfolioDocument["footer"];
};

export function Footer({ profile, navigation, footer }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-identity">
          <p>{profile.name}</p>
          <span>{footer.role}</span>
          <span>{footer.focus}</span>
          <small>{profile.location}</small>
        </div>

        <div className="footer-column">
          <p className="footer-label">Quick navigation</p>
          <nav className="footer-nav" aria-label="Footer navigation">
            {navigation.map((item) => (
              <a href={item.href} key={item.href}>{item.label}</a>
            ))}
          </nav>
        </div>

        <div className="footer-column">
          <p className="footer-label">Find me online</p>
          <div className="footer-socials">
            <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <GitBranch size={15} /> GitHub
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Link size={15} /> LinkedIn
            </a>
            <a href={profile.links.leetcode} target="_blank" rel="noreferrer" aria-label="LeetCode">
              <Code2 size={15} /> LeetCode
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{"\u00A9"} {new Date().getFullYear()} {profile.name}</span>
      </div>
    </footer>
  );
}

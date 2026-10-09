"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { PortfolioDocument } from "@/lib/content/schema";

function GithubMark({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.17c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.69 1.26 3.35.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.72 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.45-2.7 5.43-5.28 5.71.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedinMark({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.62-1.85 3.35-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM3.56 20.45h3.56V9H3.56v11.45Z" />
    </svg>
  );
}

type NavbarProps = {
  profile: PortfolioDocument["profile"];
  navigation: PortfolioDocument["navigation"];
};

export function Navbar({ profile, navigation }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");
  const mobileItems = [
    { label: "Home", href: "#home" },
    ...navigation.primary,
    { label: "Contact", href: "#contact" },
  ];

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const updateScrolledState = () => setIsScrolled(window.scrollY > 28);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    const sections = navigation.primary.flatMap((item) => {
      const section = document.querySelector<HTMLElement>(item.href);
      return section ? [{ href: item.href, section }] : [];
    });
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visibleEntry) {
          const activeSection = sections.find(({ section }) => section === visibleEntry.target);
          if (activeSection) setActiveHref(activeSection.href);
        } else if (window.scrollY < 160) {
          setActiveHref("#home");
        }
      },
      { rootMargin: "-20% 0px -62%", threshold: [0, 0.15, 0.35] },
    );

    sections.forEach(({ section }) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", updateScrolledState);
      observer.disconnect();
    };
  }, [navigation.primary]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <header className={isScrolled ? "site-header is-compact" : "site-header"}>
      <div className="container nav-shell">
        <a className="brand-mark" href="#home" aria-label={`${profile.name} home`} onClick={closeMenu}>
          <span>JP</span>
          <span className="brand-name">{profile.name}</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.primary.map((item) => (
            <a
              className={activeHref === item.href ? "is-active" : undefined}
              key={item.href}
              href={item.href}
              aria-current={activeHref === item.href ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="nav-socials" aria-label="Social links">
            <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <GithubMark />
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <LinkedinMark />
            </a>
          </div>
          <a className="nav-connect" href="#contact">
            Let&apos;s Connect
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <nav aria-label="Mobile navigation">
          {mobileItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mobile-socials">
          <a href={profile.links.github} target="_blank" rel="noreferrer" onClick={closeMenu}>
            <GithubMark size={16} /> GitHub
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" onClick={closeMenu}>
            <LinkedinMark size={16} /> LinkedIn
          </a>
          <a href={profile.links.leetcode} target="_blank" rel="noreferrer" onClick={closeMenu}>
            LeetCode
          </a>
        </div>
      </div>
    </header>
  );
}

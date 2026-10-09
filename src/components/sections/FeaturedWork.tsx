import Image from "next/image";
import { GitBranch } from "lucide-react";
import { SecondaryProjectCard } from "@/components/sections/SecondaryProjectCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type FeaturedWorkProps = {
  projects: PortfolioDocument["projects"];
};

const secondaryProjectVariants = ["large", "medium", "compact"] as const;

export function FeaturedWork({ projects }: FeaturedWorkProps) {
  const visibleProjects = [...projects]
    .filter((project) => project.visible)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const featuredProjects = visibleProjects.filter((project) => project.featured);

  if (featuredProjects.length !== 1) {
    throw new Error("The published portfolio must have exactly one visible featured project.");
  }

  const featuredProject = featuredProjects[0];
  const visibleScreenshots = [...featuredProject.images]
    .filter((image) => image.visible)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const [primaryScreenshot, ...supportingScreenshots] = visibleScreenshots;

  if (!primaryScreenshot) {
    throw new Error("The published BhumiAI project is missing its primary screenshot.");
  }

  const secondaryProjects = visibleProjects
    .filter((project) => project.id !== featuredProject.id)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));

  return (
    <section id="projects" className="section work-section">
      <div className="container">
        <ScrollReveal className="section-heading-row">
          <div className="section-kicker">
            <span>02</span>
            <span>Featured work</span>
          </div>
          <span className="section-heading-note">One project, close up</span>
        </ScrollReveal>

        <ScrollReveal className="project-intro" delay={0.04}>
          <div>
            <p className="project-context">{featuredProject.category}</p>
            <h2>{featuredProject.title}</h2>
          </div>
          <p className="project-description">{featuredProject.description}</p>
        </ScrollReveal>

        <div className="project-layout">
          <ScrollReveal className="project-gallery" variant="media">
            <figure className="project-shot project-shot-primary">
              <Image
                src={primaryScreenshot.src}
                alt={primaryScreenshot.alt}
                fill
                sizes="(max-width: 900px) 100vw, 56vw"
                className="cover-image"
              />
              <figcaption>{primaryScreenshot.label}</figcaption>
            </figure>
            <div className="project-shot-row">
              {supportingScreenshots.map((shot) => (
                <figure className="project-shot project-shot-small" key={shot.src}>
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 900px) 50vw, 28vw"
                    className="cover-image"
                  />
                  <figcaption>{shot.label}</figcaption>
                </figure>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal className="project-details" delay={0.08}>
            <div>
              <p className="details-label">The build</p>
              <ul className="highlight-list">
                {featuredProject.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="details-label">Tech stack</p>
              <div className="tech-list">
                {featuredProject.techStack.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
            </div>

            <div className="project-actions">
              <a className="button button-primary" href={featuredProject.githubUrl} target="_blank" rel="noreferrer">
                <GitBranch size={17} /> GitHub
              </a>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal className="secondary-projects-heading">
          <div className="section-kicker">
            <span>03</span>
            <span>Selected projects</span>
          </div>
          <span className="section-heading-note">Other things I&apos;ve built</span>
        </ScrollReveal>

        <div className="secondary-projects-grid">
          {secondaryProjects.slice(0, secondaryProjectVariants.length).map((project, index) => (
            <SecondaryProjectCard
              delay={0.04 + index * 0.06}
              key={project.id}
              project={project}
              variant={secondaryProjectVariants[index] ?? "compact"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

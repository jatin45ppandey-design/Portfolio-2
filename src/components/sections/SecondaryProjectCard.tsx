"use client";

import Image from "next/image";
import { ArrowUpRight, GitBranch } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { PortfolioDocument } from "@/lib/content/schema";

type SecondaryProjectCardProps = {
  project: PortfolioDocument["projects"][number];
  variant: "large" | "medium" | "compact";
  delay?: number;
};

export function SecondaryProjectCard({ project, variant, delay = 0 }: SecondaryProjectCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;
  const image = [...project.images]
    .filter((candidate) => candidate.visible)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))[0];

  if (!image) {
    throw new Error(`The published ${project.title} project is missing a visible primary image.`);
  }

  return (
    <motion.article
      className={`secondary-project secondary-project--${variant}`}
      initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
      whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
      whileHover={shouldAnimate ? { y: -2 } : undefined}
      viewport={{ once: true, amount: 0.16 }}
      transition={shouldAnimate ? { duration: 0.54, delay, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
    >
      <figure className="secondary-project-image">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 900px) 100vw, 58vw"
          className="cover-image"
        />
        <figcaption>{image.label}</figcaption>
      </figure>

      <div className="secondary-project-content">
        <div>
          <p className="project-context">{project.category}</p>
          <h3>{project.title}</h3>
        </div>

        <p className="secondary-project-description">{project.description}</p>

        <div className="tech-list" aria-label={`${project.title} technology stack`}>
          {project.techStack.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>

        <div className="project-actions">
          <a className="button button-primary" href={project.githubUrl} target="_blank" rel="noreferrer">
            <GitBranch size={16} /> GitHub
          </a>
          {project.liveUrl ? (
            <a className="button button-secondary" href={project.liveUrl} target="_blank" rel="noreferrer">
              Live demo <ArrowUpRight size={16} />
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

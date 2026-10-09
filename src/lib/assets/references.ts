import type { PortfolioDocument } from "@/lib/content/schema";
import { isCloudinaryPortfolioImageSource } from "@/lib/content/schema";

export type PortfolioImageReference = {
  source: string;
  location: string;
};

export function collectPortfolioImageReferences(
  document: PortfolioDocument,
): PortfolioImageReference[] {
  const references: PortfolioImageReference[] = [
    { source: document.hero.image.src, location: "Hero image" },
    { source: document.about.image.src, location: "About image" },
    { source: document.leadership.image.src, location: "Leadership image" },
  ];

  document.projects.forEach((project) => {
    project.images.forEach((image) => {
      references.push({
        source: image.src,
        location: `Project: ${project.title} / ${image.id}`,
      });
    });
  });

  document.certifications.items.forEach((certificate) => {
    references.push({
      source: certificate.image.src,
      location: `Certification: ${certificate.title}`,
    });
  });

  document.achievements.items.forEach((achievement) => {
    if (achievement.image) {
      references.push({
        source: achievement.image.src,
        location: `Achievement: ${achievement.event}`,
      });
    }
  });

  return references;
}

export function getCloudinaryImageSources(document: PortfolioDocument): string[] {
  return [
    ...new Set(
      collectPortfolioImageReferences(document)
        .map((reference) => reference.source)
        .filter(isCloudinaryPortfolioImageSource),
    ),
  ];
}

export function getAssetUsage(
  assetUrl: string,
  draft: PortfolioDocument,
  published: PortfolioDocument | null,
) {
  const matchingLocations = (document: PortfolioDocument) =>
    collectPortfolioImageReferences(document)
      .filter((reference) => reference.source === assetUrl)
      .map((reference) => reference.location);

  return {
    draft: matchingLocations(draft),
    published: published ? matchingLocations(published) : [],
  };
}

export function findInactiveCloudinaryAssetUrls(
  document: PortfolioDocument,
  activeAssetUrls: ReadonlySet<string>,
): string[] {
  return getCloudinaryImageSources(document).filter((url) => !activeAssetUrls.has(url));
}

import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type AchievementsProps = {
  achievements: PortfolioDocument["achievements"];
};

export function Achievements({ achievements }: AchievementsProps) {
  const visibleAchievements = [...achievements.items]
    .filter((achievement) => achievement.visible)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));

  return (
    <section id="achievements" className="section achievements-section">
      <div className="container">
        <ScrollReveal>
          <div className="section-heading-row">
            <div className="section-kicker">
              <span>{achievements.section.eyebrow}</span>
              <span>{achievements.section.label}</span>
            </div>
            <span className="section-heading-note">Outside the editor</span>
          </div>

          <div className="achievements-intro">
            <h2>{achievements.section.heading}</h2>
            <p>{achievements.section.description}</p>
          </div>
        </ScrollReveal>

        <div className="achievement-grid">
          {visibleAchievements.map((achievement, index) => {
            if (!achievement.image) {
              throw new Error(`The published ${achievement.title} achievement is missing its image.`);
            }

            return (
              <ScrollReveal className="achievement-reveal" delay={0.05 + index * 0.075} key={achievement.id} variant="item">
                <article className="achievement-card">
                  <figure className="achievement-image">
                    <Image
                      src={achievement.image.src}
                      alt={achievement.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="cover-image"
                    />
                  </figure>
                  <div className="achievement-content">
                    <p className="achievement-position">{achievement.position}</p>
                    <h3>{achievement.title}</h3>
                    <p className="achievement-event">{achievement.event}</p>
                    <p className="achievement-organization">{achievement.organization}</p>
                    <span className="achievement-year">{achievement.date ?? ""}</span>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

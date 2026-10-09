import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type SkillsProps = {
  skills: PortfolioDocument["skills"];
};

export function Skills({ skills }: SkillsProps) {
  const visibleGroups = [...skills.groups]
    .filter((group) => group.visible)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));

  return (
    <section id="skills" className="section skills-section">
      <div className="container">
        <ScrollReveal>
          <div className="section-heading-row">
            <div className="section-kicker">
              <span>{skills.eyebrow}</span>
              <span>{skills.label}</span>
            </div>
            <span className="section-heading-note">A focused technical toolkit</span>
          </div>

          <div className="skills-intro">
            <h2>{skills.heading}</h2>
            <p>{skills.description}</p>
          </div>
        </ScrollReveal>

        <div className="skill-groups">
          {visibleGroups.map((group, groupIndex) => (
            <ScrollReveal
              className={groupIndex === 0 ? "skill-group-reveal skill-group-reveal--primary" : "skill-group-reveal"}
              delay={0.03 + groupIndex * 0.045}
              key={group.id}
              variant="item"
            >
              <article className={groupIndex === 0 ? "skill-group skill-group--primary" : "skill-group"}>
                <h3>{group.name}</h3>
                <ul className="skill-list">
                  {[...group.skills]
                    .filter((skill) => skill.visible)
                    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
                    .map((skill) => (
                    <li
                      className={skill.featured ? "skill-chip skill-chip--featured" : "skill-chip"}
                      key={skill.id}
                    >
                      {skill.name}
                    </li>
                    ))}
                </ul>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

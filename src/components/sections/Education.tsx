import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { PortfolioDocument } from "@/lib/content/schema";

type EducationProps = {
  education: PortfolioDocument["education"];
};

export function Education({ education }: EducationProps) {
  const visibleSemesters = [...education.degree.sgpa]
    .filter((semester) => semester.visible)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const visibleSchools = [...education.school]
    .filter((school) => school.visible)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));

  return (
    <section id="education" className="section education-section">
      <ScrollReveal className="container">
        <div className="section-heading-row">
          <div className="section-kicker">
            <span>{education.eyebrow}</span>
            <span>{education.label}</span>
          </div>
          <span className="section-heading-note">Learning in progress</span>
        </div>

        <div className="education-intro">
          <h2>{education.heading}</h2>
        </div>

        <div className="education-layout">
          <article className="education-feature">
            <div className="education-card-heading">
              <p className="details-label">Current degree</p>
              <span className="education-status">Current</span>
            </div>
            <h3>{education.degree.title}</h3>
            <p className="education-institution">{education.degree.institution}</p>

            <div className="education-meta">
              <div>
                <span>Location</span>
                <strong>{education.degree.location}</strong>
              </div>
              <div>
                <span>Affiliation</span>
                <strong>{education.degree.affiliation}</strong>
              </div>
              <div>
                <span>Current</span>
                <strong>{education.degree.current}</strong>
              </div>
              <div>
                <span>Expected graduation</span>
                <strong>{education.degree.graduation}</strong>
              </div>
            </div>

            <div className="sgpa-block">
              <p className="details-label">Semester SGPA</p>
              <div className="sgpa-list">
                {visibleSemesters.map((semester) => (
                  <div key={semester.id}>
                    <span>{semester.semester}</span>
                    <strong>{semester.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="education-school-list">
            <p className="details-label">School education</p>
            {visibleSchools.map((school) => (
              <article className="school-card" key={school.id}>
                <div>
                  <p>{school.level}</p>
                  <span>{school.institution}</span>
                </div>
                <strong>{school.score}</strong>
              </article>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

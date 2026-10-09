import { PortfolioDocumentSchema, type PortfolioDocument } from "@/lib/content/schema";

export const portfolio: PortfolioDocument = PortfolioDocumentSchema.parse({
  profile: {
    name: "Jatin Pandey",
    firstName: "Jatin",
    lastName: "Pandey.",
    role: "Computer Science Student focused on Java, Spring Boot & Full-Stack Development",
    summary:
      "I build practical backend and full-stack projects with a focus on Java, Spring Boot, APIs, databases, and clean system design.",
    location: "Lucknow, Uttar Pradesh, India",
    status: "Open to internships & software development opportunities",
    links: {
      github: "https://github.com/jatin45ppandey-design",
      linkedin: "https://www.linkedin.com/in/jatin-pandey-a1654237a/",
      leetcode: "https://leetcode.com/u/Jatin45_Pandey/",
    },
  },
  hero: {
    eyebrow: "Hi, I'm",
    primaryCta: { label: "View Projects", href: "#projects" },
    secondaryCta: { label: "Contact Me", href: "#contact" },
    image: {
      src: "/images/profile/jatin-working.jpg",
      alt: "Jatin Pandey working on a laptop at a college event",
    },
    currentFocus: "Java · Spring Boot · Backend",
  },
  about: {
    section: {
      eyebrow: "01",
      label: "About me",
      heading: "Learning by building things that have to work.",
    },
    image: {
      src: "/images/profile/jatin-portrait.jpg",
      alt: "Portrait of Jatin Pandey",
    },
    imageNote: "A little outside the editor",
    paragraphs: [
      "I'm a 3rd-year Computer Science student at Shri Ramswaroop Memorial College of Engineering and Management, Lucknow, focused on backend and full-stack development.",
      "I primarily work with Java, Spring Boot, REST APIs and SQL, and I learn by building real systems such as BhumiAI, CodeSense, Khao-Piio and PayVia.",
      "Beyond development, I contribute to CSI SRMCEM as a Design Team Lead and actively participate in volleyball and technical events.",
    ],
    facts: [
      { label: "B.Tech CSE", value: "SRMCEM, Lucknow" },
      { label: "3rd Year", value: "Expected graduation · 2028" },
    ],
    cta: { label: "See what I'm building", href: "#projects" },
  },
  navigation: {
    primary: [
      { label: "About", href: "#about" },
      { label: "Projects", href: "#projects" },
      { label: "Skills", href: "#skills" },
      { label: "Achievements", href: "#achievements" },
    ],
    footer: [
      { label: "About", href: "#about" },
      { label: "Projects", href: "#projects" },
      { label: "Skills", href: "#skills" },
      { label: "Education", href: "#education" },
      { label: "Certifications", href: "#certifications" },
      { label: "Achievements", href: "#achievements" },
      { label: "Contact", href: "#contact" },
    ],
  },
  projects: [
    {
      id: "bhumiai",
      slug: "bhumiai",
      title: "BhumiAI",
      category: "Smart India Hackathon 2026 · PS 26018",
      description:
        "Evidence-first land record digitization and officer-verification system for legacy handwritten and scanned Hindi-English records.",
      highlights: [
        "Recognition evidence with rule-based validation",
        "Source-linked officer review and human verification",
        "Structured duplicate and cross-record detection",
        "Audit trail with PDF / CSV / JSON export",
        "OCR and local handwriting recognition pipeline",
      ],
      techStack: [
        "Next.js",
        "React",
        "Python",
        "FastAPI",
        "SQLAlchemy",
        "SQLite",
        "OpenCV",
        "Tesseract OCR",
        "PyTorch",
      ],
      githubUrl: "https://github.com/jatin45ppandey-design/BhumiAi",
      images: [
        {
          id: "bhumiai-officer-review",
          src: "/images/projects/bhumiai/officer-review.png",
          alt: "BhumiAI officer review workspace showing source evidence and structured fields",
          label: "Officer review workspace",
          visible: true,
          order: 1,
        },
        {
          id: "bhumiai-upload-workspace",
          src: "/images/projects/bhumiai/upload-workspace..png",
          alt: "BhumiAI land record upload workspace",
          label: "Citizen upload flow",
          visible: true,
          order: 2,
        },
        {
          id: "bhumiai-verify-record",
          src: "/images/projects/bhumiai/verify-record.png",
          alt: "BhumiAI verification decision dialog",
          label: "Verification action",
          visible: true,
          order: 3,
        },
      ],
      featured: true,
      visible: true,
      order: 1,
    },
    {
      id: "codesense",
      slug: "codesense",
      title: "CodeSense",
      category: "Developer tool / Repository intelligence",
      description:
        "A codebase intelligence platform that helps developers understand unfamiliar repositories through indexing, retrieval, and source-grounded Q&A.",
      highlights: [],
      techStack: ["Java", "Spring Boot", "Next.js", "PostgreSQL", "PGVector"],
      githubUrl: "https://github.com/jatin45ppandey-design/Code-Sense",
      liveUrl: "https://code-sense-phi-mocha.vercel.app/",
      images: [
        {
          id: "codesense-dashboard",
          src: "/images/projects/codesense/dashboard.jpg",
          alt: "CodeSense dashboard showing repository intelligence and synced GitHub repositories",
          label: "Repository intelligence dashboard",
          visible: true,
          order: 1,
        },
      ],
      featured: false,
      visible: true,
      order: 2,
    },
    {
      id: "khao-piio",
      slug: "khao-piio",
      title: "Khao-Piio",
      category: "Full-stack application",
      description:
        "A full-stack food ordering platform with authentication, cart, checkout, payment integration, and order tracking.",
      highlights: [],
      techStack: ["React", "Vite", "Node.js", "MySQL", "Razorpay"],
      githubUrl: "https://github.com/jatin45ppandey-design/Khao-Piio",
      images: [
        {
          id: "khao-piio-home",
          src: "/images/projects/khao-piio/home.jpg",
          alt: "Khao-Piio food ordering home page with restaurant categories and featured dishes",
          label: "Ordering experience",
          visible: true,
          order: 1,
        },
      ],
      featured: false,
      visible: true,
      order: 3,
    },
    {
      id: "payvia",
      slug: "payvia",
      title: "PayVia",
      category: "Payments prototype",
      description:
        "An offline-first payment prototype exploring signed payment intents and low-connectivity transaction flows.",
      highlights: [],
      techStack: ["Java", "Spring Boot", "PostgreSQL", "Next.js", "TypeScript"],
      githubUrl: "https://github.com/jatin45ppandey-design/PayVia",
      images: [
        {
          id: "payvia-login",
          src: "/images/projects/payvia/login.jpg",
          alt: "PayVia payment prototype login screen",
          label: "Payment prototype",
          visible: true,
          order: 1,
        },
      ],
      featured: false,
      visible: true,
      order: 4,
    },
  ],
  skills: {
    eyebrow: "04",
    label: "Skills",
    heading: "Tools I work with.",
    description:
      "My strongest focus is Java and Spring Boot, with supporting experience across full-stack web development, databases, developer tooling, and project-specific Python workflows.",
    groups: [
      {
        id: "primary-backend",
        name: "Primary / Backend",
        visible: true,
        order: 1,
        skills: [
          { id: "java", name: "Java", featured: true, visible: true, order: 1 },
          { id: "spring-boot", name: "Spring Boot", featured: true, visible: true, order: 2 },
          { id: "spring-security", name: "Spring Security", featured: false, visible: true, order: 3 },
          { id: "rest-apis", name: "REST APIs", featured: false, visible: true, order: 4 },
          { id: "hibernate", name: "Hibernate", featured: false, visible: true, order: 5 },
          { id: "sql", name: "SQL", featured: false, visible: true, order: 6 },
        ],
      },
      {
        id: "frontend",
        name: "Frontend",
        visible: true,
        order: 2,
        skills: [
          { id: "react", name: "React", featured: false, visible: true, order: 1 },
          { id: "nextjs", name: "Next.js", featured: false, visible: true, order: 2 },
          { id: "typescript", name: "TypeScript", featured: false, visible: true, order: 3 },
          { id: "javascript", name: "JavaScript", featured: false, visible: true, order: 4 },
          { id: "html", name: "HTML", featured: false, visible: true, order: 5 },
          { id: "css", name: "CSS", featured: false, visible: true, order: 6 },
          { id: "tailwind-css", name: "Tailwind CSS", featured: false, visible: true, order: 7 },
        ],
      },
      {
        id: "databases",
        name: "Databases",
        visible: true,
        order: 3,
        skills: [
          { id: "postgresql", name: "PostgreSQL", featured: false, visible: true, order: 1 },
          { id: "mysql", name: "MySQL", featured: false, visible: true, order: 2 },
          { id: "sqlite", name: "SQLite", featured: false, visible: true, order: 3 },
          { id: "pgvector", name: "PGVector", featured: false, visible: true, order: 4 },
        ],
      },
      {
        id: "tools-platform",
        name: "Tools / Platform",
        visible: true,
        order: 4,
        skills: [
          { id: "git", name: "Git", featured: false, visible: true, order: 1 },
          { id: "github", name: "GitHub", featured: false, visible: true, order: 2 },
          { id: "docker", name: "Docker", featured: false, visible: true, order: 3 },
          { id: "vs-code", name: "VS Code", featured: false, visible: true, order: 4 },
        ],
      },
      {
        id: "project-specific-exploring",
        name: "Project-specific / Exploring",
        visible: true,
        order: 5,
        skills: [
          { id: "python", name: "Python", featured: false, visible: true, order: 1 },
          { id: "fastapi", name: "FastAPI", featured: false, visible: true, order: 2 },
          { id: "opencv", name: "OpenCV", featured: false, visible: true, order: 3 },
          { id: "tesseract-ocr", name: "Tesseract OCR", featured: false, visible: true, order: 4 },
          { id: "trocr", name: "TrOCR", featured: false, visible: true, order: 5 },
          { id: "ollama", name: "Ollama", featured: false, visible: true, order: 6 },
          { id: "rag", name: "RAG", featured: false, visible: true, order: 7 },
        ],
      },
    ],
  },
  education: {
    eyebrow: "05",
    label: "Education",
    heading: "The foundation behind the work.",
    degree: {
      title: "B.Tech in Computer Science and Engineering",
      institution: "Shri Ramswaroop Memorial College of Engineering and Management",
      location: "Lucknow",
      affiliation: "Affiliated with AKTU",
      current: "3rd Year / 5th Semester",
      graduation: "Expected graduation · 2028",
      sgpa: [
        { id: "semester-1", semester: "Semester 1", value: "8.1", visible: true, order: 1 },
        { id: "semester-2", semester: "Semester 2", value: "8.3", visible: true, order: 2 },
        { id: "semester-3", semester: "Semester 3", value: "8.0", visible: true, order: 3 },
        { id: "semester-4", semester: "Semester 4", value: "7.83", visible: true, order: 4 },
      ],
    },
    school: [
      {
        id: "class-12",
        level: "Class 12",
        institution: "Sunbeam School, Ayodhya",
        score: "88.8%",
        visible: true,
        order: 1,
      },
      {
        id: "class-10",
        level: "Class 10",
        institution: "Sunbeam School, Ayodhya",
        score: "88.0%",
        visible: true,
        order: 2,
      },
    ],
  },
  leadership: {
    eyebrow: "06",
    label: "Leadership",
    heading: "Beyond the code.",
    role: "Design Team Lead",
    organization: "Computer Society of India (CSI) — SRMCEM",
    community: "CSI SRMCEM × D’CODERS",
    start: "August 2026",
    status: "Current role",
    contribution:
      "A student leadership and community role focused on visual communication, event identity, and supporting technical event execution.",
    responsibilities: [
      "Visual design and event branding",
      "Posters, announcements, certificates, banners and digital creatives",
      "Coordination with organizing and technical teams",
      "Maintaining a consistent visual identity",
    ],
    highlightedEvent: "Cybersecurity Tech Talk 2.0",
    image: {
      src: "/images/profile/jatin-csi.jpg",
      alt: "Jatin Pandey at a CSI SRMCEM event",
      label: "CSI SRMCEM · Design Team Lead",
    },
  },
  certifications: {
    section: {
      eyebrow: "07",
      label: "Certifications",
      heading: "Technical Certifications",
      description: "Selected courses and credentials supporting my development stack.",
    },
    items: [
      {
        id: "java-spring-ai-udemy",
        slug: "java-spring-ai-udemy",
        title: "Java Spring Framework, Spring Boot, Spring AI - Gen AI",
        issuer: "Udemy · Navin Reddy / Telusko Edutech",
        date: "31 July 2026 · 55 hours",
        category: "Backend / AI",
        featured: true,
        visible: true,
        order: 1,
        image: {
          src: "/images/certificates/java-spring-boot-spring-ai-udemy.jpg",
          alt: "Udemy certificate for Java Spring Framework, Spring Boot, and Spring AI - Gen AI",
        },
      },
      {
        id: "full-stack-web-development-trusting-brains",
        slug: "full-stack-web-development-trusting-brains",
        title: "Certified Full Stack Web Development Program",
        issuer: "Trusting Brains IT Services Private Limited",
        date: "30 July 2026",
        category: "Full-stack development",
        featured: true,
        visible: true,
        order: 2,
        image: {
          src: "/images/certificates/full-stack-web-development-trusting-brains.png",
          alt: "Trusting Brains certificate for the Certified Full Stack Web Development Program",
        },
      },
      {
        id: "python-full-stack-srdt",
        slug: "python-full-stack-srdt",
        title: "Development Fundamentals - Full Stack with Python",
        issuer: "Shri Ramswaroop Digital Technologies Pvt. Ltd.",
        date: "11–23 August 2025",
        category: "Python / Full-stack",
        featured: true,
        visible: true,
        order: 3,
        image: {
          src: "/images/certificates/python-full-stack-srdt.jpg",
          alt: "SRDT certificate for Development Fundamentals - Full Stack with Python",
        },
      },
      {
        id: "tcs-ion-generative-ai-essentials",
        slug: "tcs-ion-generative-ai-essentials",
        title: "Generative AI Essentials",
        issuer: "TCS iON · MPIT – CoE",
        date: "04 July 2026",
        category: "Generative AI",
        featured: true,
        visible: true,
        order: 4,
        image: {
          src: "/images/certificates/tcs-ion-generative-ai-essentials.png",
          alt: "TCS iON certificate for Generative AI Essentials",
        },
      },
      {
        id: "tcs-ion-ai-cybersecurity-awareness",
        slug: "tcs-ion-ai-cybersecurity-awareness",
        title: "AI and Cybersecurity Awareness",
        issuer: "TCS iON · MPIT – CoE",
        date: "04 July 2026",
        category: "Cybersecurity",
        featured: false,
        visible: true,
        order: 5,
        image: {
          src: "/images/certificates/tcs-ion-ai-cybersecurity-awareness.png",
          alt: "TCS iON certificate for AI and Cybersecurity Awareness",
        },
      },
      {
        id: "practical-cyber-security-with-ai",
        slug: "practical-cyber-security-with-ai",
        title: "Practical Cyber Security with AI",
        issuer: "Cyber Hunterz",
        category: "Cybersecurity",
        featured: false,
        visible: true,
        order: 6,
        image: {
          src: "/images/certificates/cybersecurity-with-ai-cyber-hunterz.png",
          alt: "Cyber Hunterz certificate for a workshop on practical cyber security with AI",
        },
      },
    ],
  },
  achievements: {
    section: {
      eyebrow: "08",
      label: "Achievements",
      heading: "Sports Achievements",
      description: "Inter-college volleyball achievements while representing SRMCEM.",
    },
    items: [
      {
        id: "volleyball-zeal-2026-first-place",
        position: "1st Place",
        title: "Volleyball",
        event: "Zeal 2026",
        organization: "IILM Academy of Higher Learning, Lucknow",
        date: "2026",
        visible: true,
        order: 1,
        image: {
          src: "/images/achievements/volleyball-zeal-2026-first-place.png",
          alt: "Certificate recognizing Jatin Pandey for first place in volleyball at Zeal 2026",
        },
      },
      {
        id: "volleyball-pragyan-2026-second-position",
        position: "2nd Place",
        title: "Volleyball (Boys)",
        event: "Pragyan Annual Fest 2026",
        organization: "R.R. Group of Institutions · Represented SRMCEM",
        date: "2026",
        visible: true,
        order: 2,
        image: {
          src: "/images/achievements/volleyball-pragyan-2026-second-position.jpg",
          alt: "Certificate recognizing Jatin Pandey for second place in boys volleyball at Pragyan Annual Fest 2026",
        },
      },
    ],
  },
  contact: {
    eyebrow: "09",
    label: "Contact",
    heading: "Let's build something useful.",
    description:
      "I'm currently open to internships and software development opportunities. If you'd like to discuss a project, opportunity, or collaboration, feel free to reach out.",
    email: "jatin45ppandey@gmail.com",
  },
  footer: {
    role: "Computer Science Student",
    focus: "Focused on Java, Spring Boot & Full-Stack Development",
  },
});

export const profile = portfolio.profile;
export const heroSection = portfolio.hero;
export const aboutSection = portfolio.about;
export const navItems = portfolio.navigation.primary;
export const skillsSection = portfolio.skills;
export const educationSection = portfolio.education;
export const leadershipSection = portfolio.leadership;
export const certificationsSection = portfolio.certifications.section;
export const certifications = portfolio.certifications.items;
export const contactSection = portfolio.contact;
export const footerNavigation = portfolio.navigation.footer;
export const footerContent = portfolio.footer;

const bhumiAiProject = portfolio.projects.find((project) => project.id === "bhumiai");

if (!bhumiAiProject) {
  throw new Error("The fixed BhumiAI project is missing from the portfolio document.");
}

export const bhumiAi = {
  name: bhumiAiProject.title,
  context: bhumiAiProject.category,
  description: bhumiAiProject.description,
  github: bhumiAiProject.githubUrl,
  highlights: bhumiAiProject.highlights,
  stack: bhumiAiProject.techStack,
  screenshots: bhumiAiProject.images.map((image) => ({
    src: image.src,
    alt: image.alt,
    label: image.label ?? "",
  })),
};

export type SecondaryProject = {
  name: string;
  eyebrow: string;
  description: string;
  github: string;
  live?: string;
  image: {
    src: string;
    alt: string;
    label: string;
  };
  stack: string[];
};

export const secondaryProjects: SecondaryProject[] = portfolio.projects
  .filter((project) => project.id !== bhumiAiProject.id)
  .sort((left, right) => left.order - right.order)
  .map((project) => {
    const image = project.images[0];

    if (!image) {
      throw new Error(`The fixed ${project.title} project is missing its primary image.`);
    }

    return {
      name: project.title,
      eyebrow: project.category,
      description: project.description,
      github: project.githubUrl,
      live: project.liveUrl,
      image: {
        src: image.src,
        alt: image.alt,
        label: image.label ?? "",
      },
      stack: project.techStack,
    };
  });

export type Skill = PortfolioDocument["skills"]["groups"][number]["skills"][number];
export type SkillGroup = PortfolioDocument["skills"]["groups"][number];
export type Certification = PortfolioDocument["certifications"]["items"][number];

export const achievementsSection = {
  ...portfolio.achievements.section,
  achievements: portfolio.achievements.items.map((achievement) => {
    if (!achievement.image) {
      throw new Error(`The fixed ${achievement.title} achievement is missing its image.`);
    }

    return {
      ...achievement,
      image: achievement.image,
      year: achievement.date ?? "",
    };
  }),
};

/**
 * Source of truth for the portfolio.
 * Only publicly documented, non-speculative facts from the owner's existing GitHub README.
 * Fill missing resume, certifications and project media only after verification.
 */
export type ViewMode = 'explore' | 'recruiter' | 'developer';
export type SectionId = 'about' | 'journey' | 'originals' | 'skills' | 'highlights' | 'dossier';
export type Project = {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  genre: string;
  logline: string;
  description: string;
  problem: string;
  solution: string;
  stack: string[];
  features: string[];
  engineering: string[];
  github?: string;
  demo?: string;
  palette: 'forest' | 'indigo' | 'bronze';
};

export const profile = {
  name: 'Jatin Pandey',
  firstName: 'JATIN',
  role: 'Backend-focused Developer',
  tagline: 'Beyond the code. Behind the creation.',
  description: 'I build practical software with a focus on backend systems, thoughtful engineering and turning ideas into working applications.',
  education: 'B.Tech — Computer Science & Engineering',
  college: 'Shri Ramswaroop Memorial College of Engineering & Management',
  interests: ['Spring Boot & REST APIs', 'PostgreSQL', 'RAG & Generative AI', 'Full-stack Development'],
  photo: '/images/jatin-profile.jpg',
  email: 'jatin45ppandey@gmail.com',
  github: 'https://github.com/jatin45ppandey-design',
  linkedin: 'https://www.linkedin.com/in/jatin-pandey-a1654237a',
  existingPortfolio: 'https://demo-portfolio-rho-sepia.vercel.app/',
  resumePdf: null as string | null,
};

export const projects: Project[] = [
  {
    id: 'bhumiai',
    number: '01',
    title: 'BhumiAI',
    eyebrow: 'THE EVIDENCE ORIGINAL',
    genre: 'AI / E-GOVERNANCE',
    logline: 'From legacy land records to reviewable information.',
    description: 'An AI-assisted land record processing prototype for Hindi and English documents and structured extraction.',
    problem: 'Scanned and handwritten land documents are difficult to search, compare and review consistently.',
    solution: 'A document-processing workflow that assists extraction, highlights uncertain information and leaves verification to a responsible officer.',
    stack: ['Python', 'OpenCV', 'Pillow', 'Tesseract'],
    features: ['Document image preprocessing', 'OCR-driven field extraction', 'Hindi and English processing', 'Confidence-based extraction', 'Officer review and approval', 'Audit trail', 'Cross-record validation'],
    engineering: ['Image cleanup and OCR preprocessing', 'Structured extraction with confidence review', 'Human-in-the-loop verification and traceability'],
    github: 'https://github.com/jatin45ppandey-design/BhumiAi',
    palette: 'forest',
  },
  {
    id: 'codesense',
    number: '02',
    title: 'CodeSense',
    eyebrow: 'THE INTELLIGENCE ORIGINAL',
    genre: 'AI / DEVELOPER TOOLS',
    logline: 'Understand the code behind the code.',
    description: 'An AI-powered workspace to connect GitHub repositories, index code and make large codebases easier to explore.',
    problem: 'Understanding an unfamiliar repository can be slow when knowledge is scattered across files.',
    solution: 'GitHub synchronization, code indexing and file-aware AI conversation bring relevant source context into one developer workspace.',
    stack: ['Next.js', 'Gemini', 'RAG', 'Render', 'Vercel'],
    features: ['GitHub authentication', 'Repository synchronization', 'Codebase indexing', 'AI-powered codebase chat', 'File-aware responses', 'Developer dashboard'],
    engineering: ['GitHub-connected repository workflow', 'Code context retrieval for AI responses', 'Developer-facing project dashboard'],
    github: 'https://github.com/jatin45ppandey-design/Code-Sense',
    demo: 'https://code-sense-phi-mocha.vercel.app/',
    palette: 'indigo',
  },
  {
    id: 'payvia',
    number: '03',
    title: 'PayVia',
    eyebrow: 'THE TRANSACTION ORIGINAL',
    genre: 'FINTECH / BACKEND',
    logline: 'A payment workflow built around practical software engineering.',
    description: 'An exploratory UPI-inspired digital payment and wallet application with a Spring Boot backend and PostgreSQL.',
    problem: 'Payment experiences connect interface flows with dependable backend state and data handling.',
    solution: 'A practical full-stack exploration of payment and wallet workflows using a structured backend and relational data store.',
    stack: ['Next.js', 'Spring Boot', 'PostgreSQL'],
    features: ['UPI-inspired workflow', 'Digital payment and wallet exploration', 'Spring Boot-based backend', 'PostgreSQL data persistence'],
    engineering: ['Frontend and backend integration', 'Relational database-backed workflows', 'Backend API design'],
    palette: 'bronze',
  },
];

export const journey = [
  { code: 'S01 · E01', title: 'The Foundation', label: 'THE BEGINNING', text: 'Studying Computer Science & Engineering at Shri Ramswaroop Memorial College of Engineering & Management.', tags: ['B.Tech', 'CSE'] },
  { code: 'S01 · E02', title: 'Behind the Backend', label: 'THE CRAFT', text: 'Exploring Java, Spring Boot and PostgreSQL while building practical software foundations.', tags: ['Java', 'Spring Boot', 'PostgreSQL'] },
  { code: 'S01 · E03', title: 'From Concepts to Products', label: 'THE BUILD', text: 'Working on real-world projects including BhumiAI, CodeSense and PayVia.', tags: ['AI', 'Backend', 'Full stack'] },
  { code: 'S01 · E04', title: 'Still in Production', label: 'THE NEXT CHAPTER', text: 'Continuing to explore REST API architecture, databases, RAG-powered applications and full-stack development.', tags: ['Systems', 'RAG', 'Growth'] },
];

export const skillGroups = [
  { title: 'BACKEND', index: '01', description: 'The systems behind the screen.', skills: [{ name: 'Java', project: 'PayVia' }, { name: 'Spring Boot', project: 'PayVia' }, { name: 'Python', project: 'BhumiAI' }] },
  { title: 'FRONTEND', index: '02', description: 'Interfaces that make systems usable.', skills: [{ name: 'Next.js', project: 'CodeSense / PayVia' }, { name: 'JavaScript', project: 'Web development' }, { name: 'HTML & CSS', project: 'Web development' }] },
  { title: 'DATA & TOOLS', index: '03', description: 'Storage, workflow and version control.', skills: [{ name: 'PostgreSQL', project: 'PayVia' }, { name: 'Git', project: 'Source control' }, { name: 'GitHub', project: 'CodeSense' }] },
  { title: 'AI WORKFLOWS', index: '04', description: 'Intelligent experiences with real context.', skills: [{ name: 'Gemini', project: 'CodeSense' }, { name: 'RAG', project: 'CodeSense' }, { name: 'Tesseract', project: 'BhumiAI' }, { name: 'OpenCV', project: 'BhumiAI' }] },
];

export const modes: { id: ViewMode; title: string; eyebrow: string; description: string; order: SectionId[] }[] = [
  { id: 'explore', title: 'Explore', eyebrow: 'THE FULL STORY', description: 'The journey, in order.', order: ['about', 'journey', 'originals', 'skills', 'highlights', 'dossier'] },
  { id: 'recruiter', title: 'Recruiter', eyebrow: 'THE WORK', description: 'Projects and evidence first.', order: ['originals', 'skills', 'dossier', 'highlights', 'about', 'journey'] },
  { id: 'developer', title: 'Developer', eyebrow: 'THE CODE', description: 'Systems and engineering first.', order: ['originals', 'skills', 'journey', 'about', 'highlights', 'dossier'] },
];

export const introScenes = [
  { kicker: 'THE ORIGIN', title: 'Building with purpose.', note: 'B.Tech in Computer Science & Engineering' },
  { kicker: 'THE TOOLKIT', title: 'Backend at heart.', note: 'Java · Spring Boot · PostgreSQL' },
  { kicker: 'ORIGINAL 01', title: 'BhumiAI', note: 'AI-assisted land record digitization' },
  { kicker: 'ORIGINAL 02', title: 'CodeSense', note: 'AI-powered codebase intelligence' },
  { kicker: 'ORIGINAL 03', title: 'PayVia', note: 'A UPI-inspired payment workflow' },
  { kicker: 'NEXT SEASON', title: 'The best is still ahead.', note: 'Learning · Building · Improving' },
];

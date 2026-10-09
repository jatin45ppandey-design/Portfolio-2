"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, GitBranch, Link, Mail, Menu, SkipForward, X } from "lucide-react";
import type { PortfolioDocument } from "@/lib/content/schema";
import "./cinematic.css";

type Project = PortfolioDocument["projects"][number];
type Certificate = PortfolioDocument["certifications"]["items"][number];
type Achievement = PortfolioDocument["achievements"]["items"][number];
type Section = "about" | "projects" | "skills" | "education" | "leadership" | "certifications" | "achievements";
const easing = [0.22,1,0.36,1] as const;

function heroPortrait(doc: PortfolioDocument) {
  // Hero and About use their independently editable Studio image fields.
  return doc.hero.image.src;
}
function imageSrc(src: string) {
  // The large Khao-Piio homepage shot was unavailable from the repository connector.
  // Show an authentic in-repo checkout screenshot until that asset can be added.
  if (src === "/images/projects/khao-piio/home.jpg") return "/images/projects/khao-piio/checkout.jpg";
  return src;
}
function Label({ children }: {children:React.ReactNode}) {
  return <span className="c-label"><i aria-hidden="true" />{children}</span>;
}
function Reveal({children,className="",delay=0}:{children:React.ReactNode;className?:string;delay?:number}) {
  const reduce=useReducedMotion();
  return <motion.div className={className} initial={reduce?false:{opacity:0,y:44,filter:"blur(9px)"}} whileInView={{opacity:1,y:0,filter:"blur(0px)"}} viewport={{once:true,amount:.12}} transition={{duration:reduce?0:.85,delay,ease:easing}}>{children}</motion.div>;
}
function Heading({name,subtitle}:{name:string;subtitle?:string}) {
  return <Reveal className="c-section-head"><h2>{name}</h2>{subtitle&&<p>{subtitle}</p>}</Reveal>;
}
function External({href,children,primary=false}:{href:string;children:React.ReactNode;primary?:boolean}) {
  return <a className={"c-button "+(primary?"c-button-gold":"c-button-line")} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16}/></a>;
}
function Intro({document,onDone}:{document:PortfolioDocument;onDone:()=>void}) {
  const [phase,setPhase]=useState(0);
  const reduced=useReducedMotion();
  const activePhase=reduced?4:phase;
  useEffect(()=>{
    if(reduced)return;
    const timers=[380,1050,1800,2700].map((delay,index)=>window.setTimeout(()=>setPhase(index+1),delay));
    timers.push(window.setTimeout(onDone,4500));
    return ()=>timers.forEach(window.clearTimeout);
  },[reduced,onDone]);
  useEffect(()=>{
    const listener=(event:KeyboardEvent)=>{if(event.key==="Escape"||event.key==="Enter")onDone();};
    window.addEventListener("keydown",listener);
    return()=>window.removeEventListener("keydown",listener);
  },[onDone]);
  return <motion.div className="c-intro c-intro-refined" role="dialog" aria-modal="true" aria-label="Portfolio introduction" exit={{opacity:0,filter:"blur(9px)"}} transition={{duration:.7,ease:easing}}>
    <div className="c-intro-light" aria-hidden="true"/>
    <div className="c-intro-top"><span>JATIN PANDEY</span><span>PORTFOLIO</span></div>
    <motion.div className="c-intro-photo" aria-hidden="true" initial={{opacity:0,scale:1.09,filter:"grayscale(1) brightness(.35) blur(15px)"}} animate={activePhase>=2?{opacity:1,scale:1,filter:"grayscale(.57) brightness(.68) blur(0px)"}:{}} transition={{duration:1.5,ease:easing}}>
      <img src={imageSrc(heroPortrait(document))} alt=""/>
    </motion.div>
    <div className="c-intro-copy">
      <motion.p className="c-intro-kicker" initial={{opacity:0,y:13}} animate={activePhase>=1?{opacity:1,y:0}:{}} transition={{duration:.65}}>DEVELOPER PORTFOLIO</motion.p>
      <motion.h1 initial={{opacity:0,y:36,filter:"blur(15px)"}} animate={activePhase>=2?{opacity:1,y:0,filter:"blur(0px)"}:{}} transition={{duration:1,ease:easing}}>{document.profile.firstName}<span>{document.profile.lastName.replace(".","")}<i>.</i></span></motion.h1>
      <motion.p className="c-intro-role" initial={{opacity:0,y:18}} animate={activePhase>=3?{opacity:1,y:0}:{}} transition={{duration:.7}}>{document.hero.currentFocus}</motion.p>
      <motion.div initial={{opacity:0,y:12}} animate={activePhase>=4?{opacity:1,y:0}:{}} transition={{duration:.6}}><button className="c-intro-enter" onClick={onDone}>VIEW PORTFOLIO <ArrowUpRight size={17}/></button></motion.div>
    </div>
    <button className="c-intro-skip" onClick={onDone}><SkipForward size={14}/> SKIP INTRO</button>
  </motion.div>;
}

function ProgressIndicator() {
  const {scrollYProgress}=useScroll();
  return <motion.div className="c-page-progress" aria-hidden="true" style={{scaleX:scrollYProgress}}/>;
}
function Navigation({replay}:{replay:()=>void}) {
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const [active,setActive]=useState("home");
  useEffect(()=>{
    const listener=()=>setScrolled(window.scrollY>55);
    listener();window.addEventListener("scroll",listener,{passive:true});
    return()=>window.removeEventListener("scroll",listener);
  },[]);
  useEffect(()=>{
    const ids=["home","about","projects","skills","education","leadership","certifications","achievements","contact"];
    const observer=new IntersectionObserver(entries=>{
      const current=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(current)setActive(current.target.id);
    },{rootMargin:"-18% 0px -57% 0px",threshold:[0,.1,.3]});
    ids.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el);});
    return()=>observer.disconnect();
  },[]);
  const nav=[["about","About"],["projects","Projects"],["skills","Skills"],["education","Education"],["leadership","Leadership"],["certifications","Certifications"],["achievements","Achievements"],["contact","Contact"]] as const;
  return <header className={"c-nav "+(scrolled?"c-nav-solid":"")}>
    <a className="c-nav-logo" href="#home" aria-label="Go to homepage">JP<span>.</span><small>JATIN PANDEY</small></a>
    <nav className={"c-nav-links "+(open?"c-nav-open":"")} aria-label="Main navigation">
      {nav.map(([id,title])=><a key={id} href={"#"+id} aria-current={active===id?"location":undefined} onClick={()=>setOpen(false)}>{title}</a>)}
      <button className="c-replay" onClick={()=>{setOpen(false);replay();}}>REPLAY INTRO <ArrowUpRight size={13}/></button>
    </nav>
    <button className="c-menu" onClick={()=>setOpen(!open)} aria-label={open?"Close menu":"Open menu"} aria-expanded={open}>{open?<X size={21}/>:<Menu size={21}/>}</button>
  </header>;
}
function Hero({doc}:{doc:PortfolioDocument}) {
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start start","end start"]});
  const y=useTransform(scrollYProgress,[0,1],[0,95]);
  const opacity=useTransform(scrollYProgress,[0,.93],[1,0]);
  return <section id="home" className="c-hero c-hero-refined" ref={ref}>
    <div className="c-hero-light"/>
    <motion.div className="c-hero-media" style={{y,opacity}}><div className="c-portrait-spot"/><img src={imageSrc(heroPortrait(doc))} alt={doc.profile.name}/></motion.div>
    <div className="c-hero-fade"/>
    <div className="c-hero-copy">
      <Reveal><Label>HELLO, I&apos;M</Label><h1>{doc.profile.firstName.toUpperCase()}<span>{doc.profile.lastName.replace(".","").toUpperCase()}.</span></h1></Reveal>
      <Reveal delay={.1}><p className="c-hero-role">{doc.profile.role}</p><p className="c-hero-summary">{doc.profile.summary}</p><div className="c-hero-buttons"><a className="c-button c-button-gold" href="#projects">VIEW PROJECTS <ArrowUpRight size={16}/></a><a className="c-button c-button-line" href="#contact">CONTACT ME <ArrowUpRight size={16}/></a></div></Reveal>
      <Reveal delay={.2}><div className="c-hero-meta"><span>{doc.profile.location}</span><i/><span>{doc.hero.currentFocus}</span></div><div className="c-hero-status"><span className="c-status-dot"/>{doc.profile.status}</div></Reveal>
    </div>
    <a className="c-scroll-hint" href="#about">SCROLL TO EXPLORE <ArrowDown size={18}/></a>
  </section>;
}

function About({doc}:{doc:PortfolioDocument}) {
  return <section className="c-section c-about" id="about"><Heading name="ABOUT ME" subtitle={doc.about.section.heading}/><div className="c-about-grid"><Reveal className="c-about-picture"><img src={imageSrc(doc.about.image.src)} alt={doc.about.image.alt} loading="lazy"/>{doc.about.imageNote && doc.about.imageNote !== "A little outside the editor" && <span>{doc.about.imageNote}</span>}</Reveal><Reveal className="c-about-info">{doc.about.paragraphs.map((p,i)=><p key={i}>{p}</p>)}<div className="c-about-facts">{doc.about.facts.map((f,i)=><div key={i}><span>{f.label}</span><strong>{f.value}</strong></div>)}</div><a className="c-text-link" href="#projects">DISCOVER MY PROJECTS <ArrowUpRight size={16}/></a></Reveal></div></section>;
}
function Poster({project,onOpen}:{project:Project;onOpen:()=>void}) {
  const source=imageSrc(project.images.filter(im=>im.visible).sort((a,b)=>a.order-b.order)[0]?.src ?? "");
  const theme=project.id==="bhumiai"?"forest":project.id==="codesense"?"indigo":project.id==="khao-piio"?"ember":"bronze";
  return <button type="button" className={"c-poster c-poster-"+theme} onClick={onOpen} aria-label={"View "+project.title+" project"}><div className="c-poster-image"><img src={source} alt="" loading="lazy"/></div><div className="c-poster-shade"/><div className="c-poster-bottom"><p>{project.category}</p><h3>{project.title}</h3><p className="c-poster-summary">{project.description}</p><div className="c-poster-stack">{project.techStack.slice(0,3).map(t=><span key={t}>{t}</span>)}</div><span className="c-poster-open">PROJECT DETAILS <ArrowUpRight size={16}/></span></div></button>;
}
function Projects({doc,open}:{doc:PortfolioDocument;open:(p:Project)=>void}) {
  const projects=doc.projects.filter(p=>p.visible).sort((a,b)=>a.order-b.order);
  const zone=useRef<HTMLDivElement>(null);const rail=useRef<HTMLDivElement>(null);const viewport=useRef<HTMLDivElement>(null);
  const [travel,setTravel]=useState(0);const {scrollYProgress}=useScroll({target:zone,offset:["start start","end end"]});
  const x=useTransform(scrollYProgress,p=>-p*travel);
  useEffect(()=>{const calc=()=>{if(rail.current&&viewport.current)setTravel(Math.max(0,rail.current.scrollWidth-viewport.current.clientWidth+10));};calc();const obs=new ResizeObserver(calc);if(rail.current)obs.observe(rail.current);if(viewport.current)obs.observe(viewport.current);return()=>obs.disconnect();},[projects.length]);
  return <section id="projects" className="c-projects"><div className="c-scroll-zone" ref={zone} style={{height:`calc(100vh + ${Math.max(850,Math.ceil(travel*1.7))}px)`}}><div className="c-projects-sticky"><div className="c-projects-head"><Heading name="PROJECTS" subtitle="Ideas brought to life through practical engineering."/><span>SCROLL TO VIEW PROJECTS <ArrowRight size={17}/></span></div><div className="c-project-viewport" ref={viewport}><motion.div className="c-project-rail" style={{x}} ref={rail}>{projects.map(p=><Poster key={p.id} project={p} onOpen={()=>open(p)}/>)}</motion.div></div></div></div></section>;
}
function Skills({doc}:{doc:PortfolioDocument}) {
  const [selected,setSelected]=useState<string|null>(null);
  const projects=doc.projects.filter(p=>p.visible);
  return <section id="skills" className="c-section c-skills"><Heading name="SKILLS" subtitle={doc.skills.description}/><div className="c-skill-grid">{doc.skills.groups.filter(g=>g.visible).sort((a,b)=>a.order-b.order).map((g,i)=><Reveal className="c-skill-card" key={g.id} delay={i*.04}><h3>{g.name}</h3><div className="c-skill-pills">{g.skills.filter(s=>s.visible).sort((a,b)=>a.order-b.order).map(s=><button key={s.id} className={selected===s.id?"active":""} onClick={()=>setSelected(selected===s.id?null:s.id)}>{s.name}</button>)}</div>{g.skills.filter(s=>s.id===selected).map(s=><div className="c-skill-detail" key={s.id}><strong>{s.name}</strong><span>{projects.filter(p=>p.techStack.some(t=>t.toLowerCase()===s.name.toLowerCase())).map(p=>p.title).join(" · ")||"Part of my technical toolkit"}</span></div>)}</Reveal>)}</div></section>;
}
function Education({doc}:{doc:PortfolioDocument}) {
  const d=doc.education.degree;
  return <section id="education" className="c-section c-education"><Heading name="EDUCATION" subtitle={doc.education.heading}/><div className="c-education-grid"><Reveal className="c-degree"><Label>B.TECH / COMPUTER SCIENCE</Label><h3>{d.title}</h3><p>{d.institution}</p><div className="c-degree-stats"><div><span>CURRENT</span><strong>{d.current}</strong></div><div><span>GRADUATION</span><strong>{d.graduation}</strong></div><div><span>LOCATION</span><strong>{d.location}</strong></div><div><span>AFFILIATION</span><strong>{d.affiliation}</strong></div></div><div className="c-sgpa-title">SEMESTER PERFORMANCE</div><div className="c-sgpa-grid">{d.sgpa.filter(s=>s.visible).sort((a,b)=>a.order-b.order).map(s=><div key={s.id}><span>{s.semester}</span><strong>{s.value}</strong></div>)}</div></Reveal><div className="c-schools">{doc.education.school.filter(s=>s.visible).sort((a,b)=>a.order-b.order).map((s,i)=><Reveal className="c-school" key={s.id} delay={i*.1}><h3>{s.level}</h3><p>{s.institution}</p><strong>{s.score}</strong></Reveal>)}</div></div></section>;
}
function Leadership({doc}:{doc:PortfolioDocument}) {
  const l=doc.leadership;
  return <section id="leadership" className="c-section c-leadership"><Heading name="LEADERSHIP" subtitle={l.heading === "Beyond the code." ? "Design leadership and technical community involvement." : l.heading}/><div className="c-lead-grid"><Reveal className="c-lead-photo"><img src={imageSrc(l.image.src)} alt={l.image.alt} loading="lazy"/>{l.image.label && <span>{l.image.label}</span>}</Reveal><Reveal className="c-lead-content"><Label>{l.status} · {l.start}</Label><h3>{l.role}</h3><p className="c-lead-org">{l.organization}</p><p>{l.contribution}</p><h4>CONTRIBUTIONS</h4><ul>{l.responsibilities.map(item=><li key={item}>{item}</li>)}</ul><p className="c-lead-foot">{l.community} · {l.highlightedEvent}</p></Reveal></div></section>;
}
function Certifications({doc,open}:{doc:PortfolioDocument;open:(c:Certificate)=>void}) {
  const certificates=doc.certifications.items.filter(c=>c.visible).sort((a,b)=>a.order-b.order);
  return <section id="certifications" className="c-section c-certifications"><Heading name="CERTIFICATIONS" subtitle={doc.certifications.section.description}/><div className="c-certs">{certificates.map((c,i)=><Reveal key={c.id} delay={(i%3)*.07}><button className="c-cert" onClick={()=>open(c)}><div className="c-cert-img"><img src={imageSrc(c.image.src)} alt={c.image.alt} loading="lazy"/></div><div className="c-cert-copy"><span>{c.category}</span><h3>{c.title}</h3><p>{c.issuer}</p>{c.date&&<small>{c.date}</small>}<ArrowUpRight size={19}/></div></button></Reveal>)}</div></section>;
}
function Achievements({doc,open}:{doc:PortfolioDocument;open:(a:Achievement)=>void}) {
  return <section id="achievements" className="c-section c-achievements"><Heading name="ACHIEVEMENTS" subtitle={doc.achievements.section.description}/><div className="c-awards">{doc.achievements.items.filter(a=>a.visible).sort((a,b)=>a.order-b.order).map((a,i)=><Reveal key={a.id} delay={i*.12}><button className="c-award" onClick={()=>open(a)}><div className="c-award-image">{a.image&&<img src={imageSrc(a.image.src)} alt={a.image.alt} loading="lazy"/>}</div><div className="c-award-copy">{a.date&&<span>{a.date}</span>}<h3>{a.position}</h3><h4>{a.title} · {a.event}</h4><p>{a.organization}</p><span className="c-award-open">VIEW CERTIFICATE <ArrowUpRight size={15}/></span></div></button></Reveal>)}</div></section>;
}
function Contact({doc}:{doc:PortfolioDocument}) {
  return <footer id="contact" className="c-contact"><div className="c-contact-glow"/><Label>LET&apos;S CONNECT</Label><h2>{doc.contact.heading}</h2><p>{doc.contact.description}</p><div className="c-contact-actions"><External href={"mailto:"+doc.contact.email} primary><Mail size={16}/> EMAIL ME</External><External href={doc.profile.links.github}><GitBranch size={16}/> GITHUB</External><External href={doc.profile.links.linkedin}><Link size={16}/> LINKEDIN</External><External href={doc.profile.links.leetcode}>LEETCODE</External></div><div className="c-footer"><span>© {new Date().getFullYear()} {doc.profile.name.toUpperCase()}</span><span>{doc.footer.role} · {doc.footer.focus}</span></div></footer>;
}
function ProjectModal({p,all,onClose,onChange}:{p:Project;all:Project[];onClose:()=>void;onChange:(p:Project)=>void}) {
  const ix=all.findIndex(a=>a.id===p.id);
  useEffect(()=>{const fn=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();if(e.key==="ArrowLeft")onChange(all[(ix+all.length-1)%all.length]);if(e.key==="ArrowRight")onChange(all[(ix+1)%all.length]);};window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);},[p,onClose,onChange,all,ix]);
  return <motion.div className="c-dialog-scrim" role="presentation" onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="c-project-dialog" role="dialog" aria-modal="true" aria-label={p.title+" project details"} onClick={e=>e.stopPropagation()} initial={{opacity:0,scale:.93,y:30}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.98,y:20}} transition={{duration:.46,ease:easing}}><div className="c-dialog-nav"><span>PROJECT DETAILS</span><button autoFocus onClick={onClose} aria-label="Close project"><X size={23}/></button></div><div className="c-dialog-hero"><div className="c-dialog-photo"><img src={imageSrc(p.images.filter(im=>im.visible).sort((a,b)=>a.order-b.order)[0]?.src||"")} alt={p.images[0]?.alt||p.title}/></div><div className="c-dialog-intro"><Label>{p.category}</Label><h2>{p.title}</h2><p>{p.description}</p><div className="c-tags">{p.techStack.map(s=><span key={s}>{s}</span>)}</div><div className="c-dialog-buttons"><External href={p.githubUrl} primary><GitBranch size={16}/> VIEW SOURCE</External>{p.liveUrl&&<External href={p.liveUrl}><ExternalLink size={16}/> LIVE DEMO</External>}</div></div></div><div className="c-dialog-content"><div><Label>PROJECT OVERVIEW</Label><p>{p.description}</p>{p.highlights.length>0&&<h3>Key features</h3>}{p.highlights.length?<ul>{p.highlights.map(h=><li key={h}>{h}</li>)}</ul>:<p>View the screenshots and source code for more implementation details.</p>}</div><div><Label>SCREENSHOTS</Label><div className="c-modal-shots">{p.images.filter(i=>i.visible).sort((a,b)=>a.order-b.order).map(im=><figure key={im.id}><img src={imageSrc(im.src)} alt={im.alt} loading="lazy"/><figcaption>{im.label}</figcaption></figure>)}</div></div></div><div className="c-dialog-bottom"><button onClick={()=>onChange(all[(ix+all.length-1)%all.length])}><ChevronLeft size={17}/> PREVIOUS PROJECT</button><button onClick={()=>onChange(all[(ix+1)%all.length])}>NEXT PROJECT <ChevronRight size={17}/></button></div></motion.div></motion.div>;
}
function MediaModal({item,close}:{item:Certificate|Achievement;close:()=>void}) {
  useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==="Escape")close();};window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f);},[close]);
  return <motion.div className="c-dialog-scrim" onClick={close} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="c-media-dialog" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Certificate details"><button autoFocus onClick={close} aria-label="Close details"><X size={23}/></button>{item.image && <img src={imageSrc(item.image.src)} alt={item.image.alt}/>}<h3>{"position" in item ?item.position+" — "+item.title:item.title}</h3><p>{"issuer" in item?item.issuer:item.organization}</p><small>{item.date||"Date not listed"}</small></div></motion.div>;
}
export default function CinematicPortfolio({document:data}:{document:PortfolioDocument}) {
  const [stage,setStage]=useState<"opening"|"home">("opening");
  const [project,setProject]=useState<Project|null>(null);
  const [media,setMedia]=useState<Certificate|Achievement|null>(null);
  const reduced=useReducedMotion();
  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      try {
        if(sessionStorage.getItem("jp-refined-intro-seen")==="yes" || window.location.pathname.startsWith("/studio/preview") || reduced) setStage("home");
      } catch {}
    },0);
    return()=>window.clearTimeout(timer);
  },[reduced]);
  useEffect(()=>{
    if(stage==="home"&&!project&&!media)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow=previous;};
  },[stage,project,media]);
  const completeIntro=useCallback(()=>{
    try{sessionStorage.setItem("jp-refined-intro-seen","yes");}catch{}
    setStage("home");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);
  const replay=useCallback(()=>{
    setStage("opening");
    window.scrollTo({top:0,behavior:"auto"});
  },[]);
  const close=useCallback(()=>setProject(null),[]);
  const closeMedia=useCallback(()=>setMedia(null),[]);
  const sections:Record<Section,React.ReactNode>={
    about:<About doc={data}/>,projects:<Projects doc={data} open={setProject}/>,
    skills:<Skills doc={data}/>,education:<Education doc={data}/>,
    leadership:<Leadership doc={data}/>,certifications:<Certifications doc={data} open={setMedia}/>,
    achievements:<Achievements doc={data} open={setMedia}/>
  };
  const order:Section[]=["about","projects","skills","education","leadership","certifications","achievements"];
  const pList=data.projects.filter(p=>p.visible).sort((a,b)=>a.order-b.order);
  return <div className="cinema">
    <AnimatePresence mode="wait">{stage==="opening"&&<Intro key="opening" document={data} onDone={completeIntro}/>}</AnimatePresence>
    {stage==="home"&&<motion.div className="c-site" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.7}}>
      <ProgressIndicator/>
      <Navigation replay={replay}/>
      <Hero doc={data}/>
      <main>{order.map(id=><div key={id}>{sections[id]}</div>)}</main>
      <Contact doc={data}/>
    </motion.div>}
    <AnimatePresence>{project&&<ProjectModal key={project.id} p={project} all={pList} onClose={close} onChange={setProject}/>}</AnimatePresence>
    <AnimatePresence>{media&&<MediaModal item={media} close={closeMedia}/>}</AnimatePresence>
  </div>;
}

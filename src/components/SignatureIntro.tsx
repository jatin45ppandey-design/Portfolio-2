import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, SkipForward } from "lucide-react";
import "./SignatureIntro.css";

const easing = [0.22, 1, 0.36, 1] as const;

export type SignatureIntroProps = {
  firstName?: string;
  lastName?: string;
  focus?: string;
  portraitSrc?: string;
  /** Optional callback: lets this standalone intro hand off to a future app. */
  onComplete?: () => void;
};

/** Intro only. No portfolio sections, database, authentication or CMS. */
export default function SignatureIntro({
  firstName = "Jatin",
  lastName = "Pandey",
  focus = "Java · Spring Boot · Backend",
  portraitSrc = "/images/profile/jatin-working.jpg",
  onComplete,
}: SignatureIntroProps) {
  const [phase, setPhase] = useState(0);
  const [take, setTake] = useState(0);
  const reducedMotion = useReducedMotion();
  const visiblePhase = reducedMotion ? 4 : phase;

  useEffect(() => {
    if (reducedMotion) return;
    const timers = [380, 1050, 1800, 2700].map((delay, index) =>
      window.setTimeout(() => setPhase(index + 1), delay),
    );
    if (onComplete) timers.push(window.setTimeout(onComplete, 4500));
    return () => timers.forEach(window.clearTimeout);
  }, [take, reducedMotion, onComplete]);

  const skip = useCallback(() => {
    if (onComplete) onComplete();
    else setPhase(4);
  }, [onComplete]);

  const replay = useCallback(() => {
    setPhase(0);
    setTake((current) => current + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [skip]);

  return (
    <main className="signature-shell">
      <section className="signature" aria-label={firstName + " " + lastName + " introduction"}>
        <div className="signature-light" aria-hidden="true" />
        <div className="signature-edge" aria-hidden="true" />

        <div className="signature-top">
          <span>{firstName.toUpperCase()} {lastName.toUpperCase()}</span>
          <span>PORTFOLIO</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            className="signature-photo"
            key={"photo-" + take}
            initial={reducedMotion ? false : {
              opacity: 0,
              scale: 1.09,
              filter: "grayscale(1) brightness(.35) blur(15px)",
            }}
            animate={visiblePhase >= 2 ? {
              opacity: 1,
              scale: 1,
              filter: "grayscale(.57) brightness(.68) blur(0px)",
            } : {}}
            transition={{ duration: reducedMotion ? 0 : 1.5, ease: easing }}
            aria-hidden="true"
          >
            <img src={portraitSrc} alt="" draggable={false} />
          </motion.div>
        </AnimatePresence>

        <div className="signature-copy">
          <motion.p
            className="signature-kicker"
            key={"kicker-" + take}
            initial={reducedMotion ? false : { opacity: 0, y: 13 }}
            animate={visiblePhase >= 1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : .65 }}
          >
            DEVELOPER PORTFOLIO
          </motion.p>

          <motion.h1
            key={"name-" + take}
            initial={reducedMotion ? false : { opacity: 0, y: 36, filter: "blur(15px)" }}
            animate={visiblePhase >= 2 ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: reducedMotion ? 0 : 1, ease: easing }}
          >
            {firstName}
            <span>{lastName}<i>.</i></span>
          </motion.h1>

          <motion.p
            className="signature-role"
            key={"focus-" + take}
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={visiblePhase >= 3 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : .7 }}
          >
            {focus}
          </motion.p>

          <motion.div
            key={"action-" + take}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={visiblePhase >= 4 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : .6 }}
          >
            <button type="button" className="signature-action"
              onClick={onComplete ?? replay}
              aria-label={onComplete ? "Continue to website" : "Replay intro animation"}>
              {onComplete ? "VIEW PORTFOLIO" : "REPLAY INTRO"}
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          </motion.div>
        </div>

        <button className="signature-skip" type="button" onClick={skip}>
          <SkipForward size={15} aria-hidden="true" /> SKIP INTRO
        </button>
      </section>
    </main>
  );
}

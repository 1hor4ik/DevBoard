"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./landing.module.css";

export function LandingFaq({ questions }: { questions: string[][] }) {
  return (
    <div className={styles.questions}>
      {questions.map(([question, answer]) => (
        <FaqItem key={question} question={question} answer={answer} />
      ))}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={styles.faqItem}>
      <h3>
        <button
          type="button"
          id={`${id}-trigger`}
          className={styles.faqTrigger}
          aria-expanded={open}
          aria-controls={`${id}-answer`}
          onClick={() => setOpen((value) => !value)}
        >
          {question}
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </h3>
      <div
        id={`${id}-answer`}
        className={styles.faqAnswer}
        data-open={open}
        role="region"
        aria-labelledby={`${id}-trigger`}
        aria-hidden={!open}
        inert={!open}
      >
        <div>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

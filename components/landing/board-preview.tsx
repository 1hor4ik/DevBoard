"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Circle,
  Ellipsis,
  Flag,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import styles from "./landing.module.css";

export function BoardPreview() {
  const [complete, setComplete] = useState(false);
  return (
    <div className={styles.preview}>
      <div className={styles.windowBar}>
        <div className={styles.windowDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>workspace / studio</span>
        <span className={styles.demoLabel}>Interactive demo</span>
      </div>
      <div className={styles.boardHeader}>
        <div>
          <span className={styles.eyebrow}>THE NEXT BIG THING</span>
          <h2>
            Website launch <span>↗</span>
          </h2>
        </div>
        <div className={styles.avatars} aria-label="Three example teammates">
          <span>AK</span>
          <span>JD</span>
          <span>ML</span>
        </div>
      </div>
      <div className={styles.boardToolbar}>
        <span>
          <span className={styles.liveDot} /> Team board
        </span>
        <span>3 tasks · 1 shared goal</span>
      </div>
      <p className={styles.mobileBoardHint}>Scroll the board to explore →</p>
      <div
        className={styles.columns}
        tabIndex={0}
        aria-label="Example Kanban board, scroll horizontally on small screens"
      >
        <div className={styles.column}>
          <h3>
            <Circle size={11} /> To do <span>1</span>
          </h3>
          <div className={styles.task}>
            <div className={styles.taskMeta}>
              <span className={styles.tag}>Design</span>
              <Ellipsis size={16} />
            </div>
            <h4>Polish the landing page</h4>
            <p>Make the first impression count.</p>
            <div className={styles.taskFooter}>
              <span>
                <Flag size={11} /> Medium
              </span>
              <b className={styles.avatarAmber}>AK</b>
            </div>
          </div>
          <div className={styles.ghostTask} aria-hidden="true">
            <span />
            <span />
          </div>
        </div>
        <div className={styles.column}>
          <h3>
            <span className={styles.progressDot} /> In progress{" "}
            <span>{complete ? 0 : 1}</span>
          </h3>
          {!complete ? (
            <div className={`${styles.task} ${styles.activeTask}`}>
              <div className={styles.taskMeta}>
                <span className={styles.tagBlue}>Development</span>
                <Ellipsis size={16} />
              </div>
              <h4>Build something great</h4>
              <p>The last little detail? Ship it.</p>
              <div className={styles.taskFooter}>
                <span>
                  <MessageCircle size={12} /> 3 comments
                </span>
                <b className={styles.avatarBlue}>JD</b>
              </div>
              <button
                className={styles.completeButton}
                onClick={() => setComplete(true)}
              >
                Mark as done <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className={styles.columnEmpty}>
              A little room for
              <br />
              your next idea.
            </div>
          )}
        </div>
        <div className={styles.column}>
          <h3>
            <CheckCheck size={13} /> Done <span>{complete ? 2 : 1}</span>
          </h3>
          <div className={styles.task}>
            <div className={styles.taskMeta}>
              <span className={styles.tagGreen}>Setup</span>
              <Check size={14} />
            </div>
            <h4>Bring the team together</h4>
            <p>One workspace. Everyone in sync.</p>
            <div className={styles.taskFooter}>
              <span className={styles.doneText}>Ready to roll</span>
              <b className={styles.avatarGreen}>ML</b>
            </div>
          </div>
          {complete && (
            <div className={`${styles.task} ${styles.completedTask}`}>
              <span className={styles.tagGreen}>
                <Check size={12} /> Shipped
              </span>
              <h4>Build something great</h4>
              <p>Small steps. Real progress.</p>
            </div>
          )}
        </div>
      </div>
      <div className={styles.previewBottom}>
        <span role="status">
          {complete
            ? "Nice work. One more idea brought to life."
            : "Try it: finish the task in the middle column."}
        </span>
        <button
          onClick={() => setComplete(false)}
          disabled={!complete}
          aria-label="Reset demo"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>
      <div className={styles.floatingNote} aria-hidden="true">
        <span className={styles.noteIcon}>
          <Check size={17} />
        </span>
        <div>
          <strong>
            {complete ? "Task completed" : "A little more clarity."}
          </strong>
          <span>
            {complete
              ? "Your board is up to date."
              : "A lot more getting things done."}
          </span>
        </div>
      </div>
    </div>
  );
}

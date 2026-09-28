import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  Code2,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { BoardPreview } from "./board-preview";
import { LandingFaq } from "./faq";
import { ScrollReveal } from "./scroll-reveal";
import styles from "./landing.module.css";

const questions = [
  [
    "Who is DevBoard for?",
    "Small developer teams, student projects, and anyone who wants a clear place to organize collaborative work. Create a workspace, invite your teammates, and build from there.",
  ],
  [
    "What updates in real time?",
    "Task creation, edits, moves, deletion, comments, and typing indicators use live socket updates. Personal notifications refresh periodically and when you open the notification panel.",
  ],
  [
    "Can I keep different projects separate?",
    "Yes. Each workspace has its own projects, members, and activity history. You can switch between workspaces and see your assigned tasks across projects in the current workspace.",
  ],
  [
    "Is the source code available?",
    "Yes! DevBoard is an educational project exploring full-stack development, authentication, databases, and real-time collaboration. See the GitHub repository for setup instructions and current limitations.",
  ],
];

export function LandingPage({
  destination,
  signedIn,
}: {
  destination: string;
  signedIn: boolean;
}) {
  const action = signedIn ? "Open your workspace" : "Create your workspace";
  return (
    <div className={styles.landing}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo} aria-label="DevBoard home">
            <span>
              <Code2 size={23} />
            </span>
            DevBoard<span className={styles.logoPeriod}>.</span>
          </Link>
          <nav aria-label="Main navigation" className={styles.desktopNav}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className={styles.headerActions}>
            {!signedIn && (
              <Link href="/sign-in" className={styles.signIn}>
                Sign in
              </Link>
            )}
            <Link href={destination} className={styles.headerCta}>
              {signedIn ? "Dashboard" : "Get started"}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </header>
      <ScrollReveal>
        <section className={`${styles.container} ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <span className={styles.pill}>
              <span className={styles.liveDot} /> A little structure. More room
              to build.
            </span>
            <h1>
              Great ideas.
              <br />
              Clear boards.
              <br />
              <span>Better together.</span>
            </h1>
            <p>
              Your team’s next big thing starts with a small task. Bring your
              projects, people, and conversations into one calm workspace.
            </p>
            <div className={styles.heroActions}>
              <Link href={destination} className={styles.primaryButton}>
                {action}
                <ArrowRight size={17} />
              </Link>
              <a href="#features" className={styles.textButton}>
                Explore features <ArrowDown size={15} />
              </a>
            </div>
            <div className={styles.heroFootnote}>
              <Code2 size={15} />
              <span>Built for developers. Made for teamwork.</span>
            </div>
          </div>
          <div id="the-board" className={styles.heroVisual}>
            <div className={styles.orbit} aria-hidden="true" />
            <span className={styles.visualCaption}>
              <Sparkles size={14} /> Your ideas, in good company
            </span>
            <BoardPreview />
          </div>
        </section>
        <div
          className={`${styles.container} ${styles.capabilityStrip}`}
          aria-label="Core capabilities"
        >
          <span>
            LESS SCATTERED.
            <br />
            <strong>MORE CONNECTED.</strong>
          </span>
          {[
            { icon: FolderKanban, text: "Project boards" },
            { icon: MessageCircle, text: "Live conversations" },
            { icon: Users, text: "Shared workspaces" },
            { icon: Activity, text: "Team activity" },
          ].map(({ icon: Icon, text }) => (
            <div key={text}>
              <Icon size={19} />
              <span>{text}</span>
            </div>
          ))}
        </div>
        <section
          data-reveal
          id="features"
          className={`${styles.container} ${styles.section}`}
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                A PLACE FOR EVERY MOVING PART
              </span>
              <h2>
                Keep the work flowing.
                <br />
                <span>And everyone in the loop.</span>
              </h2>
            </div>
            <p>
              From the first “what if” to the final “it’s shipped,” give your
              team a shared picture of what comes next.
            </p>
          </div>
          <div className={styles.featureGrid}>
            <article className={`${styles.feature} ${styles.boardFeature}`}>
              <span className={styles.featureIcon}>
                <FolderKanban size={22} />
              </span>
              <h3>
                Big picture.
                <br />
                Small, doable steps.
              </h3>
              <p>
                Turn plans into tasks with owners, priorities, and due dates.
                Move work across your board as the project takes shape.
              </p>
              <div className={styles.workflow} aria-hidden="true">
                <span>
                  <i /> To do
                </span>
                <ArrowRight size={16} />
                <span className={styles.workflowActive}>
                  <i /> In progress
                </span>
                <ArrowRight size={16} />
                <span>
                  <Check size={14} /> Done
                </span>
              </div>
              <div className={styles.miniTask}>
                <span className={styles.miniCheckbox}>
                  <Check size={14} />
                </span>
                <div>
                  <strong>One less thing to keep in your head</strong>
                  <span>Assigned · Organized · Moving forward</span>
                </div>
                <ListChecks size={21} />
              </div>
            </article>
            <article className={`${styles.feature} ${styles.chatFeature}`}>
              <span className={styles.featureIcon}>
                <MessageCircle size={22} />
              </span>
              <h3>
                The conversation
                <br />
                stays with the task.
              </h3>
              <p>
                Share context, ask a question, or celebrate a fix. Live comments
                keep the whole discussion in one place.
              </p>
              <div
                className={styles.chatDemo}
                aria-label="Example task conversation"
              >
                <div className={styles.chatRow}>
                  <b className={styles.avatarBlue}>JD</b>
                  <div>
                    <strong>
                      Jordan <small>just now</small>
                    </strong>
                    <p>Ready for a quick review? 👀</p>
                  </div>
                </div>
                <div className={styles.chatReply}>
                  <b className={styles.avatarAmber}>AK</b>
                  <div>
                    <strong>Alex</strong>
                    <p>On it! The details look great ✨</p>
                  </div>
                </div>
                <div className={styles.typing}>
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>{" "}
                  Jordan is typing
                </div>
              </div>
            </article>
            <article className={`${styles.feature} ${styles.activityFeature}`}>
              <div>
                <span className={styles.featureIcon}>
                  <Activity size={22} />
                </span>
                <h3>
                  Catch up.
                  <br />
                  Without the catch-up call.
                </h3>
                <p>
                  See what changed in your workspace and get personal
                  notifications for assignments, comments, and invitations.
                </p>
              </div>
              <div
                className={styles.activityDemo}
                aria-label="Example activity feed"
              >
                <div className={styles.activityDemoTitle}>
                  <Bell size={16} />
                  <strong>A little update for you</strong>
                  <span className={styles.notificationDot} />
                </div>
                {[
                  {
                    icon: Check,
                    text: "Alex completed a task",
                    sub: "Landing page · Done",
                    color: "green",
                  },
                  {
                    icon: MessageCircle,
                    text: "Jordan left a comment",
                    sub: "Authentication flow · Just now",
                    color: "blue",
                  },
                  {
                    icon: Users,
                    text: "Morgan joined the workspace",
                    sub: "One more mind on the team",
                    color: "amber",
                  },
                ].map(({ icon: Icon, text, sub, color }) => (
                  <div className={styles.activityRow} key={text}>
                    <span data-color={color}>
                      <Icon size={15} />
                    </span>
                    <div>
                      <strong>{text}</strong>
                      <p>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
        <section data-reveal id="how-it-works" className={styles.stepsSection}>
          <div className={styles.container}>
            <span className={styles.eyebrow}>FROM IDEA TO “LET’S DO THIS”</span>
            <h2>
              A fresh start.
              <br />
              In three simple steps.
            </h2>
            <div className={styles.steps}>
              {[
                {
                  number: "01",
                  icon: LayoutDashboard,
                  title: "Make it your space",
                  text: "Create a workspace for your team, side project, or next big idea.",
                },
                {
                  number: "02",
                  icon: Users,
                  title: "Bring your people",
                  text: "Invite teammates and give everyone a place in the project.",
                },
                {
                  number: "03",
                  icon: Zap,
                  title: "Build a little momentum",
                  text: "Add your first task, assign it, and watch the board come to life.",
                },
              ].map(({ number, icon: Icon, title, text }) => (
                <article className={styles.step} key={number}>
                  <div>
                    <span>{number}</span>
                    <Icon size={22} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          data-reveal
          id="faq"
          className={`${styles.container} ${styles.faqSection}`}
        >
          <div>
            <span className={styles.eyebrow}>GOOD QUESTIONS</span>
            <h2>
              A little more
              <br />
              about DevBoard.
            </h2>
            <p>
              Curious how it all fits together?
              <br />
              Start here.
            </p>
          </div>
          <LandingFaq questions={questions} />
        </section>
        <section
          data-reveal
          className={`${styles.container} ${styles.finalCta}`}
        >
          <div className={styles.ctaDoodle} aria-hidden="true">
            <Code2 size={66} />
          </div>
          <span className={styles.eyebrow}>YOUR NEXT CHAPTER, ORGANIZED</span>
          <h2>
            Less “where was that?”
            <br />
            More “look what we built.”
          </h2>
          <p>Give your next project a place to grow.</p>
          <Link href={destination} className={styles.darkButton}>
            {action}
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </ScrollReveal>
      <footer className={`${styles.container} ${styles.footer}`}>
        <Link href="/" className={styles.logo}>
          <span>
            <Code2 size={20} />
          </span>
          DevBoard.
        </Link>
        <p>A learning project. A space to build together.</p>
        <a
          href="https://github.com/1hor4ik/DevBoard"
          target="_blank"
          rel="noreferrer"
          className={styles.sourceLink}
        >
          <Code2 size={17} /> Explore the code <ArrowUpRight size={14} />
        </a>
      </footer>
    </div>
  );
}

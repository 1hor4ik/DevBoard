"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ScrollReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container || !("IntersectionObserver" in window)) return;
    const sections = Array.from(
      container.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const revealed = new Set<HTMLElement>();

    const reveal = (section: HTMLElement) => {
      section.dataset.revealState = "visible";
      revealed.add(section);
      observer?.unobserve(section);
    };

    const setup = () => {
      observer?.disconnect();
      sections.forEach((section) => delete section.dataset.revealState);
      if (motion.matches) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target as HTMLElement);
          });
        },
        { threshold: 0, rootMargin: "0px 0px -100px 0px" },
      );

      sections.forEach((section) => {
        // Keep content already on screen visible, including restored scroll positions.
        if (
          revealed.has(section) ||
          section.getBoundingClientRect().top < window.innerHeight
        ) {
          revealed.add(section);
          return;
        }
        section.dataset.revealState = "pending";
        observer?.observe(section);
      });
    };

    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const section = target.closest<HTMLElement>(
        '[data-reveal-state="pending"]',
      );
      if (section) reveal(section);
    };

    setup();
    motion.addEventListener("change", setup);
    container.addEventListener("focusin", onFocus);
    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", setup);
      container.removeEventListener("focusin", onFocus);
      sections.forEach((section) => delete section.dataset.revealState);
    };
  }, []);

  return (
    <main id="main-content" ref={root}>
      {children}
    </main>
  );
}

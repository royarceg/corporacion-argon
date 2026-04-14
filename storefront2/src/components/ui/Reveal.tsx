"use client";

import { useEffect, useRef, ReactNode } from "react";
import { animate, stagger } from "animejs";

type RevealVariant = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleIn" | "staggerChildren";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
  threshold?: number;
  style?: React.CSSProperties;
  className?: string;
  as?: React.ElementType;
}

const variantConfig: Record<RevealVariant, Record<string, unknown>> = {
  fadeUp: { opacity: [0, 1], translateY: [30, 0] },
  fadeIn: { opacity: [0, 1] },
  slideLeft: { opacity: [0, 1], translateX: [-40, 0] },
  slideRight: { opacity: [0, 1], translateX: [40, 0] },
  scaleIn: { opacity: [0, 1], scale: [0.95, 1] },
  staggerChildren: { opacity: [0, 1], translateY: [20, 0] },
};

export default function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 700,
  staggerDelay = 60,
  threshold = 0.15,
  style,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = "0";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          if (variant === "staggerChildren") {
            // Animate direct children with stagger
            const children = el.children;
            if (children.length > 0) {
              Array.from(children).forEach((child) => {
                (child as HTMLElement).style.opacity = "0";
              });
              el.style.opacity = "1";
              animate(children, {
                ...variantConfig[variant],
                duration,
                delay: stagger(staggerDelay, { start: delay }),
                ease: "outExpo",
              });
            } else {
              el.style.opacity = "1";
            }
          } else {
            animate(el, {
              ...variantConfig[variant],
              duration,
              delay,
              ease: "outExpo",
            });
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [variant, delay, duration, staggerDelay, threshold]);

  const Component = Tag as any;

  return (
    <Component ref={ref} style={{ ...style, opacity: 0 }} className={className}>
      {children}
    </Component>
  );
}

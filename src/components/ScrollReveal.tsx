import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "up" | "fade" | "scale" | "left" | "right";
  delay?: number;
  threshold?: number;
  once?: boolean;
  style?: React.CSSProperties;
}

export function ScrollReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  threshold = 0.08,
  once = true,
  style = {},
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setInView(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getVariantStyles = () => {
    switch (variant) {
      case "fade":
        return inView ? "opacity-100" : "opacity-0";
      case "scale":
        return inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]";
      case "left":
        return inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4";
      case "right":
        return inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4";
      case "up":
      default:
        return inView
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-3.5 scale-[0.995]";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transitionDelay: `${delay}ms`,
        transitionDuration: "680ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-all will-change-[transform,opacity] ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  );
}

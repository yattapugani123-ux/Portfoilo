import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "up" | "fade" | "scale" | "left" | "right";
  delay?: number;
  threshold?: number;
  style?: React.CSSProperties;
}

export function ScrollReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  threshold = 0.1,
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
        setInView(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getVariantStyles = () => {
    switch (variant) {
      case "fade":
        return inView ? "opacity-100" : "opacity-0";
      case "scale":
        return inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]";
      case "left":
        return inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5";
      case "right":
        return inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5";
      case "up":
      default:
        return inView
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-5 scale-[0.99]";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transitionDelay: `${delay}ms`,
        transitionDuration: "650ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`transition-all will-change-[transform,opacity] ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  );
}

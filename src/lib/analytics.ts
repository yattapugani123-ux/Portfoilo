/**
 * Google Analytics 4 (GA4) Analytics Service
 * Measurement ID: G-Z1LP73ZC65
 * 
 * Features:
 * - Compatible with TanStack Start & React 19 (SSR and Client)
 * - Zero Personally Identifiable Information (PII) transmitted
 * - Deduplicated SPA page view tracking
 * - Automatic tracking of Total visitors, Unique visitors, Sessions, Device types, Traffic sources
 * - Explicit and global delegated tracking for Resume downloads, GitHub project clicks, and LinkedIn clicks
 */

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GA_MEASUREMENT_ID) ||
  "G-Z1LP73ZC65";

// Declare gtag and dataLayer on window
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Regex to identify and redact email addresses and phone numbers
const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
const PHONE_REGEX = /(\+?\d{1,4}[\s-]?)?\(?\d{3,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,9}/g;

/**
 * Sanitizes event parameters so no personally identifiable information (PII) is ever sent.
 */
export function sanitizeParams(params: Record<string, unknown> = {}): Record<string, unknown> {
  const clean: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();

    // Reject fields that could contain PII
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("email") ||
      lowerKey.includes("phone") ||
      lowerKey.includes("token") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("credential")
    ) {
      continue;
    }

    if (typeof val === "string") {
      clean[key] = val
        .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
        .replace(PHONE_REGEX, "[REDACTED_PHONE]");
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

/**
 * Safely calls gtag if window is defined.
 * If gtag hasn't finished loading yet, queues commands into window.dataLayer.
 */
export function gtag(...args: any[]) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else {
    window.dataLayer.push(args);
  }
}

/**
 * Send a custom GA4 event with automatic PII sanitization.
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  try {
    const cleanParams = sanitizeParams(params);
    gtag("event", eventName, cleanParams);
  } catch (err) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      console.warn("[GA4] Failed to track event:", eventName, err);
    }
  }
}

// Memory tracking to prevent duplicate consecutive page_view events
let lastTrackedPath = "";
let lastTrackedTimestamp = 0;

/**
 * Track client-side navigation page view without duplicate events.
 */
export function trackPageView(pagePath?: string, pageTitle?: string) {
  if (typeof window === "undefined") return;

  const currentPath =
    pagePath ||
    `${window.location.pathname}${window.location.search || ""}${window.location.hash || ""}`;
  const now = Date.now();

  // Deduplicate consecutive identical page views within 500ms
  if (lastTrackedPath === currentPath && now - lastTrackedTimestamp < 500) {
    return;
  }

  lastTrackedPath = currentPath;
  lastTrackedTimestamp = now;

  trackEvent("page_view", {
    page_path: currentPath,
    page_location: window.location.href,
    page_title: pageTitle || (typeof document !== "undefined" ? document.title : ""),
  });
}

/**
 * Track Resume Download click
 */
export function trackResumeDownload(clickLocation: string = "unknown", resumeUrl?: string) {
  const url =
    resumeUrl ||
    "https://drive.google.com/file/d/1vONk4mWtp4V6_-Vr0YeD3kerLli25C7E/view?usp=sharing";

  trackEvent("resume_download", {
    file_name: "RESUME_2026.pdf",
    file_extension: "pdf",
    link_url: url,
    click_location: clickLocation,
  });

  // Standard GA4 enhanced measurement file download event
  trackEvent("file_download", {
    file_name: "RESUME_2026.pdf",
    file_extension: "pdf",
    link_url: url,
    link_text: "Download Resume",
  });
}

/**
 * Track GitHub profile or project click
 */
export function trackGitHubClick(
  clickLocation: string = "unknown",
  projectTitle?: string,
  githubUrl?: string
) {
  const url = githubUrl || "https://github.com/yattapugani";

  trackEvent("github_click", {
    project_title: projectTitle || "GitHub Profile",
    link_url: url,
    click_location: clickLocation,
  });

  if (projectTitle) {
    trackEvent("github_project_click", {
      project_title: projectTitle,
      link_url: url,
      click_location: clickLocation,
    });
  }
}

/**
 * Track LinkedIn profile click
 */
export function trackLinkedInClick(clickLocation: string = "unknown", linkedinUrl?: string) {
  const url = linkedinUrl || "https://www.linkedin.com/in/yattapugani";

  trackEvent("linkedin_click", {
    link_url: url,
    click_location: clickLocation,
  });
}

/**
 * Track Project Case-Study Modal view
 */
export function trackProjectView(projectTitle: string, tags?: string[]) {
  trackEvent("project_view", {
    project_title: projectTitle,
    project_tags: tags?.join(", ") || "",
  });
}

/**
 * Dynamic fallback to ensure GA4 script is loaded if not already present.
 */
export function ensureGAScriptLoaded() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (!document.getElementById("ga4-gtag-script")) {
    const script = document.createElement("script");
    script.id = "ga4-gtag-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
  }
}

/**
 * Global delegated click listener.
 * Automatically catches any clicks on Resume, GitHub, or LinkedIn links
 * across the entire DOM (including dynamically mounted modals and widgets).
 */
export function initGlobalClickTracking(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  ensureGAScriptLoaded();

  const handleClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest("a, button");
    if (!target) return;

    // Skip if already tracked by an explicit handler
    if (target.getAttribute("data-ga-handled") === "true") return;

    const href = target.getAttribute("href") || "";
    const text = (target.textContent || "").trim();
    const title = target.getAttribute("title") || target.getAttribute("aria-label") || "";
    const lowerHref = href.toLowerCase();
    const lowerText = text.toLowerCase();
    const lowerTitle = title.toLowerCase();

    // 1. Resume / Certificate Download
    if (
      lowerHref.includes("resume") ||
      lowerHref.includes(".pdf") ||
      lowerText.includes("resume") ||
      lowerTitle.includes("resume") ||
      lowerText.includes("download resume") ||
      lowerText.includes("all certificates")
    ) {
      let location = "page_link";
      if (target.closest("header")) location = "header";
      else if (target.closest("#home")) location = "hero";
      else if (target.closest("#certifications")) location = "certifications";
      else if (target.closest("footer")) location = "footer";
      else if (target.closest("#projects")) location = "projects";

      trackResumeDownload(location, href);
      return;
    }

    // 2. LinkedIn click
    if (
      lowerHref.includes("linkedin.com") ||
      lowerTitle.includes("linkedin") ||
      lowerText === "in" ||
      lowerText.includes("linkedin")
    ) {
      let location = "page_link";
      if (target.closest("header")) location = "header";
      else if (target.closest("#home")) location = "hero_social";
      else if (target.closest("footer")) location = "footer_social";
      else if (target.closest("#contact")) location = "contact_social";

      trackLinkedInClick(location, href);
      return;
    }

    // 3. GitHub click
    if (
      lowerHref.includes("github.com") ||
      lowerTitle.includes("github") ||
      lowerText === "gh" ||
      lowerText.includes("github") ||
      lowerText.includes("source")
    ) {
      let location = "page_link";
      let projectTitle: string | undefined = undefined;

      if (target.closest("header")) location = "header";
      else if (target.closest("#home")) location = "hero_social";
      else if (target.closest("footer")) location = "footer_social";
      else if (target.closest("#contact")) location = "contact_social";
      else if (target.closest("[role='dialog']") || lowerText.includes("source")) {
        location = "project_modal_source";
        const modalHeading = document.querySelector("[role='dialog'] h3, [role='dialog'] h2");
        if (modalHeading) projectTitle = modalHeading.textContent?.trim();
      }

      trackGitHubClick(location, projectTitle, href);
      return;
    }
  };

  document.addEventListener("click", handleClick, { capture: true, passive: true });

  return () => {
    document.removeEventListener("click", handleClick, { capture: true });
  };
}

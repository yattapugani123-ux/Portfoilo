import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { trackPageView, initGlobalClickTracking } from "../lib/analytics";

/**
 * AnalyticsTracker
 * - Placed inside the TanStack Router root context
 * - Initializes global delegated click tracking for Resume, GitHub, and LinkedIn links
 * - Observes client-side location changes to emit page_view events without duplicates
 */
export function AnalyticsTracker() {
  const location = useLocation();

  // Initialize global delegated click tracking on mount
  useEffect(() => {
    const cleanup = initGlobalClickTracking();
    return cleanup;
  }, []);

  // Track page_view whenever the route location changes
  useEffect(() => {
    const path = `${location.pathname}${location.search ? `?${new URLSearchParams(location.search as any).toString()}` : ""}${location.hash ? `#${location.hash}` : ""}`;
    trackPageView(path || location.pathname);
  }, [location.pathname, location.search, location.hash]);

  return null;
}

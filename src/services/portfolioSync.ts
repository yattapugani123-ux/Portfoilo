import type { PortfolioContent } from "@/components/EditPortfolioModal";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  fetchPortfolioFromSupabase,
  savePortfolioToSupabase,
} from "./supabasePortfolioService";

export const STORAGE_KEY = "portfolio_content_v4";
export const GITHUB_TOKEN_KEY = "portfolio_github_token";
export const GITHUB_REPO = "yattapugani123-ux/Portfoilo";

export function deduplicateContent(data: PortfolioContent): PortfolioContent {
  if (!data) return data;

  // Deduplicate projects by title
  const seenProjects = new Set<string>();
  const projects = (data.projects || []).filter((p) => {
    const key = (p.t || "").trim().toLowerCase();
    if (!key || seenProjects.has(key)) return false;
    seenProjects.add(key);
    return true;
  });

  // Deduplicate tools / skills by name
  const seenTools = new Set<string>();
  const tools = (data.tools || []).filter((t) => {
    const key = (t.n || "").trim().toLowerCase();
    if (!key || seenTools.has(key)) return false;
    seenTools.add(key);
    return true;
  });

  // Deduplicate stats by label
  const seenStats = new Set<string>();
  const stats = (data.stats || []).filter((s) => {
    const key = (s.l || "").trim().toLowerCase();
    if (!key || seenStats.has(key)) return false;
    seenStats.add(key);
    return true;
  });

  // Deduplicate journey by role + company
  const seenJourney = new Set<string>();
  const journey = (data.journey || []).filter((j) => {
    const key = `${(j.role || "").trim().toLowerCase()}_${(j.co || "").trim().toLowerCase()}`;
    if (!key || seenJourney.has(key)) return false;
    seenJourney.add(key);
    return true;
  });

  // Deduplicate certifications by title + issuer
  const seenCerts = new Set<string>();
  const certifications = (data.certifications || []).filter((c) => {
    const key = `${(c.t || "").trim().toLowerCase()}_${(c.by || "").trim().toLowerCase()}`;
    if (!key || seenCerts.has(key)) return false;
    seenCerts.add(key);
    return true;
  });

  return {
    ...data,
    projects: projects.length > 0 ? projects : (data.projects || []),
    tools: tools.length > 0 ? tools : (data.tools || []),
    stats: stats.length > 0 ? stats : (data.stats || []),
    journey: journey.length > 0 ? journey : (data.journey || []),
    certifications: certifications.length > 0 ? certifications : (data.certifications || []),
  };
}

/**
 * Fetch the freshest portfolio content:
 * 1. Checks Supabase cloud database first (if configured).
 * 2. Falls back to static portfolio-data.json if Supabase is offline or not yet configured.
 */
export async function fetchLatestPortfolioContent(): Promise<PortfolioContent | null> {
  // 1. Try Supabase cloud database
  if (isSupabaseConfigured) {
    try {
      const supabaseData = await fetchPortfolioFromSupabase();
      if (supabaseData && supabaseData.name) {
        return deduplicateContent(supabaseData);
      }
    } catch (err) {
      console.warn("Could not fetch from Supabase, falling back to static file:", err);
    }
  }

  // 2. Fallback to static public/portfolio-data.json
  try {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const targetUrl = `${cleanBase}portfolio-data.json?_t=${Date.now()}`;

    const res = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object" && data.name) {
        return deduplicateContent(data as PortfolioContent);
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote portfolio data:", err);
  }
  return null;
}

/**
 * Reconcile local data with cloud server data:
 * - If remote exists, remote always takes precedence so all devices reflect cloud state.
 */
export function reconcilePortfolioData(
  localData: PortfolioContent | null,
  remoteData: PortfolioContent | null,
  defaultData: PortfolioContent,
): { content: PortfolioContent; source: "remote" | "local" | "default"; isUpdated: boolean } {
  if (remoteData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
    } catch {}
    return { content: remoteData, source: "remote", isUpdated: true };
  }

  if (localData) {
    return { content: localData, source: "local", isUpdated: false };
  }

  return { content: defaultData, source: "default", isUpdated: false };
}

/**
 * Clear local cache completely so devices revert to fresh server data
 */
export function clearLocalPortfolioCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear local cache:", e);
  }
}

/**
 * Save directly to GitHub via GitHub REST API if a token is configured.
 */
export async function pushToGitHub(
  content: PortfolioContent,
  token?: string,
): Promise<{ success: boolean; message: string }> {
  const pat =
    token || (typeof window !== "undefined" ? localStorage.getItem(GITHUB_TOKEN_KEY) : null);
  if (!pat) {
    return { success: false, message: "No GitHub Personal Access Token configured." };
  }

  const files = [
    { path: "public/portfolio-data.json" },
    { path: "src/data/portfolioData.json" },
  ];

  try {
    const jsonString = JSON.stringify(content, null, 2);
    const bytes = new TextEncoder().encode(jsonString);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Content = btoa(binary);

    for (const f of files) {
      const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${f.path}`;
      let sha: string | undefined;

      const getRes = await fetch(getUrl, {
        headers: {
          Authorization: `Bearer ${pat.trim()}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }

      const putRes = await fetch(getUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${pat.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update portfolio content (${new Date().toLocaleString()})`,
          content: base64Content,
          sha,
        }),
      });

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        return {
          success: false,
          message: `GitHub sync error on ${f.path}: ${err.message || putRes.statusText}`,
        };
      }
    }

    return {
      success: true,
      message: "Successfully pushed to GitHub! Mobile & laptop will update worldwide in ~1 min.",
    };
  } catch (err) {
    return { success: false, message: `Failed to push to GitHub: ${String(err)}` };
  }
}

/**
 * Save portfolio content:
 * 1. Sets/updates updatedAt timestamp.
 * 2. Saves directly to Supabase Cloud Database.
 * 3. Saves to localStorage as temporary/offline cache.
 * 4. If running on local dev server, calls POST /api/save-portfolio-content.
 * 5. If GitHub token is present, pushes to GitHub repo.
 */
export async function savePortfolioContent(
  rawContent: PortfolioContent,
): Promise<{
  success: boolean;
  savedToSupabase: boolean;
  savedToDisk: boolean;
  pushedToGitHub: boolean;
  supabaseError?: string;
  githubMessage?: string;
}> {
  const content = deduplicateContent(rawContent);
  // Always update timestamp
  content.updatedAt = Date.now();

  // 1. Save to Supabase Cloud
  let savedToSupabase = false;
  let supabaseError: string | undefined;

  if (isSupabaseConfigured) {
    const sbRes = await savePortfolioToSupabase(content);
    savedToSupabase = sbRes.success;
    if (!sbRes.success) {
      supabaseError = sbRes.error;
    }
  }

  // 2. Save to local browser storage as fallback/cache
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }

  // 3. Try saving to local dev server disk if available
  let savedToDisk = false;
  try {
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.startsWith("192.168."));

    if (isLocal) {
      const res = await fetch("/api/save-portfolio-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        savedToDisk = true;
      }
    }
  } catch {
    // Expected on static production builds
  }

  // 4. Try GitHub sync if token is stored
  let pushedToGitHub = false;
  let githubMessage = "";
  try {
    const pat = typeof window !== "undefined" ? localStorage.getItem(GITHUB_TOKEN_KEY) : null;
    if (pat) {
      const ghRes = await pushToGitHub(content, pat);
      pushedToGitHub = ghRes.success;
      githubMessage = ghRes.message;
    }
  } catch {}

  const overallSuccess = savedToSupabase || savedToDisk || !isSupabaseConfigured;

  return {
    success: overallSuccess,
    savedToSupabase,
    savedToDisk,
    pushedToGitHub,
    supabaseError,
    githubMessage,
  };
}

/**
 * Export portfolio data as a downloadable JSON file
 */
export function downloadPortfolioJson(content: PortfolioContent, filename = "portfolioData.json") {
  const jsonStr = JSON.stringify(content, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy JSON to clipboard
 */
export async function copyPortfolioJson(content: PortfolioContent): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    return true;
  } catch {
    return false;
  }
}

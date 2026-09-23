import type { PortfolioContent } from "@/components/EditPortfolioModal";

export const STORAGE_KEY = "portfolio_content_v4";
export const GITHUB_TOKEN_KEY = "portfolio_github_token";
export const GITHUB_REPO = "yattapugani123-ux/Portfoilo";

/**
 * Fetch the freshest portfolio-data.json from the live server/GitHub Pages deployment.
 * Cache-busted with timestamp query param and no-store headers.
 */
export async function fetchLatestPortfolioContent(): Promise<PortfolioContent | null> {
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
        return data as PortfolioContent;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote portfolio data:", err);
  }
  return null;
}

/**
 * Reconcile local data with remote server data:
 * - If remote exists and has updatedAt >= local's updatedAt (or local has no updatedAt), remote wins!
 * - If remote has newer data, update localStorage so subsequent renders stay fresh.
 */
export function reconcilePortfolioData(
  localData: PortfolioContent | null,
  remoteData: PortfolioContent | null,
  defaultData: PortfolioContent,
): { content: PortfolioContent; source: "remote" | "local" | "default"; isUpdated: boolean } {
  if (!remoteData) {
    if (localData) return { content: localData, source: "local", isUpdated: false };
    return { content: defaultData, source: "default", isUpdated: false };
  }

  // If there's no local data, remote wins
  if (!localData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
    } catch {}
    return { content: remoteData, source: "remote", isUpdated: true };
  }

  const localTime = localData.updatedAt || 0;
  const remoteTime = remoteData.updatedAt || 0;

  // If localData has NO updatedAt (it is from older stale cache), remote wins!
  // If remoteTime >= localTime, remote wins!
  if (!localData.updatedAt || remoteTime >= localTime) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
    } catch {}
    return { content: remoteData, source: "remote", isUpdated: true };
  }

  // Local is newer (e.g. edited locally on this machine)
  return { content: localData, source: "local", isUpdated: false };
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
 * This allows updating the website from mobile phone or any laptop without needing terminal or git commands!
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
    // Base64 encode UTF-8
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
 * 2. Saves to localStorage for local fast preview on this machine.
 * 3. If running on local dev server (localhost / 127.0.0.1 / local ip), calls POST /api/save-portfolio-content.
 * 4. If GitHub token is present, automatically pushes to GitHub!
 */
export async function savePortfolioContent(
  content: PortfolioContent,
): Promise<{ success: boolean; savedToDisk: boolean; pushedToGitHub: boolean; githubMessage?: string }> {
  // Always update timestamp
  content.updatedAt = Date.now();

  // 1. Save to local browser storage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }

  // 2. Try saving to local dev server disk if available
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

  // 3. Try GitHub sync if token is stored
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

  return { success: true, savedToDisk, pushedToGitHub, githubMessage };
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

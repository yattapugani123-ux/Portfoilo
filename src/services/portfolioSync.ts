import type { PortfolioContent } from "@/components/EditPortfolioModal";

export const STORAGE_KEY = "portfolio_content_v4";

/**
 * Save portfolio content:
 * 1. Saves to localStorage for local fast preview on this machine.
 * 2. If running on local dev server (localhost / 127.0.0.1), calls POST /api/save-portfolio-content
 *    which writes directly to src/data/portfolioData.json and public/portfolio-data.json!
 */
export async function savePortfolioContent(
  content: PortfolioContent,
): Promise<{ success: boolean; savedToDisk: boolean }> {
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

  return { success: true, savedToDisk };
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

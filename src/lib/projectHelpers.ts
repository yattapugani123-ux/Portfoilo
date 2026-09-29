import type { ProjectItem } from "@/components/EditPortfolioModal";

export function getProjectOutsideTitle(p?: ProjectItem | null): string {
  if (!p) return "";
  return (p.outsideTitle && p.outsideTitle.trim()) || p.t || "Untitled Project";
}

export function getProjectOutsideDesc(p?: ProjectItem | null): string {
  if (!p) return "";
  return (p.outsideDescription && p.outsideDescription.trim()) || p.d || "";
}

export function getProjectInsideTitle(p?: ProjectItem | null): string {
  if (!p) return "";
  return (
    (p.insideTitle && p.insideTitle.trim()) ||
    (p.outsideTitle && p.outsideTitle.trim()) ||
    p.t ||
    "Untitled Project"
  );
}

export function getProjectInsideDesc(p?: ProjectItem | null): string {
  if (!p) return "";
  return (
    (p.insideDescription && p.insideDescription.trim()) ||
    (p.outsideDescription && p.outsideDescription.trim()) ||
    p.d ||
    ""
  );
}

export function getProjectImages(p?: ProjectItem | null): string[] {
  if (!p) return [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    const list = p.images.map((im) => (im || "").trim()).filter(Boolean);
    if (list.length > 0) return list;
  }
  if (p.img && p.img.trim()) return [p.img.trim()];
  return [];
}

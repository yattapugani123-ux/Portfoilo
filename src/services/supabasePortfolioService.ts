import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { deduplicateContent } from "./portfolioSync";
import type {
  PortfolioContent,
  ProjectItem,
  ToolItem,
  StatItem,
  JourneyItem,
  CertItem,
} from "@/components/EditPortfolioModal";

/**
 * Fetch portfolio data from Supabase cloud database.
 * Returns null if Supabase is not configured, unreachable, or tables are unpopulated.
 */
export async function fetchPortfolioFromSupabase(): Promise<PortfolioContent | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const [
      profileRes,
      projectsRes,
      skillsRes,
      statsRes,
      journeyRes,
      certsRes,
    ] = await Promise.all([
      supabase.from("portfolio_profile").select("*").eq("id", "main").maybeSingle(),
      supabase.from("portfolio_projects").select("*").order("display_order", { ascending: true }),
      supabase.from("portfolio_skills").select("*").order("display_order", { ascending: true }),
      supabase.from("portfolio_stats").select("*").order("display_order", { ascending: true }),
      supabase.from("portfolio_journey").select("*").order("display_order", { ascending: true }),
      supabase.from("portfolio_certifications").select("*").order("display_order", { ascending: true }),
    ]);

    if (profileRes.error || !profileRes.data) {
      if (profileRes.error) {
        console.warn("Could not query portfolio_profile:", profileRes.error.message);
      }
      return null;
    }

    const p = profileRes.data;

    // Transform projects
    const projects: ProjectItem[] = (projectsRes.data || []).map((row) => ({
      t: row.title,
      d: row.description,
      tags: Array.isArray(row.tags) ? row.tags : [],
      grad: row.gradient || undefined,
      link: row.link || undefined,
      img: row.image_url || undefined,
    }));

    // Transform skills/tools
    const tools: ToolItem[] = (skillsRes.data || []).map((row) => ({
      n: row.name,
      i: row.icon,
    }));

    // Transform stats
    const stats: StatItem[] = (statsRes.data || []).map((row) => ({
      icon: row.icon,
      v: row.value,
      l: row.label,
      tint: row.tint,
    }));

    // Transform journey (experience / education)
    const journey: JourneyItem[] = (journeyRes.data || []).map((row) => ({
      icon: row.icon,
      role: row.role,
      co: row.company,
      date: row.date_range,
      desc: row.description || undefined,
      points: Array.isArray(row.points) ? row.points : [],
    }));

    // Transform certifications
    const certifications: CertItem[] = (certsRes.data || []).map((row) => ({
      i: row.icon,
      t: row.title,
      by: row.issuer,
      y: row.year,
      img: row.image_url || undefined,
      link: row.link || undefined,
    }));

    const content: PortfolioContent = {
      updatedAt: p.updated_at ? new Date(p.updated_at).getTime() : Date.now(),
      name: p.name || "",
      roles: p.roles || "",
      bio: p.bio || "",
      profileImageUrl: p.profile_image_url || undefined,
      resumeUrl: p.resume_url || "",
      viewAllProjectsText: p.view_all_projects_text || "View All Projects →",
      viewAllProjectsUrl: p.view_all_projects_url || p.resume_url || "",
      aboutHeadline: p.about_headline || "",
      aboutText: p.about_text || "",
      aboutQuote: p.about_quote || "",
      aboutQuoteAuthor: p.about_quote_author || "",
      aboutStats: Array.isArray(p.about_stats) ? p.about_stats : [],
      email: p.email || "",
      phone: p.phone || "",
      location: p.location || "",
      openToText: p.open_to_text || "",
      contactHeadline: p.contact_headline || "",
      contactSubtext: p.contact_subtext || "",
      linkedin: p.linkedin || "",
      github: p.github || "",
      behance: p.behance || "",
      instagram: p.instagram || "",
      projects,
      tools,
      stats,
      journey,
      certifications,
    };

    return deduplicateContent(content);
  } catch (err) {
    console.error("Error fetching portfolio from Supabase:", err);
    return null;
  }
}

/**
 * Save full portfolio data to Supabase cloud database.
 * Upserts profile and synchronizes child tables.
 */
export async function savePortfolioToSupabase(
  rawContent: PortfolioContent
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    };
  }

  const content = deduplicateContent(rawContent);

  try {
    // 1. Upsert Profile
    const profilePayload = {
      id: "main",
      name: content.name,
      roles: content.roles,
      bio: content.bio,
      profile_image_url: content.profileImageUrl || null,
      resume_url: content.resumeUrl,
      view_all_projects_text: content.viewAllProjectsText || "View All Projects →",
      view_all_projects_url: content.viewAllProjectsUrl || content.resumeUrl,
      about_headline: content.aboutHeadline,
      about_text: content.aboutText,
      about_quote: content.aboutQuote,
      about_quote_author: content.aboutQuoteAuthor,
      about_stats: content.aboutStats,
      email: content.email,
      phone: content.phone,
      location: content.location,
      open_to_text: content.openToText,
      contact_headline: content.contactHeadline,
      contact_subtext: content.contactSubtext,
      linkedin: content.linkedin,
      github: content.github,
      behance: content.behance,
      instagram: content.instagram,
      updated_at: new Date().toISOString(),
    };

    const { error: profileErr } = await supabase
      .from("portfolio_profile")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileErr) {
      throw new Error(`Failed to update profile: ${profileErr.message}`);
    }

    // 2. Synchronize Projects
    await supabase.from("portfolio_projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (content.projects && content.projects.length > 0) {
      const projectRows = content.projects.map((pr, idx) => ({
        title: pr.t,
        description: pr.d,
        tags: pr.tags || [],
        gradient: pr.grad || null,
        link: pr.link || null,
        image_url: pr.img || null,
        display_order: idx,
        updated_at: new Date().toISOString(),
      }));

      const { error: prErr } = await supabase.from("portfolio_projects").insert(projectRows);
      if (prErr) {
        throw new Error(`Failed to update projects: ${prErr.message}`);
      }
    }

    // 3. Synchronize Skills
    await supabase.from("portfolio_skills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (content.tools && content.tools.length > 0) {
      const skillRows = content.tools.map((sk, idx) => ({
        name: sk.n,
        icon: sk.i,
        display_order: idx,
      }));

      const { error: skErr } = await supabase.from("portfolio_skills").insert(skillRows);
      if (skErr) {
        throw new Error(`Failed to update skills: ${skErr.message}`);
      }
    }

    // 4. Synchronize Stats
    await supabase.from("portfolio_stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (content.stats && content.stats.length > 0) {
      const statRows = content.stats.map((st, idx) => ({
        icon: st.icon,
        value: st.v,
        label: st.l,
        tint: st.tint,
        display_order: idx,
      }));

      const { error: stErr } = await supabase.from("portfolio_stats").insert(statRows);
      if (stErr) {
        throw new Error(`Failed to update stats: ${stErr.message}`);
      }
    }

    // 5. Synchronize Journey
    await supabase.from("portfolio_journey").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (content.journey && content.journey.length > 0) {
      const journeyRows = content.journey.map((j, idx) => ({
        icon: j.icon,
        role: j.role,
        company: j.co,
        date_range: j.date,
        description: j.desc || null,
        points: j.points || [],
        display_order: idx,
      }));

      const { error: jErr } = await supabase.from("portfolio_journey").insert(journeyRows);
      if (jErr) {
        throw new Error(`Failed to update journey: ${jErr.message}`);
      }
    }

    // 6. Synchronize Certifications
    await supabase.from("portfolio_certifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (content.certifications && content.certifications.length > 0) {
      const certRows = content.certifications.map((c, idx) => ({
        icon: c.i,
        title: c.t,
        issuer: c.by,
        year: c.y,
        image_url: c.img || null,
        link: c.link || null,
        display_order: idx,
      }));

      const { error: cErr } = await supabase.from("portfolio_certifications").insert(certRows);
      if (cErr) {
        throw new Error(`Failed to update certifications: ${cErr.message}`);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Save error in savePortfolioToSupabase:", err);
    return { success: false, error: (err as Error).message || "Save failed." };
  }
}

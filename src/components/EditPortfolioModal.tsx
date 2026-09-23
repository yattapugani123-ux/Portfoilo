import { useState, useEffect } from "react";
import {
  savePortfolioContent,
  downloadPortfolioJson,
  copyPortfolioJson,
  fetchLatestPortfolioContent,
  clearLocalPortfolioCache,
  pushToGitHub,
  GITHUB_TOKEN_KEY,
  GITHUB_REPO,
} from "@/services/portfolioSync";
import {
  isSupabaseConfigured,
  signInAdmin,
  signOutAdmin,
  getCurrentAdminUser,
} from "@/lib/supabaseClient";
import {
  savePortfolioToSupabase,
  fetchPortfolioFromSupabase,
} from "@/services/supabasePortfolioService";
import type { User } from "@supabase/supabase-js";

export interface ProjectItem {
  t: string;
  d: string;
  tags: string[];
  grad?: string;
  link?: string;
  img?: string;
}

export interface ToolItem {
  n: string;
  i: string;
}

export interface StatItem {
  icon: string;
  v: string;
  l: string;
  tint: string;
}

export interface JourneyItem {
  icon: string;
  role: string;
  co: string;
  date: string;
  desc?: string;
  points: string[];
}

export interface CertItem {
  i: string;
  t: string;
  by: string;
  y: string;
  img?: string;
  link?: string;
}

export interface PortfolioContent {
  updatedAt?: number;
  name: string;
  roles: string;
  bio: string;
  profileImageUrl?: string;
  resumeUrl: string;
  viewAllProjectsText?: string;
  viewAllProjectsUrl?: string;
  aboutHeadline: string;
  aboutText: string;
  aboutQuote: string;
  aboutQuoteAuthor: string;
  aboutStats: Array<{ v: string; l: string }>;
  email: string;
  phone: string;
  location: string;
  openToText: string;
  contactHeadline: string;
  contactSubtext: string;
  linkedin: string;
  github: string;
  behance: string;
  instagram: string;
  stats: StatItem[];
  tools: ToolItem[];
  projects: ProjectItem[];
  journey: JourneyItem[];
  certifications: CertItem[];
}

interface EditPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: PortfolioContent;
  onSave: (updated: PortfolioContent) => void;
  onReset: () => void;
  initialTab?: EditorTab;
}

const PASSWORD_KEY = "252525";

export type EditorTab =
  "profile" | "about" | "stats" | "projects" | "skills" | "experience" | "contact" | "sync";

export function EditPortfolioModal({
  isOpen,
  onClose,
  content,
  onSave,
  onReset,
  initialTab = "profile",
}: EditPortfolioModalProps) {
  const [formData, setFormData] = useState<PortfolioContent>(content);
  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab);
  const [savedNotice, setSavedNotice] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Password protection state
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Supabase Auth & Cloud State
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"supabase" | "pin">(
    isSupabaseConfigured ? "supabase" : "pin"
  );
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [sbSyncStatus, setSbSyncStatus] = useState("");
  const [isSyncingSb, setIsSyncingSb] = useState(false);

  // GitHub & Multi-device sync state
  const [githubToken, setGithubToken] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem(GITHUB_TOKEN_KEY) || "" : "";
  });
  const [isPullingLive, setIsPullingLive] = useState(false);
  const [pullStatus, setPullStatus] = useState("");
  const [ghTestStatus, setGhTestStatus] = useState("");

  const handleSaveGitHubToken = (val: string) => {
    setGithubToken(val);
    try {
      if (val.trim()) {
        localStorage.setItem(GITHUB_TOKEN_KEY, val.trim());
      } else {
        localStorage.removeItem(GITHUB_TOKEN_KEY);
      }
    } catch {}
  };

  const handlePullLatest = async () => {
    setIsPullingLive(true);
    setPullStatus("Fetching latest published data from Supabase Cloud / server...");
    try {
      const fresh = await fetchLatestPortfolioContent();
      if (fresh) {
        setFormData(fresh);
        onSave(fresh);
        try {
          localStorage.setItem("portfolio_content_v4", JSON.stringify(fresh));
        } catch {}
        setPullStatus("✓ Updated to newest cloud data successfully!");
      } else {
        setPullStatus("Could not fetch fresh data. Please check connection.");
      }
    } catch (err) {
      setPullStatus(`Sync error: ${String(err)}`);
    } finally {
      setIsPullingLive(false);
      setTimeout(() => setPullStatus(""), 4000);
    }
  };

  const handleSyncToSupabase = async () => {
    if (!isSupabaseConfigured) {
      setSbSyncStatus("⚠️ Supabase credentials are not configured in environment variables yet.");
      setTimeout(() => setSbSyncStatus(""), 5000);
      return;
    }

    setIsSyncingSb(true);
    setSbSyncStatus("Saving entire portfolio to Supabase Cloud database...");
    try {
      const res = await savePortfolioToSupabase(formData);
      if (res.success) {
        setSbSyncStatus("✓ Successfully synced all portfolio data to Supabase Cloud! Visible worldwide.");
      } else {
        setSbSyncStatus(`⚠️ Sync failed: ${res.error}`);
      }
    } catch (err) {
      setSbSyncStatus(`⚠️ Error: ${String(err)}`);
    } finally {
      setIsSyncingSb(false);
      setTimeout(() => setSbSyncStatus(""), 6000);
    }
  };

  const handleClearCache = () => {
    if (
      window.confirm(
        "Clear this device's local cache and reload fresh data directly from the server?",
      )
    ) {
      clearLocalPortfolioCache();
      window.location.reload();
    }
  };

  const handleTestGitHubPush = async () => {
    if (!githubToken.trim()) {
      setGhTestStatus("Please paste your GitHub token below first.");
      return;
    }
    setGhTestStatus("Pushing update directly to GitHub repository...");
    const res = await pushToGitHub(formData, githubToken.trim());
    if (res.success) {
      setGhTestStatus("✓ Direct sync test successful! GitHub is updated and building.");
    } else {
      setGhTestStatus(`Error: ${res.message}`);
    }
    setTimeout(() => setGhTestStatus(""), 6000);
  };

  useEffect(() => {
    setFormData(content);
  }, [content]);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }

      // Check Supabase session first
      if (isSupabaseConfigured) {
        getCurrentAdminUser().then((user) => {
          if (user) {
            setSupabaseUser(user);
            setIsUnlocked(true);
          }
        });
      }

      const unlockedSession = sessionStorage.getItem("portfolio_editor_unlocked") === "true";
      if (unlockedSession) {
        setIsUnlocked(true);
      } else if (!supabaseUser) {
        setIsUnlocked(false);
        setPasswordInput("");
        setErrorMsg("");
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = localStorage.getItem("portfolio_admin_password") || PASSWORD_KEY;
    if (passwordInput.trim() === currentPass) {
      setIsUnlocked(true);
      sessionStorage.setItem("portfolio_editor_unlocked", "true");
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect password. Please try again.");
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsSubmittingAuth(true);
    setErrorMsg("");
    try {
      const res = await signInAdmin(adminEmail, adminPassword);
      if (res.success && res.user) {
        setSupabaseUser(res.user);
        setIsUnlocked(true);
        sessionStorage.setItem("portfolio_editor_unlocked", "true");
      } else {
        setErrorMsg(res.error || "Authentication failed. Check your Supabase admin credentials.");
      }
    } catch (err) {
      setErrorMsg(`Login error: ${String(err)}`);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLockOut = async () => {
    if (supabaseUser) {
      await signOutAdmin();
      setSupabaseUser(null);
    }
    sessionStorage.removeItem("portfolio_editor_unlocked");
    setIsUnlocked(false);
    setPasswordInput("");
    setAdminPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    const res = await savePortfolioContent(formData);
    if (res.savedToSupabase) {
      setSaveStatusText("✓ Saved to Supabase Cloud! Live globally across all devices.");
    } else if (res.supabaseError) {
      setSaveStatusText(`⚠️ Saved locally, but Supabase error: ${res.supabaseError}`);
    } else if (res.pushedToGitHub) {
      setSaveStatusText("✓ Saved & Pushed to GitHub! Updating globally...");
    } else if (res.savedToDisk) {
      setSaveStatusText("✓ Saved to project files! Push to GitHub to update mobile.");
    } else {
      setSaveStatusText("✓ Saved locally!");
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setSaveStatusText("");
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset EVERYTHING on the website back to original defaults?",
      )
    ) {
      onReset();
      onClose();
    }
  };

  // Add new Project
  const handleAddProject = () => {
    const newProject: ProjectItem = {
      t: "New Project Title",
      d: "Comprehensive analysis and interactive dashboards created to solve business challenges.",
      tags: ["Power BI", "SQL", "Analytics"],
      grad: "from-chart-4/30 to-accent/40",
      link: formData.resumeUrl,
    };
    setFormData({
      ...formData,
      projects: [newProject, ...formData.projects],
    });
  };

  // Remove Project
  const handleRemoveProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };

  // Add new Skill / Tool
  const handleAddTool = () => {
    const newTool: ToolItem = {
      n: "New Skill",
      i: "⚡",
    };
    setFormData({
      ...formData,
      tools: [...formData.tools, newTool],
    });
  };

  // Remove Skill
  const handleRemoveTool = (index: number) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((_, i) => i !== index),
    });
  };

  // Add Experience
  const handleAddExperience = () => {
    const newExp: JourneyItem = {
      icon: "💼",
      role: "New Role",
      co: "Company or Project",
      date: "2026 – Present",
      points: ["Key achievement or responsibility", "Data analytics contribution"],
    };
    setFormData({
      ...formData,
      journey: [...formData.journey, newExp],
    });
  };

  // Add Cert
  const handleAddCert = () => {
    const newCert: CertItem = {
      i: "📜",
      t: "New Certification",
      by: "Issuing Organization",
      y: "2026",
    };
    setFormData({
      ...formData,
      certifications: [...formData.certifications, newCert],
    });
  };

  const inputClass =
    "w-full rounded-xl bg-muted/70 border border-white/10 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none transition";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-card/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-accent/25 border border-accent/30 grid place-items-center text-lg shadow-sm">
              ⚙️
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Portfolio Content Editor
                </h2>
                {isUnlocked && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <span>●</span>
                    <span>{supabaseUser ? `Cloud: ${supabaseUser.email}` : "Unlocked"}</span>
                  </span>
                )}
                {isSupabaseConfigured ? (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[10px] font-semibold hidden sm:inline-flex items-center gap-1">
                    <span>☁️</span>
                    <span>Supabase Connected</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[10px] font-semibold hidden sm:inline-flex items-center gap-1">
                    <span>⚡</span>
                    <span>Offline / Local Mode</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isUnlocked
                  ? "Customize everything on the website: names, projects, skills, links"
                  : "Enter your admin credentials or passcode to unlock editing"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                type="button"
                onClick={handleLockOut}
                title="Lock Editor"
                className="h-8 px-2.5 rounded-lg bg-muted/60 hover:bg-muted border border-white/10 text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1.5 cursor-pointer"
              >
                🔒 Lock
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="h-9 w-9 rounded-full bg-muted/60 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PASSWORD & AUTH GATE IF LOCKED */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-5">
            <div className="h-16 w-16 rounded-3xl bg-accent/20 border border-accent/30 grid place-items-center text-3xl shadow-soft animate-bounce">
              🔒
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Protected Content Editor</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Only the portfolio owner can edit live content. Sign in to update your Supabase cloud database.
              </p>
            </div>

            {/* Auth Mode Toggle if Supabase is configured */}
            {isSupabaseConfigured && (
              <div className="flex items-center p-1 rounded-xl bg-muted/70 border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("supabase");
                    setErrorMsg("");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    authMode === "supabase"
                      ? "bg-accent text-accent-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ☁️ Supabase Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("pin");
                    setErrorMsg("");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    authMode === "pin"
                      ? "bg-accent text-accent-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🔑 Master Passcode
                </button>
              </div>
            )}

            {authMode === "supabase" && isSupabaseConfigured ? (
              <form onSubmit={handleSupabaseLogin} className="w-full max-w-sm space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="admin@example.com"
                    className="w-full rounded-2xl bg-muted/80 border border-white/15 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none transition"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder="Enter Supabase password..."
                      className="w-full rounded-2xl bg-muted/80 border border-white/15 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none transition pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive font-medium animate-pulse text-center">{errorMsg}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingAuth ? "Authenticating..." : "Sign In & Edit →"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Enter passcode (default: 252525)..."
                    className="w-full rounded-2xl bg-muted/80 border border-white/15 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none transition pr-11"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive font-medium animate-pulse">{errorMsg}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm cursor-pointer"
                  >
                    Unlock & Edit →
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Tab navigation - shrink-0 with pill tabs to prevent any vertical squishing */}
            <div className="px-4 sm:px-6 py-2.5 flex items-center gap-2 border-b border-border/60 text-xs font-semibold overflow-x-auto no-scrollbar shrink-0 bg-muted/20">
              {(
                [
                  { id: "profile", label: "👤 Profile" },
                  { id: "projects", label: `📁 Projects (${formData.projects.length})` },
                  { id: "skills", label: `⚡ Skills (${formData.tools.length})` },
                  { id: "about", label: "💡 About" },
                  { id: "stats", label: "📊 Stats" },
                  { id: "experience", label: "💼 Journey & Certs" },
                  { id: "contact", label: "✉️ Contact" },
                  { id: "sync", label: "📱 Mobile & GitHub Sync" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer leading-normal ${
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground font-bold shadow-sm shadow-accent/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Editable Forms */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
              {/* TAB: PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-white/5">
                    <h4 className="text-sm font-bold text-foreground">Profile & Identity</h4>
                    <p className="text-xs text-muted-foreground">
                      Customize your name, professional title, resume link, and bio
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Yattapu Ganesh Kumar Reddy"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Titles / Roles Headline
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={formData.roles}
                      onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                      placeholder="e.g. Data Analyst | Power BI Developer | UI/UX Designer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Profile Picture Image URL
                    </label>
                    <input
                      type="url"
                      className={inputClass}
                      value={formData.profileImageUrl || ""}
                      onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                      placeholder="https://... (or leave empty for default cutout photo)"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Paste a direct image URL (PNG, JPG, WebP) or leave empty to use your default cutout photo.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Resume Link (Google Drive / Portfolio Folder)
                    </label>
                    <input
                      type="url"
                      className={inputClass}
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      required
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      This link opens when visitors click the "Resume" button and project view
                      links.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Hero Introduction Bio
                    </label>
                    <textarea
                      rows={3}
                      className={inputClass}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Describe your passion and focus..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* TAB: PROJECTS (WITH PLUS ICON TO ADD NEW) */}
              {activeTab === "projects" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Featured Projects List</h4>
                      <p className="text-xs text-muted-foreground">
                        Add, edit, or remove showcase projects
                      </p>
                    </div>
                    {/* PLUS ICON TO ADD NEW PROJECT */}
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm"
                    >
                      <span className="text-sm">➕</span>
                      <span>Add Project</span>
                    </button>
                  </div>

                  {/* VIEW ALL PROJECTS BUTTON CUSTOMIZATION CARD */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>🔗 "View All Projects" Button Settings</span>
                        </h5>
                        <p className="text-[11px] text-muted-foreground">
                          Customize the header button text and link destination shown in the Projects section
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                        Header CTA
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                          Button Text
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          value={formData.viewAllProjectsText ?? "View All Projects →"}
                          placeholder="View All Projects →"
                          onChange={(e) =>
                            setFormData({ ...formData, viewAllProjectsText: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                          Button Link URL (GitHub, Drive, Portfolio, etc.)
                        </label>
                        <input
                          type="url"
                          className={inputClass}
                          value={formData.viewAllProjectsUrl ?? formData.resumeUrl}
                          placeholder="https://github.com/your-username"
                          onChange={(e) =>
                            setFormData({ ...formData, viewAllProjectsUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Preview of Button */}
                    <div className="pt-1 flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Live Preview:
                      </span>
                      <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-card border border-white/20 text-white shadow-sm">
                        {formData.viewAllProjectsText || "View All Projects →"}
                      </span>
                    </div>
                  </div>

                  {formData.projects.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-muted/40 border border-white/5 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                          <span>Project #{idx + 1}</span>
                        </span>
                        {formData.projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(idx)}
                            className="text-xs text-muted-foreground hover:text-destructive transition px-2 py-1 rounded-lg hover:bg-destructive/10"
                            title="Delete this project"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                          Title
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          value={p.t}
                          onChange={(e) => {
                            const next = [...formData.projects];
                            next[idx] = { ...next[idx], t: e.target.value };
                            setFormData({ ...formData, projects: next });
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          className={inputClass}
                          value={p.d}
                          onChange={(e) => {
                            const next = [...formData.projects];
                            next[idx] = { ...next[idx], d: e.target.value };
                            setFormData({ ...formData, projects: next });
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          value={p.tags.join(", ")}
                          onChange={(e) => {
                            const next = [...formData.projects];
                            next[idx] = {
                              ...next[idx],
                              tags: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            };
                            setFormData({ ...formData, projects: next });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                          Project Image URL (optional)
                        </label>
                        <input
                          type="url"
                          className={inputClass}
                          value={p.img || ""}
                          placeholder="https://example.com/image.png"
                          onChange={(e) => {
                            const next = [...formData.projects];
                            next[idx] = { ...next[idx], img: e.target.value };
                            setFormData({ ...formData, projects: next });
                          }}
                        />
                        {p.img && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-white/10 h-24 w-full">
                            <img
                              src={p.img}
                              alt="Project preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                          Project Link (optional)
                        </label>
                        <input
                          type="url"
                          className={inputClass}
                          value={p.link || ""}
                          placeholder="https://your-project-link.com"
                          onChange={(e) => {
                            const next = [...formData.projects];
                            next[idx] = { ...next[idx], link: e.target.value };
                            setFormData({ ...formData, projects: next });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: SKILLS & TOOLS (WITH PLUS ICON TO ADD NEW) */}
              {activeTab === "skills" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Skills & Tools Grid</h4>
                      <p className="text-xs text-muted-foreground">
                        Add or customize your tech stack badges
                      </p>
                    </div>
                    {/* PLUS ICON TO ADD NEW SKILL */}
                    <button
                      type="button"
                      onClick={handleAddTool}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm"
                    >
                      <span className="text-sm">➕</span>
                      <span>Add Skill</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.tools.map((tool, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-muted/40 border border-white/5 flex items-center gap-2.5 justify-between"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            className="w-11 h-10 rounded-lg bg-muted text-center text-lg border border-white/10 focus:border-accent focus:outline-none"
                            value={tool.i}
                            onChange={(e) => {
                              const next = [...formData.tools];
                              next[idx] = { ...next[idx], i: e.target.value };
                              setFormData({ ...formData, tools: next });
                            }}
                            title="Emoji Icon"
                          />
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 rounded-lg bg-muted text-xs font-semibold border border-white/10 focus:border-accent focus:outline-none"
                            value={tool.n}
                            onChange={(e) => {
                              const next = [...formData.tools];
                              next[idx] = { ...next[idx], n: e.target.value };
                              setFormData({ ...formData, tools: next });
                            }}
                            placeholder="Skill Name"
                            required
                          />
                        </div>
                        {formData.tools.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(idx)}
                            className="text-muted-foreground hover:text-destructive text-sm px-1.5"
                            title="Delete"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: ABOUT SECTION */}
              {activeTab === "about" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-white/5">
                    <h4 className="text-sm font-bold text-foreground">About Narrative & Philosophy</h4>
                    <p className="text-xs text-muted-foreground">
                      Craft your personal bio, quote, and impact statistics
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      About Headline
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={formData.aboutHeadline}
                      onChange={(e) => setFormData({ ...formData, aboutHeadline: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      About Narrative Text
                    </label>
                    <textarea
                      rows={7}
                      className={inputClass}
                      value={formData.aboutText}
                      onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Quote Text
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        value={formData.aboutQuote}
                        onChange={(e) => setFormData({ ...formData, aboutQuote: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Quote Author
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        value={formData.aboutQuoteAuthor}
                        onChange={(e) =>
                          setFormData({ ...formData, aboutQuoteAuthor: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Stat Pills
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.aboutStats.map((st, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-muted/40 border border-white/5 space-y-1.5"
                        >
                          <input
                            type="text"
                            className="w-full text-sm font-bold bg-muted px-2 py-1 rounded border border-white/10"
                            value={st.v}
                            onChange={(e) => {
                              const next = [...formData.aboutStats];
                              next[idx] = { ...next[idx], v: e.target.value };
                              setFormData({ ...formData, aboutStats: next });
                            }}
                          />
                          <input
                            type="text"
                            className="w-full text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded border border-white/10"
                            value={st.l}
                            onChange={(e) => {
                              const next = [...formData.aboutStats];
                              next[idx] = { ...next[idx], l: e.target.value };
                              setFormData({ ...formData, aboutStats: next });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: STATS BAR */}
              {activeTab === "stats" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-white/5">
                    <h4 className="text-sm font-bold text-foreground">Hero Stat Metrics</h4>
                    <p className="text-xs text-muted-foreground">
                      Customize the 4 main metrics shown in the hero stats banner
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {formData.stats.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-muted/40 border border-white/5 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="w-10 h-10 rounded-lg bg-muted text-center text-lg border border-white/10"
                            value={s.icon}
                            onChange={(e) => {
                              const next = [...formData.stats];
                              next[idx] = { ...next[idx], icon: e.target.value };
                              setFormData({ ...formData, stats: next });
                            }}
                            title="Icon"
                          />
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm font-bold border border-white/10"
                            value={s.v}
                            onChange={(e) => {
                              const next = [...formData.stats];
                              next[idx] = { ...next[idx], v: e.target.value };
                              setFormData({ ...formData, stats: next });
                            }}
                            placeholder="e.g. 20+"
                          />
                        </div>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground border border-white/10"
                          value={s.l}
                          onChange={(e) => {
                            const next = [...formData.stats];
                            next[idx] = { ...next[idx], l: e.target.value };
                            setFormData({ ...formData, stats: next });
                          }}
                          placeholder="Label (e.g. Projects Completed)"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: EXPERIENCE & CERTS */}
              {activeTab === "experience" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">Journey & Experience</h4>
                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs"
                      >
                        ➕ Add Experience
                      </button>
                    </div>

                    {formData.journey.map((j, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-muted/40 border border-white/5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              className="w-9 h-9 text-center bg-muted rounded border border-white/10"
                              value={j.icon}
                              onChange={(e) => {
                                const next = [...formData.journey];
                                next[idx] = { ...next[idx], icon: e.target.value };
                                setFormData({ ...formData, journey: next });
                              }}
                            />
                            <input
                              type="text"
                              className="flex-1 px-3 py-1.5 text-xs font-bold bg-muted rounded border border-white/10"
                              value={j.role}
                              onChange={(e) => {
                                const next = [...formData.journey];
                                next[idx] = { ...next[idx], role: e.target.value };
                                setFormData({ ...formData, journey: next });
                              }}
                            />
                          </div>
                          {formData.journey.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  journey: formData.journey.filter((_, i) => i !== idx),
                                });
                              }}
                              className="text-muted-foreground hover:text-destructive text-xs"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="px-2.5 py-1 text-xs bg-muted rounded border border-white/10"
                            value={j.co}
                            onChange={(e) => {
                              const next = [...formData.journey];
                              next[idx] = { ...next[idx], co: e.target.value };
                              setFormData({ ...formData, journey: next });
                            }}
                            placeholder="Company / Institution"
                          />
                          <input
                            type="text"
                            className="px-2.5 py-1 text-xs bg-muted rounded border border-white/10"
                            value={j.date}
                            onChange={(e) => {
                              const next = [...formData.journey];
                              next[idx] = { ...next[idx], date: e.target.value };
                              setFormData({ ...formData, journey: next });
                            }}
                            placeholder="Date range"
                          />
                        </div>
                        <textarea
                          rows={2}
                          className="w-full px-2.5 py-1.5 text-xs bg-muted rounded border border-white/10 resize-none"
                          value={j.desc ?? ""}
                          onChange={(e) => {
                            const next = [...formData.journey];
                            next[idx] = { ...next[idx], desc: e.target.value };
                            setFormData({ ...formData, journey: next });
                          }}
                          placeholder="Short description of this role (optional)"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">Certifications</h4>
                      <button
                        type="button"
                        onClick={handleAddCert}
                        className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs"
                      >
                        ➕ Add Certificate
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {formData.certifications.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-muted/40 border border-white/5 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="w-8 h-8 text-center bg-muted rounded text-sm"
                              value={c.i}
                              onChange={(e) => {
                                const next = [...formData.certifications];
                                next[idx] = { ...next[idx], i: e.target.value };
                                setFormData({ ...formData, certifications: next });
                              }}
                            />
                            <input
                              type="text"
                              className="flex-1 px-2.5 py-1 text-xs font-semibold bg-muted rounded"
                              value={c.t}
                              onChange={(e) => {
                                const next = [...formData.certifications];
                                next[idx] = { ...next[idx], t: e.target.value };
                                setFormData({ ...formData, certifications: next });
                              }}
                            />
                          </div>
                          <div className="flex gap-2 text-xs">
                            <input
                              type="text"
                              className="flex-1 px-2 py-0.5 text-[11px] bg-muted rounded"
                              value={c.by}
                              onChange={(e) => {
                                const next = [...formData.certifications];
                                next[idx] = { ...next[idx], by: e.target.value };
                                setFormData({ ...formData, certifications: next });
                              }}
                              placeholder="Issuer"
                            />
                            <input
                              type="text"
                              className="w-16 px-2 py-0.5 text-[11px] bg-muted rounded text-center"
                              value={c.y}
                              onChange={(e) => {
                                const next = [...formData.certifications];
                                next[idx] = { ...next[idx], y: e.target.value };
                                setFormData({ ...formData, certifications: next });
                              }}
                              placeholder="Year"
                            />
                          </div>
                          <input
                            type="url"
                            className="w-full px-2 py-0.5 text-[11px] bg-muted rounded border border-white/10"
                            value={c.img ?? ""}
                            onChange={(e) => {
                              const next = [...formData.certifications];
                              next[idx] = { ...next[idx], img: e.target.value };
                              setFormData({ ...formData, certifications: next });
                            }}
                            placeholder="Certificate image URL (optional)"
                          />
                          <input
                            type="url"
                            className="w-full px-2 py-0.5 text-[11px] bg-muted rounded border border-white/10"
                            value={c.link ?? ""}
                            onChange={(e) => {
                              const next = [...formData.certifications];
                              next[idx] = { ...next[idx], link: e.target.value };
                              setFormData({ ...formData, certifications: next });
                            }}
                            placeholder="Certificate link / verify URL (optional)"
                          />
                          {formData.certifications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  certifications: formData.certifications.filter((_, i) => i !== idx),
                                });
                              }}
                              className="text-[10px] text-muted-foreground hover:text-destructive transition text-right"
                            >
                              🗑️ Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CONTACT & SOCIALS */}
              {activeTab === "contact" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-white/5">
                    <h4 className="text-sm font-bold text-foreground">Contact & Social Channels</h4>
                    <p className="text-xs text-muted-foreground">
                      Update your contact headline, availability, channels, and social links
                    </p>
                  </div>

                  {/* Editable contact headline + subtext */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Contact Headline
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        value={formData.contactHeadline ?? ""}
                        onChange={(e) => setFormData({ ...formData, contactHeadline: e.target.value })}
                        placeholder="Let's Build Something Amazing."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Contact Sub-text
                      </label>
                      <textarea
                        rows={2}
                        className={inputClass}
                        value={formData.contactSubtext ?? ""}
                        onChange={(e) => setFormData({ ...formData, contactSubtext: e.target.value })}
                        placeholder="I'm open to opportunities, freelance projects…"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className={inputClass}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Currently Open To
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        value={formData.openToText}
                        onChange={(e) => setFormData({ ...formData, openToText: e.target.value })}
                        placeholder="Internships | Full-time Jobs"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        className={inputClass}
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        className={inputClass}
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MOBILE, CLOUD & GITHUB SYNC */}
              {activeTab === "sync" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">☁️</span>
                      <h4 className="text-sm font-bold text-cyan-300">
                        Cloud Database & Multi-Device Sync
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Changes saved to Supabase Cloud instantly reflect across your laptop, phone, tablet, and for all global visitors.
                    </p>
                  </div>

                  {/* 1. Supabase Cloud Database Sync */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h5 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <span>☁️</span>
                        <span>Supabase Cloud Database Status</span>
                      </h5>
                      {isSupabaseConfigured ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Connected to Cloud</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1.5">
                          <span>⚡</span>
                          <span>Configuration Needed</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isSupabaseConfigured
                        ? `Supabase is connected! ${supabaseUser ? `Authenticated as admin: ${supabaseUser.email}.` : "You are in passcode mode. Sign in with Supabase Admin for full RLS write permissions."}`
                        : "To enable live multi-device database syncing, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables (e.g. .env or Vercel Settings)."}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSyncToSupabase}
                        disabled={isSyncingSb}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs active:scale-95 transition cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        <span className={isSyncingSb ? "animate-spin" : ""}>🔄</span>
                        <span>{isSyncingSb ? "Saving to Cloud..." : "Sync All to Supabase Cloud"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePullLatest}
                        disabled={isPullingLive}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-white/15 text-foreground font-semibold text-xs hover:bg-muted active:scale-95 transition cursor-pointer disabled:opacity-50"
                      >
                        <span className={isPullingLive ? "animate-spin" : ""}>📥</span>
                        <span>{isPullingLive ? "Fetching..." : "Pull Latest from Cloud"}</span>
                      </button>
                    </div>

                    {sbSyncStatus && (
                      <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/30 text-xs text-foreground font-medium animate-in fade-in">
                        {sbSyncStatus}
                      </div>
                    )}
                  </div>

                  {/* 2. Live Device Cache & Reset */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h5 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <span>⚡</span>
                        <span>Device Cache Status</span>
                      </h5>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 border border-white/10">
                        {formData.updatedAt
                          ? `Updated: ${new Date(formData.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                          : "Default Data"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If another device made updates and this device retains older cached data, clear the cache to immediately reload directly from cloud:
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-destructive/15 hover:bg-destructive/25 border border-destructive/30 text-destructive-foreground font-semibold text-xs active:scale-95 transition cursor-pointer"
                      >
                        <span>🧹</span>
                        <span>Clear Stale Cache & Reload</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Direct Mobile-to-Cloud Sync via GitHub */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-white/10 space-y-3">
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span>☁️</span>
                      <span>Direct Mobile Sync (Save Anywhere, No Laptop Needed)</span>
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Want to edit on your <strong>mobile phone</strong> and automatically update your live website for all devices worldwide? Paste a GitHub Personal Access Token (classic token with <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">repo</code> scope) below:
                    </p>

                    <div className="space-y-2">
                      <input
                        type="password"
                        value={githubToken}
                        onChange={(e) => handleSaveGitHubToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full rounded-xl bg-black/40 border border-white/15 px-3.5 py-2 text-xs font-mono text-cyan-300 placeholder:text-muted-foreground/50 focus:border-cyan-400 outline-none"
                      />
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          Target: <code className="text-white">{GITHUB_REPO}</code>
                        </span>
                        {githubToken.trim() && (
                          <button
                            type="button"
                            onClick={handleTestGitHubPush}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-white/15 text-xs text-cyan-300 hover:bg-muted active:scale-95 transition cursor-pointer"
                          >
                            <span>🚀</span>
                            <span>Test Direct Push to GitHub</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {ghTestStatus && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs font-medium text-amber-300">
                        {ghTestStatus}
                      </div>
                    )}
                  </div>

                  {/* 3. Laptop Local Dev & Manual Git Push */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-white/10 space-y-3">
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span>💻</span>
                      <span>Laptop Dev Server Auto-Save</span>
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When running locally (<code className="text-cyan-300 bg-black/40 px-1.5 py-0.5 rounded">npm run dev</code>), clicking <strong>Save Changes</strong> automatically writes directly to <code className="text-accent bg-black/40 px-1.5 py-0.5 rounded">src/data/portfolioData.json</code> and <code className="text-accent bg-black/40 px-1.5 py-0.5 rounded">public/portfolio-data.json</code> on your computer disk!
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => downloadPortfolioJson(formData)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm cursor-pointer"
                      >
                        <span>📥</span>
                        <span>Download portfolioData.json</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await copyPortfolioJson(formData);
                          if (ok) {
                            setCopiedNotice(true);
                            setTimeout(() => setCopiedNotice(false), 2000);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-white/15 text-white font-semibold text-xs hover:bg-muted active:scale-95 transition shadow-sm cursor-pointer"
                      >
                        <span>📋</span>
                        <span>{copiedNotice ? "✓ Copied to Clipboard!" : "Copy Full JSON"}</span>
                      </button>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-black/30 border border-white/10 text-xs font-mono text-cyan-300/90 space-y-1">
                      <div className="text-[11px] text-muted-foreground font-sans font-semibold mb-1">
                        Commands to push changes to GitHub (updates all phones and laptops in ~1 min):
                      </div>
                      <div>git add .</div>
                      <div>git commit -m "Update portfolio settings"</div>
                      <div>git push origin main</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-destructive underline transition"
                >
                  Reset Website to Defaults
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => downloadPortfolioJson(formData)}
                    title="Export data file"
                    className="px-3 py-2 rounded-xl bg-card border border-white/15 text-xs font-semibold hover:bg-muted transition flex items-center gap-1.5"
                  >
                    <span>📥</span>
                    <span className="hidden sm:inline">Export JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-muted/70 text-xs font-semibold hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm cursor-pointer"
                  >
                    {savedNotice ? (saveStatusText || "✓ Saved Live!") : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

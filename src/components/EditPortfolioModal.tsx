import { useState, useEffect } from "react";

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
  name: string;
  roles: string;
  bio: string;
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
  "profile" | "about" | "stats" | "projects" | "skills" | "experience" | "contact";

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

  // Password protection state
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData(content);
  }, [content]);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      const unlockedSession = sessionStorage.getItem("portfolio_editor_unlocked") === "true";
      if (unlockedSession) {
        setIsUnlocked(true);
      } else {
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

  const handleLockOut = () => {
    sessionStorage.removeItem("portfolio_editor_unlocked");
    setIsUnlocked(false);
    setPasswordInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 700);
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
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Portfolio Content Editor
                </h2>
                {isUnlocked && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    Unlocked
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isUnlocked
                  ? "Customize everything on the website: names, projects, skills, links"
                  : "Enter password to unlock editing"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                type="button"
                onClick={handleLockOut}
                title="Lock Editor"
                className="h-8 px-2.5 rounded-lg bg-muted/60 hover:bg-muted border border-white/10 text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
              >
                🔒 Lock
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="h-9 w-9 rounded-full bg-muted/60 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PASSWORD GATE IF LOCKED */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-5">
            <div className="h-16 w-16 rounded-3xl bg-accent/20 border border-accent/30 grid place-items-center text-3xl shadow-soft animate-bounce">
              🔒
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Protected Content Editor</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Enter your administrative password to edit projects, skills, names, and links.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="Enter administrative password..."
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

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-destructive underline transition"
                >
                  Reset Website to Defaults
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-muted/70 text-xs font-semibold hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition shadow-sm"
                  >
                    {savedNotice ? "✓ Saved Live!" : "Save Changes"}
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

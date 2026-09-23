import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import profileImg from "@/assets/ganesh.png";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { PortfolioContent, EditorTab, ProjectItem } from "@/components/EditPortfolioModal";
import defaultPortfolioData from "@/data/portfolioData.json";
import {
  savePortfolioContent,
  fetchLatestPortfolioContent,
  reconcilePortfolioData,
  clearLocalPortfolioCache,
  deduplicateContent,
} from "@/services/portfolioSync";

// Heavy components: loaded after first paint so hero renders instantly
const AiBackground = lazy(() =>
  import("@/components/AiBackground").then((m) => ({ default: m.AiBackground })),
);
const CustomCursor = lazy(() =>
  import("@/components/CustomCursor").then((m) => ({ default: m.CustomCursor })),
);
const EditPortfolioModal = lazy(() =>
  import("@/components/EditPortfolioModal").then((m) => ({ default: m.EditPortfolioModal })),
);


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yattapu Ganesh Kumar Reddy — Data Analyst & UI/UX Designer" },
      {
        name: "description",
        content:
          "Portfolio of Yattapu Ganesh Kumar Reddy: Power BI dashboards, SQL and Python analysis, and human-centered UI/UX design.",
      },
      { property: "og:title", content: "Yattapu Ganesh Kumar Reddy — Data Analyst" },
      {
        property: "og:description",
        content: "Dashboards, data analysis and UI/UX design that turn ideas into impact.",
      },
    ],
  }),
  component: Portfolio,
});

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "certifications", label: "Certificates" },
  { id: "contact", label: "Contact" },
];

const DEFAULT_CONTENT: PortfolioContent = {
  name: "Yattapu Ganesh Kumar Reddy",
  roles: "Data Analyst | Power BI Developer | UI/UX Designer",
  bio: "Bridging the gap between raw data and strategic business decisions. I architect intuitive Power BI dashboards, conduct in-depth SQL & Python analytics, and design human-centered UI/UX experiences that transform complex metrics into actionable clarity.",
  resumeUrl: "https://drive.google.com/drive/folders/16Nog2CQTeKkkRSgY3Vjsf44GiOaEv_7z?usp=sharing",
  viewAllProjectsText: "View All Projects →",
  viewAllProjectsUrl: "https://drive.google.com/drive/folders/16Nog2CQTeKkkRSgY3Vjsf44GiOaEv_7z?usp=sharing",
  aboutHeadline: "Transforming Complex Data into Strategic Clarity & Human-Centered Experiences",
  aboutText:
    "I am a final-year Computer Science (Data Science) undergraduate with a dedicated passion for Data Analytics, Business Intelligence, and UI/UX Design. My dual foundation in statistical data engineering and user-centered design enables me to bridge the gap between complex raw metrics and executive decision-making.\n\nThroughout my academic journey and internship experience at Analytics Career Connect, I have engineered scalable Power BI dashboards, automated SQL data workflows, and designed sleek web and mobile interfaces in Figma. I believe that data is only as valuable as the decisions it empowers — which is why every dashboard and interface I craft is centered around clarity, speed, and real-world impact.\n\nWhether developing intricate DAX measures, exploring multi-variable datasets with Python, or crafting high-fidelity interactive prototypes, I bring rigorous analytical problem-solving and an eye for polished visual excellence to every project.",
  aboutQuote: "Good design makes data understandable. Great design makes it actionable.",
  aboutQuoteAuthor: "Yattapu Ganesh Kumar Reddy",
  aboutStats: [
    { v: "03+", l: "Years Analytics & Design" },
    { v: "20+", l: "Dashboards & Projects Built" },
    { v: "100%", l: "Data Integrity & Impact" },
  ],
  email: "yattapuganesh123@gmail.com",
  phone: "+91 86390 71577",
  location: "Kadapa, Andhra Pradesh, India",
  openToText: "Internships | Full-time Jobs | Freelance Projects",
  contactHeadline: "Let's Build Something Amazing.",
  contactSubtext:
    "I'm open to opportunities, freelance projects or just a friendly chat about data, design or ideas. Let's connect and create real-world impact together.",
  linkedin: "https://www.linkedin.com/in/yattapugani",
  github: "https://github.com/yattapugani",
  behance: "https://behance.net",
  instagram: "https://instagram.com",
  stats: [
    { icon: "📁", v: "20+", l: "Projects Completed", tint: "bg-sage/30 text-sage" },
    { icon: "📊", v: "30+", l: "Dashboards Built", tint: "bg-accent/30 text-accent" },
    { icon: "🎓", v: "5+", l: "Tools Mastered", tint: "bg-chart-4/25 text-chart-4" },
    { icon: "👥", v: "100%", l: "Learning & Growing", tint: "bg-terracotta/25 text-terracotta" },
  ],
  tools: [
    { n: "Excel", i: "📗" },
    { n: "Power BI", i: "📊" },
    { n: "Tableau", i: "📈" },
    { n: "Looker Studio", i: "🔎" },
    { n: "SQL", i: "🗄️" },
    { n: "Python", i: "🐍" },
    { n: "Pandas", i: "🐼" },
    { n: "Figma", i: "🎨" },
    { n: "Canva", i: "🖌️" },
    { n: "Adobe Ps", i: "🖼️" },
  ],
  projects: [
    {
      t: "E-Commerce Sales Analysis",
      d: "Interactive dashboard to track sales, profit, customer behavior and product performance.",
      tags: ["Power BI", "Data Analytics"],
      grad: "from-chart-4/30 to-accent/40",
    },
    {
      t: "Job Market Analysis (India)",
      d: "Scraped and analysed 50K+ job postings to find hiring trends, top skills and salary insights.",
      tags: ["Looker Studio", "Web Scraping"],
      grad: "from-ink to-primary/80",
    },
    {
      t: "Dashboard UI Design",
      d: "Modern and intuitive dashboard design template created in Figma.",
      tags: ["Figma", "UI/UX"],
      grad: "from-sage/40 to-chart-4/25",
    },
    {
      t: "Mobile App Concept",
      d: "Clean and minimal mobile app UI for a productivity platform.",
      tags: ["Figma", "Product Design"],
      grad: "from-accent/30 to-sand",
    },
  ],
  journey: [
    {
      icon: "💼",
      role: "Data Analyst Intern",
      co: "Analytics Career Connect (ACC)",
      date: "Mar 2026 – Present",
      desc: "Working in a professional analytics environment, building real-world dashboards and conducting data-driven analysis to support business decision-making.",
      points: [
        "Built Power BI dashboards for real business datasets",
        "Performed advanced data cleaning, EDA and visualization",
        "Collaborated with a cross-functional analytics team",
      ],
    },
    {
      icon: "🎓",
      role: "B.Tech – CSE (Data Science)",
      co: "Vemu Institute of Technology, Kadapa",
      date: "2023 – 2027",
      desc: "Pursuing a 4-year undergraduate degree specializing in Data Science, studying machine learning, database systems, analytics, and software engineering fundamentals.",
      points: [
        "Coursework in ML, DBMS, Statistics & Data Structures",
        "Built 10+ academic and personal real-world projects",
        "Active in hackathons, workshops and online certifications",
      ],
    },
    {
      icon: "✨",
      role: "Freelance Designer",
      co: "Self-Initiated / Independent",
      date: "2024 – Present",
      desc: "Offering UI/UX design services, data visualization and branding to startups and individuals looking for polished, human-centered digital experiences.",
      points: [
        "Designed UI/UX prototypes, posters and dashboards in Figma",
        "Delivered creative branding assets for early-stage startups",
        "Exploring freelance platforms and real-world client projects",
      ],
    },
  ],
  certifications: [
    {
      i: "📊",
      t: "Power BI Data Analyst",
      by: "Microsoft Learn",
      y: "2026",
      img: "",
      link: "https://learn.microsoft.com",
    },
    {
      i: "🗄️",
      t: "SQL (Advanced)",
      by: "HackerRank",
      y: "2026",
      img: "",
      link: "https://hackerrank.com",
    },
    {
      i: "📗",
      t: "Excel Skills for Business",
      by: "Coursera",
      y: "2026",
      img: "",
      link: "https://coursera.org",
    },
    {
      i: "📈",
      t: "Tableau Desktop Specialist",
      by: "Coursera",
      y: "2026",
      img: "",
      link: "https://coursera.org",
    },
  ],
};

function Portfolio() {
  const [content, setContent] = useState<PortfolioContent>(
    (defaultPortfolioData as unknown as PortfolioContent) || DEFAULT_CONTENT,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<EditorTab>("profile");
  const [active, setActive] = useState("home");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Ref to track whether the edit modal is open so we skip
  // visibility-change reloads while editing (prevents duplicate data)
  const isEditModalOpenRef = useRef(false);

  const [typedRole, setTypedRole] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Smooth page fade-in on mount
    const t = setTimeout(() => setPageReady(true), 80);

    const defaultData =
      (defaultPortfolioData as unknown as PortfolioContent) || DEFAULT_CONTENT;

    // Single-pass data load: Supabase is source of truth.
    // localStorage is only used as instant fallback if Supabase fails.
    const loadData = async () => {
      try {
        // Try Supabase first (cloud = source of truth)
        const cloudData = await fetchLatestPortfolioContent();
        if (cloudData && cloudData.name) {
          // Got fresh cloud data — set once, no double render
          const merged: PortfolioContent = deduplicateContent({
            ...defaultData,
            ...cloudData,
            tools: cloudData.tools && cloudData.tools.length > 0 ? cloudData.tools : defaultData.tools,
            stats: cloudData.stats && cloudData.stats.length > 0 ? cloudData.stats : defaultData.stats,
            journey: cloudData.journey && cloudData.journey.length > 0 ? cloudData.journey : defaultData.journey,
            certifications: cloudData.certifications && cloudData.certifications.length > 0 ? cloudData.certifications : defaultData.certifications,
            projects: cloudData.projects && cloudData.projects.length > 0 ? cloudData.projects : defaultData.projects,
          });
          setContent(merged);
          // Also update localStorage cache for offline resilience
          try {
            localStorage.setItem("portfolio_content_v4", JSON.stringify(merged));
          } catch {}
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to localStorage:", err);
      }

      // Supabase unavailable — use localStorage cache or default
      try {
        const saved = localStorage.getItem("portfolio_content_v4");
        if (saved) {
          const localData = JSON.parse(saved);
          setContent(deduplicateContent({ ...defaultData, ...localData }));
        } else {
          setContent(deduplicateContent(defaultData));
        }
      } catch {
        setContent(deduplicateContent(defaultData));
      }
    };

    loadData();

    // Re-sync when user switches back to this tab
    // Skip reload if the edit modal is open to prevent duplicate data
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isEditModalOpenRef.current) {
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cross-tab sync (when another tab saves to localStorage)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "portfolio_content_v4" && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setContent(updated);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    const onScroll = () => {
      setShowTopBtn(window.scrollY > 420);

      // Smooth navbar active-section spy — offset matches fixed header height
      const sections = NAV.map((n) => document.getElementById(n.id));
      const y = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const s = sections[i];
        if (s && s.offsetTop <= y) {
          setActive(NAV[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  // AI Dynamic Role Typewriter Effect
  useEffect(() => {
    const rolesList = [
      content.roles || "Data Analyst | Power BI Developer | UI/UX Designer",
      "Power BI Dashboard Architect & DAX Specialist",
      "SQL Data Modeling & Automated ETL Pipelines",
      "Human-Centered UI/UX & Figma Design Systems",
      "Predictive Data Analytics & Statistical Insights",
    ];

    const currentFull = rolesList[roleIndex % rolesList.length];
    const typingSpeed = isDeleting ? 25 : 55;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setTypedRole(currentFull.slice(0, typedRole.length + 1));
        if (typedRole.length + 1 === currentFull.length) {
          setTimeout(() => setIsDeleting(true), 2400);
        }
      } else {
        setTypedRole(currentFull.slice(0, typedRole.length - 1));
        if (typedRole.length === 0) {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % rolesList.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedRole, isDeleting, roleIndex, content.roles]);

  const handleSaveContent = (updated: PortfolioContent) => {
    setContent(deduplicateContent(updated));
  };

  const handleResetContent = () => {
    setContent(
      (defaultPortfolioData as unknown as PortfolioContent) || DEFAULT_CONTENT,
    );
    clearLocalPortfolioCache();
  };

  const openEditModal = () => {
    isEditModalOpenRef.current = true;
    setEditorInitialTab("profile");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    // Delay resetting the ref so any pending visibility event is skipped
    setTimeout(() => { isEditModalOpenRef.current = false; }, 400);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 85;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
      setActive(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  const socials = [
    {
      l: "in",
      h: content.linkedin || "https://www.linkedin.com/in/yattapugani",
      title: "LinkedIn",
    },
    { l: "GH", h: content.github || "https://github.com/yattapugani", title: "GitHub" },
    { l: "Bē", h: content.behance || "https://behance.net", title: "Behance" },
    { l: "IG", h: content.instagram || "https://instagram.com", title: "Instagram" },
    { l: "✉", h: `mailto:${content.email}`, title: "Email" },
  ];

  return (
    <div
      className="min-h-screen text-foreground relative selection:bg-accent/40 selection:text-foreground"
      style={{
        opacity: pageReady ? 1 : 0,
        transform: pageReady ? "none" : "translateY(8px)",
        transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Modern AI Dark Animated Background — deferred so hero paints first */}
      <Suspense fallback={null}>
        <AiBackground />
      </Suspense>

      {/* Modern AI Animated Cursor — deferred */}
      <Suspense fallback={null}>
        <CustomCursor />
      </Suspense>

      {/* Floating Glassmorphic Header Bar with Smooth Backdrop Transition */}
      <header className="fixed top-0 inset-x-0 z-50 py-3 px-4 md:px-6 transition-all duration-300">
        <div className="mx-auto max-w-7xl">
          <nav className="rounded-full bg-card/85 backdrop-blur-xl border border-white/10 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-lift transition-all duration-300">
            <a
              href="#home"
              onClick={(e) => scrollToSection(e, "home")}
              className="flex items-center gap-2.5 font-bold tracking-tight text-foreground hover:opacity-90 transition duration-300"
            >
              <span className="h-8 w-8 rounded-lg bg-accent text-accent-foreground grid place-items-center text-xs font-black shadow-sm">
                YG
              </span>
              <span className="hidden sm:inline font-bold text-sm tracking-tight">
                {content.name.split(" ").slice(0, 2).join(" ")}
              </span>
            </a>

            {/* Navigation links: About, Projects, Skills, etc. */}
            <ul className="flex items-center gap-1 text-xs md:text-sm font-medium overflow-x-auto no-scrollbar py-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => scrollToSection(e, n.id)}
                    className={`px-3.5 py-1.5 rounded-full transition-all duration-300 ease-out whitespace-nowrap ${
                      active === n.id
                        ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "contact")}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm"
              >
                Let's Connect
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section id="home" className="relative pt-24 md:pt-32 pb-12 md:pb-16 scroll-mt-24 overflow-hidden">
          {/* Ambient animated floating color orbs */}
          <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-blob-1" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-blob-2" />

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <ScrollReveal variant="up" delay={50}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-3.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Portfolio 2026
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  <span className="text-white drop-shadow-sm">
                    {content.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <br />
                  <span className="text-gradient-bright-amber drop-shadow-md">
                    {content.name.split(" ").slice(2).join(" ") || "Reddy"}
                  </span>
                </h1>

                {/* RESUME BUTTON BELOW THE NAME */}
                <div className="mt-5 mb-5 flex flex-wrap items-center gap-3">
                  <a
                    href={content.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-bold text-xs sm:text-sm shadow-soft hover:shadow-lift hover:scale-105 active:scale-95 transition-all duration-200 border border-amber-400/40 group"
                  >
                    <span className="text-sm group-hover:translate-y-0.5 transition-transform">
                      ⬇
                    </span>
                    <span>Download Resume</span>
                    <span className="text-xs opacity-75 font-normal ml-0.5">↗</span>
                  </a>
                  <a
                    href="#projects"
                    onClick={(e) => scrollToSection(e, "projects")}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-card/90 border border-white/15 text-white font-semibold text-xs hover:bg-muted/90 transition duration-300 shadow-sm hover:border-accent/40 cursor-pointer"
                  >
                    View Projects ↓
                  </a>
                </div>

                <div className="flex items-center min-h-[32px]">
                  <p className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-gradient-bright-cyan flex items-center">
                    <span>{typedRole || content.roles}</span>
                    <span className="inline-block w-2 h-5 bg-cyan-400 ml-1.5 rounded-sm ai-cursor-blink shadow-[0_0_8px_#38bdf8]" />
                  </p>
                </div>

                <p className="mt-3.5 max-w-xl text-slate-300 leading-relaxed text-sm sm:text-base font-normal">
                  {content.bio}
                </p>

                <div className="mt-7 flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Connect:
                  </span>
                  <div className="flex items-center gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.l}
                        href={s.h}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.title}
                        className="h-9 w-9 grid place-items-center rounded-xl bg-card border border-white/15 text-white text-xs font-bold shadow-sm hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 transition-all"
                      >
                        {s.l}
                      </a>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Animated Profile Card (Cutout transparent PNG, no white box) */}
              <ScrollReveal
                variant="scale"
                delay={120}
                className="relative flex justify-center items-center min-h-[400px] md:min-h-[440px]"
              >
                {/* Glow blob */}
                <div className="profile-glow-blob" />

                {/* Spinning rings */}
                <div className="profile-ring profile-ring-1" />
                <div className="profile-ring profile-ring-2" />

                {/* Orbit skill badges */}
                <div className="profile-orbit-wrap">
                  <div className="profile-orbit-badge profile-badge-tl">📊 Power BI</div>
                  <div className="profile-orbit-badge profile-badge-tr">🐍 Python</div>
                  <div className="profile-orbit-badge profile-badge-bl">🎨 Figma</div>
                  <div className="profile-orbit-badge profile-badge-br">🗄️ SQL</div>
                </div>

                {/* Profile photo container with transparent cutout image */}
                <div className="profile-photo-outer animate-profile-entry">
                  <span className="profile-shimmer" />
                  <img
                    src={content.profileImageUrl || profileImg}
                    alt={content.name}
                    className="profile-photo-img object-cover"
                    fetchPriority="high"
                    decoding="async"
                    width={280}
                    height={340}
                  />
                </div>

                {/* Floating info card */}
                <div className="profile-info-card animate-float">
                  <span className="profile-info-dot" />
                  <span>
                    <p className="text-xs text-muted-foreground leading-tight">
                      " Driven by curiosity.
                    </p>
                    <p className="text-xs font-bold text-foreground">Focused on impact.</p>
                  </span>
                </div>

                {/* Floating stats pill */}
                <div className="profile-stats-pill animate-float-delayed">
                  <span className="text-base">🏆</span>
                  <span>
                    <p className="text-[11px] font-bold leading-none text-foreground">
                      20+ Projects
                    </p>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                  </span>
                </div>
              </ScrollReveal>
            </div>

            {/* STATS BAR */}
            <ScrollReveal variant="up" delay={180}>
              <div className="mt-14 rounded-3xl card-soft grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 overflow-hidden backdrop-blur-md card-ambient-breathe">
                {content.stats.map((s, idx) => (
                  <div
                    key={s.l + idx}
                    className="flex items-center gap-3.5 p-5 md:p-6 hover:bg-muted/40 transition-colors bg-card/90"
                  >
                    <span
                      className={`h-11 w-11 rounded-2xl grid place-items-center text-xl shrink-0 ${s.tint} shadow-md border border-white/10`}
                    >
                      {s.icon}
                    </span>
                    <span>
                      <span className="block text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                        {s.v}
                      </span>
                      <span className="block text-xs text-slate-300 font-medium mt-0.5">{s.l}</span>
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>


          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-16 md:py-20 scroll-mt-20 relative overflow-hidden">
          {/* Subtle animated background orbs */}
          <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-blob-2" />

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            {/* Top Grid: Narrative & Quote/Stats */}
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left Column (7 cols): Detailed Narrative */}
              <ScrollReveal variant="up" className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-3 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  About Me & Professional Focus
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug tracking-tight text-white">
                  {content.aboutHeadline}
                </h2>

                <div className="mt-5 space-y-3.5 text-slate-300 leading-relaxed text-sm sm:text-base font-normal">
                  {content.aboutText.split("\n\n").map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Key Focus Tags with Bright Glowing Accents */}
                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 border border-amber-400/30 text-amber-200 font-semibold text-xs shadow-sm hover:scale-105 transition-transform">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> Data Architecture & Modeling
                  </span>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 border border-emerald-400/30 text-emerald-200 font-semibold text-xs shadow-sm hover:scale-105 transition-transform">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Executive KPI Dashboards
                  </span>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 border border-cyan-400/30 text-cyan-200 font-semibold text-xs shadow-sm hover:scale-105 transition-transform">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /> Human-Centered UI/UX
                  </span>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 border border-indigo-400/30 text-indigo-200 font-semibold text-xs shadow-sm hover:scale-105 transition-transform">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" /> End-to-End Problem Solving
                  </span>
                </div>
              </ScrollReveal>

              {/* Right Column (5 cols): Quote Card & Quick Facts */}
              <ScrollReveal variant="scale" delay={120} className="lg:col-span-5 space-y-5">
                {/* Quote Box */}
                <div className="rounded-3xl card-soft overflow-hidden backdrop-blur-md bg-card/90 border border-white/10 shadow-soft card-ambient-breathe">
                  <div className="p-6 md:p-7 bg-gradient-to-br from-sand/40 to-transparent">
                    <span className="text-4xl text-amber-400 leading-none font-serif select-none">“</span>
                    <p className="mt-1.5 text-base sm:text-lg md:text-xl leading-snug font-bold text-white italic">
                      {content.aboutQuote}
                    </p>
                    <p className="mt-3 text-xs tracking-wider uppercase text-amber-300 font-black">
                      — {content.aboutQuoteAuthor}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-white/10">
                    {content.aboutStats.map((x, idx) => (
                      <div key={idx} className="p-3.5 md:p-4 text-center bg-card/90 hover:bg-card transition-colors">
                        <div className="text-xl md:text-2xl font-black text-white tracking-tight">{x.v}</div>
                        <div className="mt-0.5 text-[11px] text-slate-300 font-medium leading-tight">{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Snapshot Matrix */}
                <div className="rounded-3xl card-soft p-5 backdrop-blur-md bg-card/85 border border-white/10 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Professional Snapshot
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Specialization</span>
                      <span className="font-bold text-white mt-0.5 block">Data Analytics & UI/UX</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Education</span>
                      <span className="font-bold text-white mt-0.5 block">B.Tech in CSE (Data Science)</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Experience</span>
                      <span className="font-bold text-white mt-0.5 block">Internship + Freelance</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                      <span className="font-bold text-emerald-300 mt-0.5 block flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Available for Roles
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Bottom: 4 Pillars of Professional Competence */}
            <ScrollReveal variant="up" delay={200} className="mt-14 pt-10 border-t border-white/10">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <p className="eyebrow text-amber-400 font-bold text-xs tracking-widest">● Core Capabilities</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-1.5">
                  What I Bring to Every Project
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
                  A balanced combination of analytical rigor, architectural clarity, and visual aesthetics.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl card-soft bg-card/80 border border-white/10 hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                  <div className="h-11 w-11 rounded-2xl bg-amber-400/20 border border-amber-400/35 grid place-items-center text-xl mb-3 shadow-sm">
                    📊
                  </div>
                  <h4 className="text-base font-bold text-white">Business Intelligence</h4>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    Custom Power BI & Tableau dashboards, complex DAX calculations, Star Schema modeling, and executive KPI scorecards.
                  </p>
                </div>

                <div className="p-5 rounded-3xl card-soft bg-card/80 border border-white/10 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-400/20 border border-emerald-400/35 grid place-items-center text-xl mb-3 shadow-sm">
                    🗄️
                  </div>
                  <h4 className="text-base font-bold text-white">Data Analytics & SQL</h4>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    Advanced SQL queries, automated ETL pipelines, exploratory data analysis (EDA) with Python Pandas, and statistical validation.
                  </p>
                </div>

                <div className="p-5 rounded-3xl card-soft bg-card/80 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                  <div className="h-11 w-11 rounded-2xl bg-cyan-400/20 border border-cyan-400/35 grid place-items-center text-xl mb-3 shadow-sm">
                    🎨
                  </div>
                  <h4 className="text-base font-bold text-white">Human-Centered UI/UX</h4>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    Figma wireframing, high-fidelity prototypes, accessible design systems, and converting convoluted data flows into clean interfaces.
                  </p>
                </div>

                <div className="p-5 rounded-3xl card-soft bg-card/80 border border-white/10 hover:border-indigo-400/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                  <div className="h-11 w-11 rounded-2xl bg-indigo-400/20 border border-indigo-400/35 grid place-items-center text-xl mb-3 shadow-sm">
                    ⚡
                  </div>
                  <h4 className="text-base font-bold text-white">Strategic Storytelling</h4>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    Translating messy data and stakeholder ambiguities into clear narratives, operational wins, and strategic business value.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="py-16 md:py-20 scroll-mt-20 relative overflow-hidden">
          {/* Subtle animated background orbs */}
          <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-blob-1" />

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <ScrollReveal variant="up">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/35 text-cyan-300 text-[11px] font-bold tracking-widest uppercase mb-3 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Featured Projects
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                    Projects that Create Impact
                  </h2>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <a
                    href={content.viewAllProjectsUrl || content.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-full bg-card border border-white/15 text-white hover:bg-muted hover:border-amber-400/50 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
                  >
                    {content.viewAllProjectsText || "View All Projects →"}
                  </a>
                </div>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {content.projects.map((p, idx) => (
                <ScrollReveal key={p.t + idx} variant="up" delay={idx * 80}>
                  <article
                    className="rounded-3xl card-soft overflow-hidden hover:shadow-lift hover:-translate-y-2 transition-all duration-300 h-full flex flex-col backdrop-blur-md bg-card/90 border border-white/10 hover:border-amber-400/50 group card-ambient-breathe cursor-pointer"
                    onClick={() => setSelectedProject(p)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => e.key === "Enter" && setSelectedProject(p)}
                    aria-label={`View ${p.t} case study`}
                  >
                    {/* Project image or gradient fallback */}
                    <div
                      className={`h-36 relative overflow-hidden ${!p.img ? `bg-gradient-to-br ${p.grad || "from-chart-4/30 to-accent/40"}` : ""}`}
                    >
                      {p.img ? (
                        <img
                          src={p.img}
                          alt={p.t}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            el.style.display = "none";
                            if (el.parentElement) {
                              el.parentElement.className = `h-36 relative overflow-hidden bg-gradient-to-br ${p.grad || "from-chart-4/30 to-accent/40"}`;
                            }
                          }}
                        />
                      ) : null}
                      {/* Gradient overlay on image for better text contrast */}
                      {p.img && (
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                      )}
                      {/* Case file badge */}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white/80 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span>📂</span> Case Study
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-cyan-950/70 text-cyan-300 font-bold border border-cyan-500/30"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <h3 className="mt-3 font-bold text-base leading-snug text-white group-hover:text-amber-300 transition-colors">
                          {p.t}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">{p.d}</p>
                      </div>
                      <div className="mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all duration-200">
                        View Case Study <span>→</span>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="py-16 md:py-20 scroll-mt-20 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal variant="up">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/35 text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-3 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Skills & Tools
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                    Tools I Work With
                  </h2>
                </div>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3.5">
              {content.tools.map((t, idx) => (
                <ScrollReveal key={t.n + idx} variant="scale" delay={idx * 30}>
                  <div className="tool-card rounded-2xl card-soft p-3.5 sm:p-4 text-center hover:shadow-soft backdrop-blur-md bg-card/90 border border-white/10 cursor-pointer">
                    <span className="tool-icon inline-block text-2xl sm:text-3xl select-none">
                      {t.i}
                    </span>
                    <div className="mt-2 text-xs font-semibold text-white">{t.n}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className="py-16 md:py-20 scroll-mt-20 relative overflow-hidden">
          {/* Subtle animated background orbs */}
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-blob-2" />

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <ScrollReveal variant="up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-3 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Experience
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                My Journey
              </h2>
            </ScrollReveal>

            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {content.journey.map((j, idx) => (
                <ScrollReveal key={j.role + idx} variant="up" delay={idx * 90}>
                  <div className="rounded-3xl card-soft p-6 h-full flex flex-col gap-4 hover:border-amber-400/50 hover:shadow-soft transition-all duration-300 backdrop-blur-md bg-card/90 border border-white/10 hover:-translate-y-1.5">
                    {/* Header */}
                    <div className="flex items-start gap-3.5">
                      <span className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-400/35 grid place-items-center text-xl shrink-0 shadow-sm">
                        {j.icon}
                      </span>
                      <div>
                        <h3 className="font-bold leading-tight text-base sm:text-lg text-white">{j.role}</h3>
                        <p className="text-xs sm:text-sm font-semibold text-amber-400 mt-0.5">{j.co}</p>
                        <p className="text-xs text-cyan-300 font-medium mt-0.5 tracking-wide">{j.date}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {j.desc && (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-l-2 border-amber-400/60 pl-3 font-normal">
                        {j.desc}
                      </p>
                    )}

                    {/* Bullet points */}
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                      {j.points.map((p, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section id="certifications" className="py-16 md:py-20 scroll-mt-20 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal variant="up">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-400/15 border border-indigo-400/35 text-indigo-300 text-[11px] font-bold tracking-widest uppercase mb-3 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Certifications
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                    Achievements & Certifications
                  </h2>
                </div>
                <a
                  href={content.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-amber-400 hover:text-amber-300 font-bold transition hover:scale-105"
                >
                  View All Certificates →
                </a>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {content.certifications.map((c, idx) => (
                <ScrollReveal key={c.t + idx} variant="up" delay={idx * 60}>
                  <div className="rounded-2xl card-soft flex flex-col overflow-hidden hover:shadow-soft hover:-translate-y-1.5 hover:border-amber-400/40 transition-all duration-300 backdrop-blur-md bg-card/90 border border-white/10 h-full group">
                    {/* Certificate image or emoji banner */}
                    {c.img ? (
                      <div className="relative w-full h-32 overflow-hidden bg-sand/30">
                        <img
                          src={c.img}
                          alt={c.t}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-20 bg-gradient-to-br from-amber-500/20 to-card/60 flex items-center justify-center">
                        <span className="text-3xl">{c.i}</span>
                      </div>
                    )}

                    {/* Card body */}
                    <div className="p-4 flex flex-col gap-1 flex-1">
                      <span className="font-bold text-sm leading-snug text-white">{c.t}</span>
                      <span className="text-xs text-cyan-300 font-medium">{c.by}</span>
                      <span className="text-[11px] text-amber-300 font-semibold">{c.y}</span>
                      {c.link && (
                        <a
                          href={c.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto pt-2 inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold hover:underline transition-colors duration-200"
                        >
                          Verify Certificate →
                        </a>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}

            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-16 md:py-20 scroll-mt-20 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal variant="up">
              <div className="rounded-[2.5rem] bg-card/90 border border-white/10 text-foreground p-7 md:p-10 lg:p-12 grid lg:grid-cols-3 gap-8 shadow-lift relative overflow-hidden backdrop-blur-xl card-ambient-breathe">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-3 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Let's Work Together
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug text-white">
                    {content.contactHeadline || "Let's Build Something Amazing."}
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                    {content.contactSubtext ||
                      "I'm open to opportunities, freelance projects or just a friendly chat about data, design or ideas."}
                  </p>
                  <div className="mt-6 flex gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.l}
                        href={s.h}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.title}
                        className="h-10 w-10 grid place-items-center rounded-xl bg-muted/70 border border-white/10 text-xs font-bold hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 transition-all duration-200"
                      >
                        {s.l}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="relative z-10">
                  <ContactForm recipientEmail={content.email} />
                </div>

                <div className="space-y-3.5 relative z-10">
                  <InfoItem icon="✉" k="Email" v={content.email} href={`mailto:${content.email}`} />
                  <InfoItem
                    icon="📞"
                    k="Phone"
                    v={content.phone}
                    href={`tel:${content.phone.replace(/\s+/g, "")}`}
                  />
                  <InfoItem icon="📍" k="Location" v={content.location} />
                  <div className="rounded-2xl bg-muted/60 border border-white/10 p-4 flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-xs">
                      <span className="block font-semibold text-foreground">Currently Open to</span>
                      <span className="block text-muted-foreground mt-0.5">
                        {content.openToText}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-transparent">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2.5 font-medium text-foreground">
            <span className="h-7 w-7 rounded-lg bg-accent text-accent-foreground grid place-items-center text-[10px] font-black shadow-sm">
              YG
            </span>
            {content.name}
          </span>
          <ul className="flex flex-wrap gap-5 text-xs font-medium">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => scrollToSection(e, n.id)}
                  className="hover:text-accent transition-colors duration-300"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors font-medium cursor-pointer"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
            <span className="text-muted-foreground/50 hidden sm:inline">|</span>
            <span className="text-xs">
              © 2026 {content.name.split(" ").slice(0, 2).join(" ")}. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Controls (Settings & Back to Top) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5">
        <button
          type="button"
          onClick={openEditModal}
          title="Portfolio Settings (Password: 252525)"
          aria-label="Portfolio Settings"
          className="h-11 px-4 rounded-full bg-card/90 backdrop-blur-xl border border-white/20 shadow-lift flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs font-semibold group"
        >
          <span className="text-base group-hover:rotate-45 transition-transform duration-300">
            ⚙️
          </span>
          <span>Settings</span>
        </button>

        {showTopBtn && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="h-11 w-11 rounded-full bg-card/90 backdrop-blur border border-white/15 shadow-lift flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 transition-all text-sm"
          >
            ↑
          </button>
        )}
      </div>




      {/* Complete Website Content Editor Modal (Password Protected) — lazy loaded */}
      <Suspense fallback={null}>
        <EditPortfolioModal
          isOpen={isEditModalOpen}
          initialTab={editorInitialTab}
          onClose={closeEditModal}
          content={content}
          onSave={handleSaveContent}
          onReset={handleResetContent}
        />
      </Suspense>

      {/* Project Case-File Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          projects={content.projects}
          currentIndex={content.projects.findIndex((p) => p.t === selectedProject.t)}
          onSelectProject={setSelectedProject}
          resumeUrl={content.resumeUrl}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PROJECT CASE-FILE DETAIL MODAL
   Opens with a slide-up animation when a project card is tapped.
   Matches the high-tech case-file design from the user's reference.
───────────────────────────────────────────────────────── */
function ProjectDetailModal({
  project,
  projects = [],
  currentIndex = 0,
  onSelectProject,
  resumeUrl,
  onClose,
}: {
  project: ProjectItem;
  projects?: ProjectItem[];
  currentIndex?: number;
  onSelectProject?: (p: ProjectItem) => void;
  resumeUrl: string;
  onClose: () => void;
}) {
  // Close on Escape key, navigate on arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onSelectProject && projects.length > 1) {
        const prevIdx = (currentIndex - 1 + projects.length) % projects.length;
        onSelectProject(projects[prevIdx]);
      }
      if (e.key === "ArrowRight" && onSelectProject && projects.length > 1) {
        const nextIdx = (currentIndex + 1) % projects.length;
        onSelectProject(projects[nextIdx]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onSelectProject, currentIndex, projects]);

  // Prevent background scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const total = Math.max(projects.length, 1);
  const currentNum = String((currentIndex >= 0 ? currentIndex : 0) + 1).padStart(2, "0");
  const totalNum = String(total).padStart(2, "0");
  const primaryTag = project.tags[0] || "Analytics";

  const handlePrev = () => {
    if (onSelectProject && projects.length > 1) {
      const idx = (currentIndex - 1 + projects.length) % projects.length;
      onSelectProject(projects[idx]);
    }
  };

  const handleNext = () => {
    if (onSelectProject && projects.length > 1) {
      const idx = (currentIndex + 1) % projects.length;
      onSelectProject(projects[idx]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[94vh] flex flex-col bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden"
        style={{
          animation: "caseSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Case-file header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-300">
              CASE FILE · {currentNum} / {totalNum}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {projects.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="h-7 w-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xs text-white/70 hover:text-white transition active:scale-95"
                  title="Previous Project (Left Arrow)"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-7 w-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xs text-white/70 hover:text-white transition active:scale-95"
                  title="Next Project (Right Arrow)"
                >
                  ›
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xs text-white/70 hover:text-white transition active:scale-95 ml-1"
              title="Close (Escape)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Browser / Mockup Showcase Area */}
          <div className="relative mx-4 sm:mx-6 mt-5 rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden shadow-2xl">
            {/* Browser Window Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#181824]/90 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                <span className="ml-2 px-2.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-slate-400 border border-white/5 truncate max-w-[200px]">
                  {primaryTag.toUpperCase()} · PLATFORM
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                https://portfolio.ganesh/project/{project.t.toLowerCase().replace(/[^a-z0-9]/g, "-")}
              </div>
            </div>

            {/* Main Showcase Image / Interactive Screen */}
            <div className="relative h-48 sm:h-64 w-full bg-gradient-to-br from-black/80 via-[#13141f] to-[#1c1c2b] flex items-center justify-center overflow-hidden">
              {project.img ? (
                <img
                  src={project.img}
                  alt={project.t}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                /* Sleek High-Tech Dashboard Mockup matching screenshot */
                <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between relative select-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      <span className="text-sm font-bold text-white tracking-wide">{project.t}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                      ● LIVE SYSTEM
                    </span>
                  </div>

                  {/* High-tech dashboard visualization cards */}
                  <div className="grid grid-cols-3 gap-2 my-auto">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] font-mono text-slate-400">ANALYTICS ENGINE</div>
                      <div className="text-xs font-bold text-amber-300 mt-1 truncate">{primaryTag}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] font-mono text-slate-400">DATA ACCURACY</div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">99.8% Verified</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] font-mono text-slate-400">COMPONENTS</div>
                      <div className="text-xs font-bold text-cyan-300 mt-1">{project.tags.length} Modules</div>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" />
                  </div>
                </div>
              )}

              {/* Carousel Side Arrows */}
              {projects.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white flex items-center justify-center text-sm backdrop-blur transition active:scale-95"
                    aria-label="Previous Project"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white flex items-center justify-center text-sm backdrop-blur transition active:scale-95"
                    aria-label="Next Project"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* 3 Thumbnail preview indicators at the bottom */}
            <div className="flex items-center justify-center gap-2 py-2 bg-black/40 border-t border-white/5">
              {projects.slice(0, 3).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectProject && onSelectProject(p)}
                  className={`h-6 px-3 rounded-md text-[10px] font-mono font-bold transition flex items-center gap-1.5 border ${
                    p.t === project.t
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="truncate max-w-[80px]">{p.t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Project Details section matching reference screenshot */}
          <div className="px-5 sm:px-7 py-5 space-y-4">
            {/* Red Year Tag + Title */}
            <div>
              <div className="text-rose-500 font-mono text-xs font-bold tracking-wider mb-1">
                / {project.year || "2025"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {project.t}
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                {project.d}
              </p>
            </div>

            {/* 3 Top Spec Boxes matching screenshot */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  {primaryTag.includes("BI") || primaryTag.includes("Power") ? "AI MODEL / TOOL" : "PLATFORM"}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  {project.model || project.tags[0] || "Custom Engine"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  AUTH / CLIENT
                </div>
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  {project.client || "Personal Project"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  FEATURES
                </div>
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  {project.tags.length} specs
                </div>
              </div>
            </div>

            {/* 2x2 Details Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/10 flex items-start gap-2.5">
                <span className="text-sm mt-0.5">👤</span>
                <div className="min-w-0">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">CLIENT</div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">{project.client || "Personal Project"}</div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/10 flex items-start gap-2.5">
                <span className="text-sm mt-0.5">🎯</span>
                <div className="min-w-0">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">ROLE</div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">{project.role || "Solo Developer"}</div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/10 flex items-start gap-2.5">
                <span className="text-sm mt-0.5">📅</span>
                <div className="min-w-0">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">YEAR</div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">{project.year || "2025"}</div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/10 flex items-start gap-2.5">
                <span className="text-sm mt-0.5">✅</span>
                <div className="min-w-0">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">STATUS</div>
                  <div className="text-xs font-bold text-emerald-400 truncate mt-0.5">{project.status || "Shipped"}</div>
                </div>
              </div>
            </div>

            {/* Powertrain & Specs */}
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                POWERTRAIN &amp; SPECS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA matching screenshot */}
        <div className="px-5 sm:px-7 py-4 border-t border-white/10 flex items-center gap-3 shrink-0 bg-[#0a0a0f]/90 backdrop-blur">
          <a
            href={project.link || resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-extrabold text-sm text-center hover:opacity-95 active:scale-98 transition shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2"
          >
            <span>LIVE DEMO</span>
            <span className="text-xs">↗</span>
          </a>
          <a
            href={project.sourceLink || project.link || resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-sm text-center active:scale-98 transition flex items-center justify-center gap-2"
          >
            <span>⌥</span>
            <span>SOURCE</span>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes caseSlideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function ContactForm({ recipientEmail }: { recipientEmail: string }) {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `${encodeURIComponent(f.message)}%0D%0A%0D%0A— ${encodeURIComponent(f.name)} (${encodeURIComponent(f.email)})`;
    const subject = encodeURIComponent(f.subject || "Portfolio inquiry");
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    setSent(true);
  };
  const cls =
    "w-full rounded-xl bg-muted/60 border border-white/10 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-accent text-foreground transition";
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Your Name"
          className={cls}
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Your Email"
          className={cls}
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
      </div>
      <input
        placeholder="Subject"
        className={cls}
        value={f.subject}
        onChange={(e) => setF({ ...f, subject: e.target.value })}
      />
      <textarea
        required
        rows={4}
        placeholder="Your Message"
        className={cls}
        value={f.message}
        onChange={(e) => setF({ ...f, message: e.target.value })}
      />
      <button className="w-full px-5 py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:opacity-90 transition shadow-sm">
        Send Message →
      </button>
      {sent && <p className="text-xs text-accent mt-2">Opening your mail app…</p>}
    </form>
  );
}

function InfoItem({ icon, k, v, href }: { icon: string; k: string; v: string; href?: string }) {
  return (
    <div className="rounded-2xl bg-muted/50 border border-white/10 p-4 flex items-start gap-3">
      <span className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-sm shrink-0 text-foreground">
        {icon}
      </span>
      <span className="text-xs">
        <span className="block font-semibold text-foreground">{k}</span>
        {href ? (
          <a
            href={href}
            className="block text-muted-foreground hover:text-accent transition break-all"
          >
            {v}
          </a>
        ) : (
          <span className="block text-muted-foreground">{v}</span>
        )}
      </span>
    </div>
  );
}

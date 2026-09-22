import { useState, useEffect, useRef } from "react";
import type { PortfolioContent } from "@/components/EditPortfolioModal";

interface AiAssistantWidgetProps {
  content: PortfolioContent;
}

interface Message {
  sender: "user" | "ai";
  text: string;
  linkText?: string;
  linkHref?: string;
}

const PRESET_PROMPTS = [
  {
    label: "📊 Summarize Data & BI Skills",
    query: "What are Ganesh's core Data Analytics & BI skills?",
    response:
      "Ganesh specializes in end-to-end Data Analytics & Business Intelligence. He architects scalable Power BI dashboards, writes complex DAX measures, models data with Star Schemas, automates SQL ETL queries, and performs advanced statistical EDA using Python & Pandas.",
    linkText: "View Skills & Tools",
    linkHref: "#skills",
  },
  {
    label: "💼 What is his experience?",
    query: "Tell me about Ganesh's experience & journey",
    response:
      "Ganesh is currently a Data Analyst Intern at Analytics Career Connect (ACC) building executive dashboards for real enterprise datasets. He is also a final-year B.Tech Data Science student at Vemu Institute of Technology with 20+ projects delivered.",
    linkText: "Explore Experience",
    linkHref: "#experience",
  },
  {
    label: "🎨 UI/UX Design Approach",
    query: "How does Ganesh approach UI/UX design?",
    response:
      "Ganesh blends data analytics with human-centered Figma UI/UX design. He designs high-fidelity wireframes, interactive prototypes, and accessible dashboard templates that transform complex metrics into intuitive visual clarity.",
    linkText: "View UI/UX Projects",
    linkHref: "#projects",
  },
  {
    label: "🚀 Why hire Ganesh?",
    query: "Why should we hire Ganesh Kumar Reddy?",
    response:
      "Ganesh combines deep statistical data engineering with visual storytelling and user-centered design. He delivers actionable business value from day one with proven integrity, fast turnaround, and mastery over modern BI and analytics stacks.",
    linkText: "Download Resume",
    linkHref: "https://drive.google.com/drive/folders/16Nog2CQTeKkkRSgY3Vjsf44GiOaEv_7z?usp=sharing",
  },
  {
    label: "✉️ How to connect?",
    query: "How can I contact Ganesh?",
    response:
      "You can connect directly via email at yattapuganesh123@gmail.com, call +91 86390 71577, or send a message using the interactive contact form on this portfolio.",
    linkText: "Go to Contact",
    linkHref: "#contact",
  },
];

export function AiAssistantWidget({ content }: AiAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: `Hello! I'm Ganesh's AI Assistant. Ask me anything about his data analytics projects, Power BI dashboards, UI/UX design work, or background!`,
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedText, isTyping]);

  const handleSendQuery = (queryText: string, customResp?: { text: string; linkText?: string; linkHref?: string }) => {
    if (!queryText.trim() || isTyping) return;

    // Add user message
    const userMsg: Message = { sender: "user", text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);
    setDisplayedText("");

    // Determine AI response
    let answer = customResp?.text;
    let linkText = customResp?.linkText;
    let linkHref = customResp?.linkHref;

    if (!answer) {
      const lower = queryText.toLowerCase();
      if (lower.includes("resume") || lower.includes("cv")) {
        answer = `You can download Ganesh's complete verified Resume directly from his Google Drive repository.`;
        linkText = "Download Resume";
        linkHref = content.resumeUrl;
      } else if (lower.includes("project") || lower.includes("dashboard") || lower.includes("ecommerce")) {
        answer = `Ganesh has engineered over 20+ real-world projects including E-Commerce Sales Analytics, 50K+ Job Market Analytics, and Modern Figma Dashboard Design systems.`;
        linkText = "View Projects";
        linkHref = "#projects";
      } else if (lower.includes("tool") || lower.includes("skill") || lower.includes("power bi") || lower.includes("python") || lower.includes("sql")) {
        answer = `Ganesh is proficient in Power BI, SQL, Python (Pandas/NumPy), Tableau, Looker Studio, Excel, and Figma UI/UX Design.`;
        linkText = "View Skill Matrix";
        linkHref = "#skills";
      } else if (lower.includes("contact") || lower.includes("email") || lower.includes("phone") || lower.includes("hire") || lower.includes("job")) {
        answer = `Ganesh is actively open to Internships, Full-Time Roles, and Freelance opportunities. Reach him at ${content.email} or +91 86390 71577.`;
        linkText = "Connect with Ganesh";
        linkHref = "#contact";
      } else {
        answer = `Ganesh is a Data Analyst & UI/UX Designer specialized in turning raw data into strategic clarity. Feel free to explore his projects below or connect directly!`;
        linkText = "Explore Portfolio";
        linkHref = "#about";
      }
    }

    // Stream typewriter effect
    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex += 2;
      if (charIndex >= (answer?.length || 0)) {
        clearInterval(interval);
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: answer || "",
            linkText,
            linkHref,
          },
        ]);
        setDisplayedText("");
      } else {
        setDisplayedText(answer ? answer.slice(0, charIndex) : "");
      }
    }, 18);
  };

  return (
    <>
      {/* Floating AI Launcher Pill */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Copilot"
          className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-card/90 backdrop-blur-xl border border-cyan-400/40 shadow-lift hover:border-amber-400/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
            isOpen ? "ring-2 ring-amber-400/50" : "ai-cyber-badge"
          }`}
        >
          {/* Animated pulsing AI Brain / Waveform icon */}
          <div className="relative flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-500/30 to-amber-500/30 border border-cyan-400/50">
            <span className="text-sm select-none">⚡</span>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-cyan-300">
                AI Copilot
              </span>
              <span className="flex items-end gap-0.5 h-2.5 select-none">
                <span className="w-0.5 bg-cyan-400 rounded-full ai-wave-1" />
                <span className="w-0.5 bg-amber-400 rounded-full ai-wave-2" />
                <span className="w-0.5 bg-emerald-400 rounded-full ai-wave-3" />
              </span>
            </div>
            <span className="text-xs font-bold text-white block -mt-0.5">
              {isOpen ? "Close Assistant" : "Ask Ganesh AI"}
            </span>
          </div>
        </button>
      </div>

      {/* Futuristic Floating AI Modal / Window */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-50 w-[92vw] sm:w-[410px] max-h-[560px] flex flex-col rounded-3xl ai-conic-wrapper shadow-lift animate-profile-entry">
          <div className="ai-conic-inner flex flex-col h-full overflow-hidden border border-white/10 ai-scanline-sheen">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/10 bg-card/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-400/20 to-cyan-400/20 border border-cyan-400/40 grid place-items-center text-sm shadow-sm">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">Ganesh AI Copilot</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-400/15 border border-emerald-400/30 text-[9px] font-mono font-bold text-emerald-300">
                      v2.6 ONLINE
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 block">
                    Neural Query & Analytics Engine
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white grid place-items-center text-xs transition"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[320px] text-xs font-sans no-scrollbar">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.sender === "user"
                        ? "bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/40 text-white rounded-br-none"
                        : "bg-muted/80 border border-cyan-400/25 text-slate-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.linkHref && m.linkText && (
                      <a
                        href={m.linkHref}
                        onClick={() => {
                          if (m.linkHref?.startsWith("#")) {
                            setIsOpen(false);
                          }
                        }}
                        target={m.linkHref.startsWith("http") ? "_blank" : undefined}
                        rel={m.linkHref.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-amber-300 underline underline-offset-2 transition"
                      >
                        {m.linkText} →
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming Response Bubble */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 bg-muted/80 border border-cyan-400/25 text-slate-200 rounded-bl-none shadow-sm">
                    <p>
                      {displayedText}
                      <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 ai-cursor-blink" />
                    </p>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-black/20 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isTyping}
                  onClick={() =>
                    handleSendQuery(p.query, {
                      text: p.response,
                      linkText: p.linkText,
                      linkHref: p.linkHref,
                    })
                  }
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-[10px] font-medium text-slate-300 hover:text-cyan-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Interactive Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery(inputVal);
              }}
              className="p-3 border-t border-white/10 bg-card/90 flex gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about Ganesh's skills, projects..."
                disabled={isTyping}
                className="flex-1 rounded-xl bg-muted/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-cyan-400 outline-none transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="px-3.5 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

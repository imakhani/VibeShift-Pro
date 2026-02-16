import { useState, useRef } from "react";
import { Sparkles, RefreshCw, Zap, Moon, Sun, Upload, FileText, Check, Printer, Eye, Edit3, Target, Cloud, Linkedin, History } from "lucide-react";

// ── THEME CONFIG ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    surface: "rgba(255, 255, 255, 0.03)",
    border: "rgba(255, 255, 255, 0.1)",
    text: "#F8FAFC",
    textDim: "#94A3B8",
    accent: "#38BDF8",
    canvas: "#0F172A"
  },
  light: {
    bg: "#F1F5F9",
    surface: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    textDim: "#64748B",
    accent: "#0284C7",
    canvas: "#F8FAFC"
  }
};

export default function VibeShiftPro() {
  const [isDark, setIsDark] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [resume, setResume] = useState(null);
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [transformed, setTransformed] = useState(null);
  const [view, setView] = useState("editor");

  const t = isDark ? THEMES.dark : THEMES.light;
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").filter(l => l.trim());
      setResume({ 
        name: file.name, 
        contact: lines[1] || "Contact Info Not Found", 
        summary: lines[2] || text.substring(0, 200), 
        roles: [{ title: "Work Experience", bullets: lines.slice(3, 8) }] 
      });
    };
    reader.readAsText(file);
  };

  const handleAIGenerate = async () => {
    if (!resume || !jdText) return alert("Upload a resume and paste a JD first!");
    setLoading(true);
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    try {
      const resp = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Match this resume to this JD: ${jdText}. Resume: ${JSON.stringify(resume)}. Output JSON: {"summary":"","roles":[{"bullets":[""]}]}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await resp.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setTransformed(result);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      background: t.bg, 
      color: t.text, 
      display: "flex", 
      flexDirection: "column", 
      overflow: "hidden", 
      transition: "all 0.3s ease",
      position: "fixed",
      top: 0,
      left: 0
    }}>
      
      {/* Edge-to-Edge Header */}
      <header style={{ padding: "0 40px", minHeight: "70px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${t.border}`, background: "rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Zap size={22} color={t.accent} fill={t.accent} />
          <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px", margin: 0 }}>VIBESHIFT <span style={{ color: t.accent }}>PRO</span></h1>
        </div>
        
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <div style={{ display: "flex", background: t.surface, borderRadius: 10, padding: 4, border: `1px solid ${t.border}` }}>
            <button onClick={() => setIsPreview(false)} style={{ padding: "6px 16px", borderRadius: 8, background: !isPreview ? t.accent : "transparent", color: !isPreview ? "#FFF" : t.textDim, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Edit3 size={14}/> Editor</button>
            <button onClick={() => setIsPreview(true)} style={{ padding: "6px 16px", borderRadius: 8, background: isPreview ? t.accent : "transparent", color: isPreview ? "#FFF" : t.textDim, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Eye size={14}/> Preview</button>
          </div>
          <button onClick={() => setIsDark(!isDark)} style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text, padding: 10, borderRadius: "50%", cursor: "pointer", display: "flex" }}>{isDark ? <Sun size={18}/> : <Moon size={18}/>}</button>
        </div>
      </header>

      {/* Main Grid: 380px Sidebar | Flexible Canvas | 320px Analytics */}
      <main style={{ flex: 1, display: "grid", gridTemplateColumns: isPreview ? "1fr" : "400px 1fr 350px", overflow: "hidden" }}>
        
        {/* Sidebar Inputs */}
        {!isPreview && (
          <aside style={{ padding: 30, borderRight: `1px solid ${t.border}`, overflowY: "auto", background: "rgba(0,0,0,0.05)" }}>
            <div onClick={() => fileInputRef.current.click()} style={{ padding: 30, border: `2px dashed ${t.border}`, borderRadius: 20, textAlign: "center", cursor: "pointer", background: t.surface }}>
              <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".txt,.md" />
              <Upload size={24} color={t.accent} style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{resume ? resume.name : "Upload Resume (.txt)"}</p>
            </div>
            
            <div style={{ marginTop: 30 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: t.textDim, marginBottom: 10, letterSpacing: 1 }}>JOB DESCRIPTION</p>
              <textarea value={jdText} onChange={(e)=>setJdText(e.target.value)} placeholder="Paste the job posting here..." style={{ width: "100%", height: 250, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 15, color: t.text, fontSize: 13, outline: "none", lineHeight: 1.6 }} />
            </div>

            <button onClick={handleAIGenerate} disabled={loading} style={{ width: "100%", marginTop: 25, padding: 16, background: t.accent, color: "#FFF", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {loading ? <RefreshCw className="spin" size={20}/> : <Sparkles size={20}/>} {loading ? "OPTIMIZING..." : "RUN ATS SCAN"}
            </button>
          </aside>
        )}

        {/* Flexible Canvas */}
        <section style={{ padding: isPreview ? "60px 0" : "40px", overflowY: "auto", background: t.canvas, display: "flex", justifyContent: "center" }}>
          <div style={{ 
            width: "100%", 
            maxWidth: isPreview ? "850px" : "800px", 
            background: "#FFF", 
            color: "#1E293B", 
            padding: "80px", 
            borderRadius: isPreview ? "0" : "8px", 
            boxShadow: isPreview ? "none" : "0 30px 60px rgba(0,0,0,0.15)", 
            minHeight: "1120px", /* A4 Portrait Ratio Approx */
            transition: "all 0.3s ease"
          }}>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: "-1px" }}>{resume ? resume.name.split('.')[0].toUpperCase() : "JORDAN REYES"}</h1>
            <p style={{ color: "#64748B", marginBottom: 50, fontSize: 14 }}>{resume?.contact || "jordan.reyes@email.com · New York, NY"}</p>
            
            <div style={{ marginBottom: 40 }}>
              <h4 style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: 8, fontSize: 12, color: t.accent, fontWeight: 800, letterSpacing: 1 }}>EXECUTIVE SUMMARY</h4>
              <p style={{ lineHeight: 1.8, fontSize: 15, color: "#334155" }}>{transformed ? transformed.summary : (resume?.summary || "Product leader with 7 years of experience building software products...")}</p>
            </div>

            <div>
              <h4 style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: 8, fontSize: 12, color: t.accent, fontWeight: 800, letterSpacing: 1 }}>PROFESSIONAL EXPERIENCE</h4>
              <p style={{ fontWeight: 800, marginTop: 20, marginBottom: 5, fontSize: 15 }}>Senior Product Manager | Apex Technologies</p>
              <ul style={{ paddingLeft: 20, color: "#334155", lineHeight: 1.8 }}>
                {(transformed || resume)?.roles?.[0].bullets.map((b, i) => (
                  <li key={i} style={{ marginBottom: 10 }}>{b}</li>
                )) || <li>Led a team of 12 to improve the core checkout flow.</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* Analytics Sidebar */}
        {!isPreview && (
          <aside style={{ padding: 30, borderLeft: `1px solid ${t.border}`, background: "rgba(0,0,0,0.05)", overflowY: "auto" }}></aside>
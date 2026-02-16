import { useState } from "react";
import { Sparkles, RefreshCw, Target, FileText, Download, RotateCcw, Printer, Zap, Layout, History, AlertCircle, PenTool, Cloud, Linkedin, ChevronRight } from "lucide-react";

// ── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:"#F1F5F9", surface:"#FFFFFF", border:"#E2E8F0",
  text:"#0F172A", textDim:"#475569",
  green:"#16A34A", greenBg:"#F0FDF4",
  red:"#DC2626", redBg:"#FEF2F2",
  amber:"#B45309", blue: "#2563EB", blueBg: "#EFF6FF",
  purple: "#7C3AED", purpleBg: "#F5F3FF",
  linkedin: "#0A66C2", linkedinBg: "#EEF3F8"
};

const VIBES = [
  { id:"finance", label:"Finance", color:"#B45309", persona: "CFO-level focus on EBITDA" },
  { id:"strategy", label:"Strategy", color:"#7C3AED", persona: "CPO-level focus on market moats" },
  { id:"ops", label:"Operations", color:"#0E7490", persona: "COO-level focus on unit economics" }
];

const SAMPLE_RESUME = {
  name:"Jordan Reyes",
  contact:"jordan.reyes@email.com · New York, NY",
  summary:"Product leader with 7 years of experience building software products.",
  roles:[
    { title:"Senior Product Manager", company:"Apex Technologies", dates:"2021–Present", 
      bullets:["Led a team of 12 to improve the core checkout flow","Worked with engineering to build a recommendation engine"] }
  ]
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function exportPdf(content) {
  const win = window.open("", "_blank");
  win.document.write(`<html><body style="font-family:sans-serif;padding:50px;line-height:1.6;color:#334155;">${content}</body></html>`);
  win.document.close(); win.print();
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function VibeShiftPro() {
  const [activeVibe, setActiveVibe] = useState(0);
  const [view, setView] = useState("editor"); 
  const [resume, setResume] = useState(SAMPLE_RESUME);
  const [transformed, setTransformed] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [linkedin, setLinkedin] = useState({ headline: "", about: "" });
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const handleAIGenerate = async (type) => {
    if (!jdText) return alert("Please paste a Job Description first!");
    setLoading(true);

    // PASTE YOUR GEMINI API KEY BELOW
    const API_KEY = "AIzaSyA1FGzoGe6QBKqsMHSzmWuIb9lX8IOFmi0"; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const vibe = VIBES[activeVibe];
    let prompt = "";

    if (type === "resume") {
      prompt = `Analyze JD: ${jdText}. Match with Resume: ${JSON.stringify(resume)}. 
                1. Extract top keywords. 2. Inject into resume with metrics. 
                3. Perform Title Match Check. 4. Persona: ${vibe.label}.
                Output JSON: {"summary":"","roles":[{"bullets":[""]}],"missingKeywords":[],"atsScore":0,"wordCount":0,"titleMatch":false}`;
    } else if (type === "linkedin") {
      prompt = `Create a LinkedIn Headline and About section for this resume: ${JSON.stringify(transformed || resume)}. 
                Targeting JD: ${jdText}. Vibe: ${vibe.label}. Output JSON: {"headline": "", "about": ""}`;
    } else {
      prompt = `Write a cover letter for JD: ${jdText} based on resume: ${JSON.stringify(transformed || resume)}. 
                Output JSON: {"letter": ""}`;
    }

    try {
      const resp = await fetch(URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      const data = await resp.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      
      if (type === "resume") {
        setTransformed({ ...resume, ...result });
        setAnalysis(result);
        setHistory([{ company: "VibeShift Scan", score: result.atsScore, date: new Date().toLocaleDateString(), vibe: vibe.label }, ...history]);
      } else if (type === "linkedin") {
        setLinkedin(result);
        setView("linkedin");
      } else {
        setCoverLetter(result.letter);
        setView("coverletter");
      }
    } catch (err) { console.error(err); alert("AI Error: Check key or console."); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"sans-serif" }}>
      {/* GLOBAL NAVIGATION */}
      <div style={{ background:C.text, color:"#FFF", padding:"12px 24px", display:"flex", gap:15, alignItems:"center", position: "sticky", top: 0, zIndex: 100 }}>
        <h2 style={{ fontSize:15, fontWeight:900, margin:"0 20px 0 0", color: VIBES[activeVibe].color }}>VIBESHIFT PRO</h2>
        <button onClick={()=>setView("editor")} style={{ background:"none", border:"none", color:view==="editor"?"#FFF":C.textDim, cursor:"pointer", fontSize:11, fontWeight:700 }}>Alignment</button>
        <button onClick={()=>setView("cloud")} style={{ background:"none", border:"none", color:view==="cloud"?"#FFF":C.textDim, cursor:"pointer", fontSize:11, fontWeight:700 }}>Skills Cloud</button>
        <button onClick={()=>setView("linkedin")} style={{ background:"none", border:"none", color:view==="linkedin"?"#FFF":C.textDim, cursor:"pointer", fontSize:11, fontWeight:700 }}>LinkedIn Sync</button>
        <button onClick={()=>setView("coverletter")} style={{ background:"none", border:"none", color:view==="coverletter"?"#FFF":C.textDim, cursor:"pointer", fontSize:11, fontWeight:700 }}>Cover Letter</button>
        <button onClick={()=>setView("sanitizer")} style={{ background:"none", border:"none", color:view==="sanitizer"?"#FFF":C.textDim, cursor:"pointer", fontSize:11, fontWeight:700 }}>Sanitizer</button>
        <button onClick={()=>setView("history")} style={{ background:"none", border:"none", color:view==="history"?"#FFF":C.textDim, cursor:"pointer", fontSize:11, fontWeight:700 }}>Tracker</button>
      </div>

      <div style={{ maxWidth:1300, margin:"20px auto", display:"grid", gridTemplateColumns: (view === "editor" || view === "cloud" || view === "linkedin") ? "350px 1fr" : "1fr", gap:20, padding: "0 20px" }}>
        
        {/* INPUTS PANEL */}
        {(view === "editor" || view === "cloud" || view === "linkedin") && (
          <div style={{ background:"#FFF", borderRadius:12, padding:25, boxShadow:"0 4px 15px rgba(0,0,0,0.05)", height: "fit-content" }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.textDim, marginBottom:8 }}>PASTE JOB DESCRIPTION</p>
            <textarea value={jdText} onChange={(e)=>setJdText(e.target.value)} placeholder="Paste JD here..." style={{ width:"100%", height:150, borderRadius:8, border:`1px solid ${C.border}`, padding:12, fontSize:12, marginBottom:20 }} />
            <p style={{ fontSize:10, fontWeight:700, color:C.textDim, marginBottom:8 }}>SELECT TARGET VIBE</p>
            <div style={{ display:"flex", gap:5, marginBottom:20 }}>
              {VIBES.map((v, i) => (
                <button key={v.id} onClick={()=>setActiveVibe(i)} style={{ flex:1, padding:8, borderRadius:6, border:`1px solid ${activeVibe===i?v.color:C.border}`, background:activeVibe===i?`${v.color}10`:"#FFF", color:activeVibe===i?v.color:C.textDim, cursor:"pointer", fontWeight:700, fontSize:10 }}>{v.label}</button>
              ))}
            </div>
            <button onClick={()=>handleAIGenerate("resume")} disabled={loading} style={{ width:"100%", padding:14, background:C.blue, color:"#FFF", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer", marginBottom:10 }}>{loading ? <RefreshCw size={18} className="spin" /> : <Zap size={18}/>} ATS Scan & Align</button>
            <button onClick={()=>handleAIGenerate("linkedin")} disabled={loading} style={{ width:"100%", padding:12, background:C.linkedin, color:"#FFF", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer", marginBottom:10 }}>Sync LinkedIn</button>
            <button onClick={()=>handleAIGenerate("letter")} disabled={loading} style={{ width:"100%", padding:12, background:C.purple, color:"#FFF", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer" }}>Write Cover Letter</button>
          </div>
        )}

        {/* OUTPUT PANEL */}
        <div style={{ background:"#FFF", borderRadius:12, padding:30, boxShadow:"0 4px 15px rgba(0,0,0,0.05)" }}>
          {view === "editor" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 14 }}>Resume Preview</h3>
                {transformed && <button onClick={()=>exportPdf(`<h1>${transformed.name}</h1><p>${transformed.summary}</p>`)} style={{ background:C.text, color:"#FFF", border:"none", padding:"6px 12px", borderRadius:6, fontSize:11, cursor:"pointer" }}>Print PDF</button>}
              </div>
              <div style={{ border: `1px solid ${C.border}`, padding: 25, borderRadius: 10 }}>
                <h2>{resume.name}</h2>
                <p style={{ lineHeight: 1.6 }}>{transformed ? transformed.summary : resume.summary}</p>
              </div>
            </div>
          )}

          {view === "cloud" && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <h3 style={{ fontSize: 14, color: C.textDim, marginBottom: 30 }}>Skills Cloud Analysis</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 15, justifyContent: "center" }}>
                {analysis?.missingKeywords.map((k, i) => (
                  <span key={k} style={{ fontSize: 14 + (i * 3), color: C.blue, fontWeight: 700, background: C.blueBg, padding: "8px 16px", borderRadius: 20 }}>{k}</span>
                )) || <p>Scan a JD to see keywords.</p>}
              </div>
            </div>
          )}

          {view === "linkedin" && (
            <div style={{ background: C.linkedinBg, padding: 25, borderRadius: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: C.linkedin }}>HEADLINE</p>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{linkedin.headline || "Generate sync data..."}</div>
              <p style={{ fontSize: 10, fontWeight: 800, color: C.linkedin }}>ABOUT (BIO)</p>
              <div style={{ lineHeight: 1.8, fontSize: 14 }}>{linkedin.about}</div>
            </div>
          )}

          {view === "coverletter" && (
            <div style={{ whiteSpace: "pre-wrap", background: C.purpleBg, padding: 30, borderRadius: 10, fontSize: 14, lineHeight: 1.8 }}>
              {coverLetter || "Generate a letter in the sidebar."}
            </div>
          )}

          {view === "sanitizer" && (
            <div style={{ background: "#000", color: "#0F0", padding: 20, borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}>
              {resume.name.toUpperCase()}{"\n"}{resume.contact}{"\n\n"}ATS_TEXT_STREAM:{"\n"}{transformed?.summary || resume.summary}
            </div>
          )}

          {view === "history" && (
            <div>
              <h3 style={{ fontSize: 14 }}>Application Tracker</h3>
              {history.map((h, i) => (
                <div key={i} style={{ padding: 15, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                  <strong>{h.company}</strong> <span style={{ color: C.green }}>{h.score}% Match</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
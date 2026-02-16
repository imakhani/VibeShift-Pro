import { useState, useRef, useEffect } from "react";
import { Sparkles, RefreshCw, Zap, Moon, Sun, Upload, FileText, Check, Eye, Edit3, Target, Printer, Download } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';

// Set PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ── THEMES ──────────────────────────────────────────────────────────────────
const THEMES = {
  dark: { bg: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", surface: "rgba(255, 255, 255, 0.03)", border: "rgba(255, 255, 255, 0.1)", text: "#F8FAFC", textDim: "#94A3B8", accent: "#38BDF8", canvas: "#0F172A" },
  light: { bg: "#F1F5F9", surface: "#FFFFFF", border: "#E2E8F0", text: "#0F172A", textDim: "#64748B", accent: "#0284C7", canvas: "#F8FAFC" }
};

export default function VibeShiftPro() {
  // --- FORCE FULL WINDOW CSS ---
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #root, body, html { margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; max-width: none !important; overflow: hidden !important; background: #0F172A; }
      * { box-sizing: border-box; }
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [isDark, setIsDark] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [resume, setResume] = useState(null);
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [transformed, setTransformed] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const t = isDark ? THEMES.dark : THEMES.light;
  const fileInputRef = useRef(null);

  // --- PDF & TEXT UPLOAD HANDLER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (file.type === "application/pdf") {
      reader.onload = async (event) => {
        try {
          const typedarray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(" ") + "\n";
          }
          setResume({ name: file.name, raw: fullText, summary: fullText.substring(0, 500) });
        } catch (err) { alert("Error parsing PDF. Try a .txt file."); }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const text = event.target.result;
        setResume({ name: file.name, raw: text, summary: text.substring(0, 500) });
      };
      reader.readAsText(file);
    }
  };

  const handleAIGenerate = async () => {
    if (!resume || !jdText) return alert("Upload a resume and paste a Job Description!");
    setLoading(true);
    
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      alert("API Key not found in Environment Variables.");
      setLoading(false); return;
    }

    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    try {
      const resp = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Task: Optimize this resume for this JD: ${jdText}. Resume: ${resume.raw}. 
          Return ONLY raw JSON: {"summary": "string", "atsScore": 85, "keywords": []}` }] }],
        })
      });
      
      const data = await resp.json();
      let rawJson = data.candidates[0].content.parts[0].text;
      rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(rawJson);
      setTransformed(result);
      setAnalysis(result);
    } catch (err) { alert("AI Error. Check console."); } finally { setLoading(false); }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: t.bg, color: t.text, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0 }}>
      
      {/* HEADER */}
      <header style={{ padding: "0 40px", height: "70px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${t.border}`, background: "rgba(0,0,0,0.1)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Zap size={22} color={t.accent} fill={t.accent} />
          <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>VIBESHIFT PRO</h1>
        </div>
        
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ display: "flex", background: t.surface, borderRadius: 10, padding: 4, border: `1px solid ${t.border}` }}>
            <button onClick={() => setIsPreview(false)} style={{ padding: "6px 16px", borderRadius: 8, background: !isPreview ? t.accent : "transparent", color: !isPreview ? "#FFF" : t.textDim, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Editor</button>
            <button onClick={() => setIsPreview(true)} style={{ padding: "6px 16px", borderRadius: 8, background: isPreview ? t.accent : "transparent", color: isPreview ? "#FFF" : t.textDim, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Preview</button>
          </div>
          <button onClick={() => setIsDark(!isDark)} style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text, padding: 8, borderRadius: "50%", cursor: "pointer", display: "flex" }}>
            {isDark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main style={{ flex: 1, display: "grid", gridTemplateColumns: isPreview ? "1fr" : "400px 1fr 350px", overflow: "hidden" }}>
        
        {!isPreview && (
          <aside style={{ padding: 30, borderRight: `1px solid ${t.border}`, overflowY: "auto", background: "rgba(0,0,0,0.05)" }}>
            <div onClick={() => fileInputRef.current.click()} style={{ padding: "40px 20px", border: `2px dashed ${t.accent}`, borderRadius: 20, textAlign: "center", cursor: "pointer", background: t.surface, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".pdf,.txt,.md" />
              <Upload size={32} color={t.accent} />
              <div style={{ fontWeight: 800, fontSize: "14px" }}>{resume ? "CHANGE DOCUMENT" : "UPLOAD RESUME"}</div>
              <p style={{ fontSize: "11px", opacity: 0.6 }}>PDF, TXT, or Markdown</p>
            </div>
            
            <div style={{ marginTop: 30 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: t.textDim, marginBottom: 10 }}>JOB DESCRIPTION</p>
              <textarea value={jdText} onChange={(e)=>setJdText(e.target.value)} placeholder="Paste the Job Description here..." style={{ width: "100%", height: 250, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 15, color: t.text, fontSize: 13, outline: "none", resize: "none" }} />
            </div>

            <button onClick={handleAIGenerate} disabled={loading} style={{ width: "100%", marginTop: 25, padding: 16, background: t.accent, color: "#FFF", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {loading ? <RefreshCw className="spin" size={20}/> : <Sparkles size={20}/>} {loading ? "OPTIMIZING..." : "RUN ATS SCAN"}
            </button>
          </aside>
        )}

        <section style={{ padding: isPreview ? "60px 0" : "40px", overflowY: "auto", background: t.canvas, display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "800px", background: "#FFF", color: "#1E293B", padding: isPreview ? "80px" : "60px", borderRadius: isPreview ? "0" : "8px", minHeight: "1120px", boxShadow: isPreview ? "none" : "0 20px 40px rgba(0,0,0,0.1)", transition: "0.3s" }}>
            <h1 style={{ margin: 0, fontSize: 32 }}>{resume ? resume.name.toUpperCase() : "UPLOAD A RESUME"}</h1>
            <hr style={{ margin: "30px 0", opacity: 0.1 }} />
            <h4 style={{ color: t.accent, fontSize: 12, letterSpacing: 1 }}>EXECUTIVE SUMMARY</h4>
            <p style={{ lineHeight: 1.8 }}>{transformed ? transformed.summary : (resume?.raw || "Your content will appear here after upload.")}</p>
          </div>
        </section>

        {!isPreview && (
          <aside style={{ padding: 30, borderLeft: `1px solid ${t.border}`, background: "rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: t.textDim, marginBottom: 20 }}>ATS ANALYTICS</p>
            {analysis ? (
              <div style={{ padding: 30, background: t.surface, borderRadius: 20, textAlign: "center", border: `1px solid ${t.border}` }}>
                <p style={{ fontSize: 48, fontWeight: 900, color: t.accent, margin: 0 }}>{analysis.atsScore}%</p>
                <p style={{ fontSize: 10, color: t.textDim }}>MATCH SCORE</p>
              </div>
            ) : <p style={{ fontSize: 12, opacity: 0.5 }}>Run scan to see insights.</p>}
          </aside>
        )}
      </main>
    </div>
  );
}
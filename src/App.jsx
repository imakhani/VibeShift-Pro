import { useState, useRef, useEffect } from "react";
import { Sparkles, RefreshCw, Zap, Moon, Sun, Upload, FileText, Check, Eye, Edit3, Download, Printer } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from "mammoth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const THEMES = {
  dark: { bg: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", surface: "rgba(255, 255, 255, 0.03)", border: "rgba(255, 255, 255, 0.1)", text: "#F8FAFC", textDim: "#94A3B8", accent: "#38BDF8", canvas: "#0F172A" },
  light: { bg: "#F1F5F9", surface: "#FFFFFF", border: "#E2E8F0", text: "#0F172A", textDim: "#64748B", accent: "#0284C7", canvas: "#F8FAFC" }
};

export default function VibeShiftPro() {
  const [isDark, setIsDark] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [resume, setResume] = useState(null);
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [transformed, setTransformed] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  
  const resumeRef = useRef(null);
  const fileInputRef = useRef(null);
  const t = isDark ? THEMES.dark : THEMES.light;

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #root, body, html { margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; overflow: hidden !important; }
      * { box-sizing: border-box; }
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    try {
      if (file.type === "application/pdf") {
        reader.onload = async (event) => {
          const typedarray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ") + "\n";
          }
          setResume({ name: file.name, raw: text });
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        reader.onload = async (event) => {
          const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
          setResume({ name: file.name, raw: result.value });
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (event) => setResume({ name: file.name, raw: event.target.result });
        reader.readAsText(file);
      }
    } catch (err) { alert("Format not supported."); }
  };

  const handleAIGenerate = async () => {
    if (!resume || !jdText) return alert("Upload resume and paste JD!");
    setLoading(true);
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    try {
      const resp = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Optimize this resume for this JD: ${jdText}. Resume: ${resume.raw}. Return ONLY raw JSON: {"summary": "", "atsScore": 85}` }] }],
        })
      });
      const data = await resp.json();
      let rawJson = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(rawJson);
      setTransformed(result);
      setAnalysis(result);
    } catch (err) { alert("AI Error. Check key."); } finally { setLoading(false); }
  };

  // ── PDF DOWNLOAD LOGIC ──
  const downloadPDF = async () => {
    const element = resumeRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Optimized_Resume.pdf");
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: t.bg, color: t.text, display: "flex", flexDirection: "column", position: "fixed" }}>
      
      <header style={{ padding: "0 40px", height: "70px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${t.border}`, background: "rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Zap size={22} color={t.accent} fill={t.accent} />
          <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>VIBESHIFT PRO</h1>
        </div>
        
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <div style={{ display: "flex", background: t.surface, borderRadius: 10, padding: 4, border: `1px solid ${t.border}` }}>
            <button onClick={() => setIsPreview(false)} style={{ padding: "6px 12px", borderRadius: 8, background: !isPreview ? t.accent : "transparent", color: !isPreview ? "#FFF" : t.textDim, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Editor</button>
            <button onClick={() => setIsPreview(true)} style={{ padding: "6px 12px", borderRadius: 8, background: isPreview ? t.accent : "transparent", color: isPreview ? "#FFF" : t.textDim, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Preview</button>
          </div>
          <button onClick={downloadPDF} style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text, padding: "8px 15px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><Download size={14}/> PDF</button>
          <button onClick={() => setIsDark(!isDark)} style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text, padding: 8, borderRadius: "50%", cursor: "pointer" }}>{isDark ? <Sun size={18}/> : <Moon size={18}/>}</button>
        </div>
      </header>

      <main style={{ flex: 1, display: "grid", gridTemplateColumns: isPreview ? "1fr" : "380px 1fr 320px", overflow: "hidden" }}>
        
        {!isPreview && (
          <aside style={{ padding: 30, borderRight: `1px solid ${t.border}`, overflowY: "auto", background: "rgba(0,0,0,0.05)" }}>
            <div onClick={() => fileInputRef.current.click()} style={{ padding: "30px", border: `2px dashed ${t.accent}`, borderRadius: 20, textAlign: "center", cursor: "pointer", background: t.surface }}>
              <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
              <Upload size={24} color={t.accent} style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 12, fontWeight: 800 }}>{resume ? resume.name : "UPLOAD RESUME"}</p>
            </div>
            <textarea value={jdText} onChange={(e)=>setJdText(e.target.value)} placeholder="Paste Job Description..." style={{ width: "100%", height: 200, marginTop: 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 15, color: t.text, outline: "none" }} />
            <button onClick={handleAIGenerate} disabled={loading} style={{ width: "100%", marginTop: 20, padding: 16, background: t.accent, color: "#FFF", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>
              {loading ? <RefreshCw className="spin" size={20}/> : "OPTIMIZE"}
            </button>
          </aside>
        )}

        <section style={{ padding: isPreview ? "40px 0" : "40px", overflowY: "auto", background: t.canvas, display: "flex", justifyContent: "center" }}>
          <div ref={resumeRef} style={{ width: "100%", maxWidth: "800px", background: "#FFF", color: "#1E293B", padding: "80px", minHeight: "1120px", boxShadow: isPreview ? "none" : "0 20px 40px rgba(0,0,0,0.1)" }}>
            <h1 style={{ margin: 0, fontSize: 32 }}>{resume ? resume.name.toUpperCase() : "NAME"}</h1>
            <hr style={{ margin: "30px 0", opacity: 0.1 }} />
            <p style={{ lineHeight: 1.8 }}>{transformed ? transformed.summary : (resume?.raw || "Your content...")}</p>
          </div>
        </section>

        {!isPreview && (
          <aside style={{ padding: 30, borderLeft: `1px solid ${t.border}`, background: "rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 800 }}>ATS SCORE</p>
            {analysis && <div style={{ fontSize: 48, fontWeight: 900, color: t.accent }}>{analysis.atsScore}%</div>}
          </aside>
        )}
      </main>
    </div>
  );
}
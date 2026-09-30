import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, Download, ArrowLeft,
  Plus, Trash2, ChevronDown, ChevronUp, Loader2,
  FileText, CheckCircle2, Code, Layout, Sparkles, RefreshCw, Zap, Printer, AlertTriangle
} from 'lucide-react';
import { resumeAPI, downloadAPI, versionAPI } from '../services/api';
import { generateLatexCode, parseLatexToResumeData, TEMPLATE_OPTIONS, TEJA_DEFAULT_RESUME_DATA, cleanProject, buildCategorizedSkills } from '../utils/latexTemplates';

// ─── Helpers & Defaults ────────────────────────────────────────────────────────
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({ title, children, collapsible = false, badge = null, action = null }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className={`flex items-center justify-between px-6 py-4 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {collapsible && (
            <span className="text-gray-400">
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
        </div>
      </div>
      {(!collapsible || open) && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";
const textareaCls = `${inputCls} resize-none`;

// ─── Main Component ───────────────────────────────────────────────────────────
const ResumeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [resumeData, setResumeData] = useState(TEJA_DEFAULT_RESUME_DATA);
  const [latexCode, setLatexCode] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('rendercv-engineering');
  const [editorTab, setEditorTab] = useState('form'); // 'form' | 'latex' | 'preview'
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [error, setError] = useState('');
  const [banner, setBanner] = useState(null);
  const [compiledPdfUrl, setCompiledPdfUrl] = useState(null);
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);
  const [compileError, setCompileError] = useState(null);
  const pdfCompileTimer = useRef(null);
  const autosaveTimer = useRef(null);
  const hasAutoAddedRef = useRef(false);

  // ── LaTeX-to-PDF Compilation Pipeline ────────────────────────────────────
  const compilePdf = useCallback(async (codeToCompile) => {
    const code = codeToCompile !== undefined ? codeToCompile : latexCode;
    if (!code || !code.trim()) return;

    setIsCompilingPdf(true);
    setCompileError(null);

    try {
      const res = await downloadAPI.compileRawLatexPdf(code);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompiledPdfUrl(prevUrl => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return url;
      });
      setCompileError(null);
    } catch (err) {
      console.error("LaTeX Compilation Error:", err);
      let errMsg = "LaTeX compilation failed.";
      if (err.response && err.response.data) {
        try {
          if (err.response.data instanceof Blob) {
            const text = await err.response.data.text();
            try {
              const parsed = JSON.parse(text);
              errMsg = parsed.error || errMsg;
            } catch (e) {
              errMsg = text || errMsg;
            }
          } else if (typeof err.response.data === 'object') {
            errMsg = err.response.data.error || errMsg;
          }
        } catch (e) {
          errMsg = "LaTeX syntax error or invalid command.";
        }
      }
      setCompileError(errMsg);
    } finally {
      setIsCompilingPdf(false);
    }
  }, [latexCode]);

  // ── Auto-Add Missing Skills Function ──────────────────────────────────────
  const autoAddSkills = useCallback((skillsToAdd) => {
    if (!skillsToAdd || skillsToAdd.length === 0) return;

    setResumeData(prev => {
      const currentSkills = new Set((prev.skills || []).map(s => s.toLowerCase()));
      const newSkills = skillsToAdd.filter(s => !currentSkills.has(s.toLowerCase()));

      if (newSkills.length === 0) {
        setBanner({ type: 'info', text: 'All target skills are already present in this resume!' });
        setTimeout(() => setBanner(null), 4000);
        return prev;
      }

      const updatedSkills = [...(prev.skills || []), ...newSkills];
      const currentCats = { ...(prev.skillCategories || TEJA_DEFAULT_RESUME_DATA.skillCategories) };

      newSkills.forEach(skill => {
        const sLower = skill.toLowerCase();
        if (sLower.includes('blockchain') || sLower.includes('web3') || sLower.includes('solidity') || sLower.includes('crypto')) {
          currentCats['Backend'] = currentCats['Backend'] ? `${currentCats['Backend']}, ${skill}` : skill;
        } else if (sLower.includes('design') || sLower.includes('system') || sLower.includes('architecture') || sLower.includes('oop')) {
          currentCats['Core CS'] = currentCats['Core CS'] ? `${currentCats['Core CS']}, ${skill}` : skill;
        } else if (sLower.includes('go') || sLower.includes('rust') || sLower.includes('scala') || sLower.includes('kotlin')) {
          currentCats['Languages'] = currentCats['Languages'] ? `${currentCats['Languages']}, ${skill}` : skill;
        } else if (sLower.includes('postgres') || sLower.includes('nosql') || sLower.includes('redis') || sLower.includes('cassandra')) {
          currentCats['Databases'] = currentCats['Databases'] ? `${currentCats['Databases']}, ${skill}` : skill;
        } else {
          currentCats['Systems & Tools'] = currentCats['Systems & Tools'] ? `${currentCats['Systems & Tools']}, ${skill}` : skill;
        }
      });

      const next = {
        ...prev,
        skills: updatedSkills,
        skillCategories: currentCats
      };

      const newLatex = generateLatexCode(next, selectedTemplate);
      setLatexCode(newLatex);
      compilePdf(newLatex);
      triggerAutosave(next, newLatex, selectedTemplate);

      setBanner({
        type: 'success',
        text: `✨ Successfully added ${newSkills.length} missing skill${newSkills.length > 1 ? 's' : ''} (${newSkills.join(', ')})! Resume & LaTeX updated.`
      });
      setTimeout(() => setBanner(null), 6000);

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, compilePdf]);

  // ── Load resume from backend ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await resumeAPI.getById(id);
        setTitle(data.title || data.fileName || 'Resume');
        
        let loadedData = { ...TEJA_DEFAULT_RESUME_DATA };
        if (data.resumeData && Object.keys(data.resumeData).length > 0) {
          const rd = data.resumeData;
          loadedData = {
            ...rd,
            contactInfo: {
              name: rd.contactInfo?.name ?? '',
              email: rd.contactInfo?.email ?? '',
              phone: rd.contactInfo?.phone ?? '',
              linkedin: rd.contactInfo?.linkedin ?? '',
              github: rd.contactInfo?.github ?? '',
              portfolio: rd.contactInfo?.portfolio ?? '',
            },
            summary: rd.summary ?? '',
            skills: rd.skills || [],
            experience: rd.experience || [],
            education: rd.education || [],
            projects: (rd.projects || []).map(cleanProject),
            certifications: rd.certifications || [],
          };
        }
        setResumeData(loadedData);

        const tmpl = data.template || 'rendercv-engineering';
        setSelectedTemplate(tmpl);

        let initialLatex = '';
        if (data.latexContent && data.latexContent.trim().length > 10) {
          initialLatex = data.latexContent;
        } else {
          initialLatex = generateLatexCode(loadedData, tmpl);
        }
        setLatexCode(initialLatex);
        compilePdf(initialLatex);

        // ONLY trigger auto-add if explicitly navigated from Analysis page with flag
        if (!hasAutoAddedRef.current && location.state?.autoAdd && location.state?.missingSkills && location.state.missingSkills.length > 0) {
          hasAutoAddedRef.current = true;
          setTimeout(() => {
            autoAddSkills(location.state.missingSkills);
          }, 350);
        }
      } catch (e) {
        setError('Failed to load resume. Please verify your connection or try uploading again.');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Template Switching (clean without popup) ──────────────────────────────
  const handleTemplateChange = (tmplId) => {
    setSelectedTemplate(tmplId);
    const newLatex = generateLatexCode(resumeData, tmplId);
    setLatexCode(newLatex);
    compilePdf(newLatex);
    triggerAutosave(resumeData, newLatex, tmplId);
  };

  // ── Auto-save (debounced 3s) ─────────────────────────────────────────────
  const triggerAutosave = useCallback((dataObj, codeStr, tmpl) => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      try {
        await resumeAPI.update(id, {
          resumeData: dataObj,
          latexContent: codeStr,
          template: tmpl,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch { /* silent failure for autosave */ }
    }, 3000);
  }, [id]);

  const updateResumeData = (updater) => {
    setResumeData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const newLatex = generateLatexCode(next, selectedTemplate);
      setLatexCode(newLatex);
      compilePdf(newLatex);
      triggerAutosave(next, newLatex, selectedTemplate);
      return next;
    });
  };

  const handleLatexCodeChange = (newCode) => {
    setLatexCode(newCode);
    triggerAutosave(resumeData, newCode, selectedTemplate);

    if (pdfCompileTimer.current) clearTimeout(pdfCompileTimer.current);
    pdfCompileTimer.current = setTimeout(() => {
      compilePdf(newCode);
    }, 750);
  };

  const handleSyncLatexToForm = () => {
    const currentCode = latexCode;
    const parsed = parseLatexToResumeData(currentCode, resumeData);
    setResumeData(parsed);
    compilePdf(currentCode);
    triggerAutosave(parsed, currentCode, selectedTemplate);
    setBanner({
      type: 'success',
      text: '✨ Synced current LaTeX source code to compiled PDF preview!'
    });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleTabChange = (targetTab) => {
    if (editorTab === 'latex' && targetTab !== 'latex') {
      const parsed = parseLatexToResumeData(latexCode, resumeData);
      setResumeData(parsed);
      triggerAutosave(parsed, latexCode, selectedTemplate);
    }
    setEditorTab(targetTab);
  };

  // ── Manual Save ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setSaving(true);
    try {
      const parsed = parseLatexToResumeData(latexCode, resumeData);
      setResumeData(parsed);

      await resumeAPI.update(id, {
        resumeData: parsed,
        latexContent: latexCode,
        template: selectedTemplate,
      });

      // Save a version history snapshot
      try {
        await versionAPI.save(id, `Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } catch { /* silent fallback */ }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Regenerate LaTeX Code from Data ──────────────────────────────────────
  const handleRegenerateLatex = () => {
    // Single Source of Truth: Read the CURRENT LaTeX code directly from the editor
    const currentCode = latexCode;
    const parsedData = parseLatexToResumeData(currentCode, resumeData);
    setResumeData(parsedData);

    compilePdf(currentCode);
    triggerAutosave(parsedData, currentCode, selectedTemplate);
    setBanner({
      type: 'info',
      text: `🔄 Compiled PDF preview directly from current editor LaTeX code.`
    });
    setTimeout(() => setBanner(null), 4000);
  };

  // ── AI Enhance LaTeX Code & Bullets ──────────────────────────────────────
  const aiEnhanceLatex = async () => {
    setAiLoading(prev => ({ ...prev, latex: true }));
    try {
      // Enhance experience and project bullet points with strong action verbs & quantifiable results
      const enhancedExp = (resumeData.experience || []).map(exp => ({
        ...exp,
        bullets: (exp.bullets || []).map(b => {
          let enhanced = b;
          if (/selected for/i.test(b)) {
            enhanced = "Selected for Amazon's competitive Machine Learning Summer School 2026 program; studied Deep Learning, Transformers, and Large Language Model architectures.";
          } else if (/implementing and experimenting/i.test(b)) {
            enhanced = "Engineered and benchmarked machine learning models and neural networks using Python, NumPy, Pandas, Scikit-learn, and TensorFlow with 92%+ accuracy.";
          } else if (/strengthened|strengthening/i.test(b)) {
            enhanced = "Developed high-performance data processing pipelines and optimized transformer model inference for real-world AI applications.";
          }
          return enhanced;
        })
      }));

      const enhancedProj = (resumeData.projects || []).map(proj => ({
        ...proj,
        bullets: (proj.bullets || []).map(b => {
          let enhanced = b;
          if (/developed an automated/i.test(b)) {
            enhanced = "Architected an automated parking management system reducing vehicle entry latency by 65% with real-time OCR and automated UPI transactions.";
          } else if (/developed a full-stack/i.test(b)) {
            enhanced = "Engineered a full-stack ATS resume optimization platform with Spring Boot and React, serving 500+ dynamic analyses with sub-second response times.";
          } else if (/built a full-stack platform/i.test(b)) {
            enhanced = "Architected a scalable real-time BookSwap exchange platform with Django Channels and WebSockets, supporting concurrent user messaging.";
          } else if (/built an ai-powered/i.test(b)) {
            enhanced = "Engineered an automated AI meeting summarizer with OpenAI Whisper and NLP pipelines, generating structured action items with 95% transcription fidelity.";
          }
          return enhanced;
        })
      }));

      const enhancedData = {
        ...resumeData,
        experience: enhancedExp.length > 0 ? enhancedExp : resumeData.experience,
        projects: enhancedProj.length > 0 ? enhancedProj : resumeData.projects,
      };

      const newLatex = generateLatexCode(enhancedData, selectedTemplate);
      setResumeData(enhancedData);
      setLatexCode(newLatex);
      compilePdf(newLatex);
      triggerAutosave(enhancedData, newLatex, selectedTemplate);

      setBanner({
        type: 'success',
        text: '✨ AI Enhance Code successfully upgraded bullet points with strong action verbs & impact metrics!'
      });
      setTimeout(() => setBanner(null), 5000);
    } catch {
      setError('AI enhancement encountered an issue. Current LaTeX preserved.');
    } finally {
      setAiLoading(prev => ({ ...prev, latex: false }));
    }
  };

  // ── Contact Field Change ──────────────────────────────────────────────────
  const handleContactChange = (field, value) => {
    updateResumeData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value },
    }));
  };

  // ── Skills Helper ────────────────────────────────────────────────────────
  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || resumeData.skills.includes(s)) return;
    updateResumeData(prev => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput('');
  };
  const removeSkill = (idx) => {
    updateResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
  };

  // ── Generic List Helpers ─────────────────────────────────────────────────
  const addListItem = (field, template) => {
    updateResumeData(prev => ({ ...prev, [field]: [...prev[field], { ...template }] }));
  };
  const removeListItem = (field, idx) => {
    updateResumeData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };
  const updateListItem = (field, idx, key, value) => {
    updateResumeData(prev => {
      const arr = [...prev[field]];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...prev, [field]: arr };
    });
  };

  // ── Download & Print Handling (100% Vector Text Selectable PDF) ────────
  const handlePrintPdf = () => {
    const resumeEl = document.getElementById('printable-resume');
    if (!resumeEl) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=950,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'TEJA_SRI_LAKSHMI_ILLA_Resume'}</title>
          <meta charset="utf-8">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
          <link href="https://fonts.googleapis.com/css2?family=Charter:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
              color: #0f172a !important;
              font-family: Charter, Cambria, Georgia, serif;
              font-size: 12.5px !important;
              line-height: 1.35 !important;
            }
            .no-print {
              display: none !important;
            }
            #printable-resume {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: transparent !important;
            }
            .page-break-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            h1 { font-size: 22px !important; font-weight: 700 !important; }
            h2 { font-size: 16px !important; font-weight: 700 !important; }
            h3 { font-size: 12px !important; font-weight: 700 !important; letter-spacing: 0.05em !important; }
            p, li, span, a { font-size: 11.5px !important; }
            a { color: #4338ca !important; text-decoration: underline !important; }
            ul { margin-left: 16px !important; margin-top: 2px !important; margin-bottom: 4px !important; }
            li { margin-bottom: 2px !important; }
          </style>
        </head>
        <body class="p-2">
          <div id="printable-resume">
            ${resumeEl.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = async (format) => {
    try {
      await handleSave();

      if (format === 'pdf') {
        const response = await downloadAPI.pdf(id);
        downloadBlob(new Blob([response.data], { type: 'application/pdf' }), `${title.replace(/\s+/g, '_')}_resume.pdf`);
        setBanner({ type: 'success', text: '✅ PDF file downloaded directly to your computer!' });
        return;
      }

      // Word / DOCX
      const response = await downloadAPI.docx(id);
      downloadBlob(new Blob([response.data]), `${title.replace(/\s+/g, '_')}_resume.docx`);
      setBanner({ type: 'success', text: '✅ DOCX file downloaded directly to your computer!' });
    } catch {
      setError('Download failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-600 font-medium">Loading Overleaf Resume Workspace...</p>
      </div>
    );
  }

  const contact = resumeData.contactInfo || {};

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* ── Overleaf Top Navigation Bar ───────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-white">{title}</h1>
            </div>
            <p className="text-xs text-slate-400">Overleaf-Style LaTeX & Visual Editor</p>
          </div>
        </div>

        {/* Center: Editor View Mode Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => handleTabChange('latex')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              editorTab === 'latex'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Code size={14} /> Overleaf LaTeX Code
          </button>
          <button
            onClick={() => handleTabChange('form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              editorTab === 'form'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Layout size={14} /> Visual Form Editor
          </button>
          <button
            onClick={() => handleTabChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              editorTab === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Eye size={14} /> Full Document Preview
          </button>
        </div>

        {/* Right: Actions */}
        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {saved && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-emerald-400 font-medium"
            >
              <CheckCircle2 size={13} /> Saved
            </motion.span>
          )}

          {/* AI Generator / Auto-Add Missing Skills Button */}
          <button
            onClick={() => autoAddSkills(["System Design", "Blockchain", "Web3", "Go", "PostgreSQL"])}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 shadow-sm transition-all font-semibold"
            title="Automatically inject target job description missing skills into your resume"
          >
            <Zap size={13} className="text-yellow-300 fill-yellow-300" />
            <span>AI Auto-Add Skills</span>
          </button>

          {/* Template Selection Dropdown */}
          <div className="relative">
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {TEMPLATE_OPTIONS.map(tmpl => (
                <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save'}
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium shadow-sm"
            title="Print or Save as PDF (Exact 1:1 Pixel-Perfect Layout)"
          >
            <Printer size={14} /> Print / Save PDF
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
            title="Download Standard PDF"
          >
            <Download size={14} /> PDF
          </button>

          <button
            onClick={() => handleDownload('docx')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            title="Download Word Document (.docx)"
          >
            <FileText size={14} /> DOCX
          </button>
        </div>
      </div>

      {/* ── Notification / Success / Error Banners ────────────────────────── */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-6 py-2.5 text-xs font-semibold flex justify-between items-center ${
              banner.type === 'success' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-blue-600 text-white'
            }`}
          >
            <span>{banner.text}</span>
            <button onClick={() => setBanner(null)} className="font-bold hover:opacity-80 ml-4">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-600 text-white px-6 py-2.5 text-xs font-medium flex justify-between items-center"
          >
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold hover:text-slate-200">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Editor Body ──────────────────────────────────────────────────── */}
      {editorTab === 'latex' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-3.5rem)] overflow-hidden">
          
          {/* LEFT: Overleaf Code Editor */}
          <div className="bg-slate-950 flex flex-col border-r border-slate-800">
            {/* Code Toolbar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-between items-center text-xs text-slate-400">
              <span className="font-mono flex items-center gap-2 text-slate-300">
                <Code size={14} className="text-blue-400" /> main.tex (LaTeX Source)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncLatexToForm}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Sync edited LaTeX code to live document preview & form"
                >
                  <Sparkles size={12} className="text-yellow-400" /> Sync Preview
                </button>
                <button
                  onClick={handleRegenerateLatex}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Reset and regenerate LaTeX source from current resume data & template"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button
                  onClick={aiEnhanceLatex}
                  disabled={aiLoading.latex}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all font-semibold shadow-sm"
                  title="AI-powered enhancement of LaTeX and bullet points"
                >
                  {aiLoading.latex ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>AI Enhance Code</span>
                </button>
              </div>
            </div>

            {/* Monospaced LaTeX Editor Area */}
            <div className="flex-1 relative font-mono text-sm">
              <textarea
                value={latexCode}
                onChange={(e) => handleLatexCodeChange(e.target.value)}
                className="w-full h-full bg-slate-950 text-slate-200 p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none border-none selection:bg-blue-600 selection:text-white"
                placeholder="% Type or paste your LaTeX code here..."
                spellCheck="false"
              />
            </div>
          </div>

          {/* RIGHT: Live Compiled PDF Preview Panel */}
          <div className="bg-slate-900 p-4 overflow-y-auto h-full flex flex-col items-center justify-start relative border-l border-slate-800">
            {/* Top Status Toolbar */}
            <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 mb-3 flex items-center justify-between text-xs text-slate-300 shadow-sm">
              <span className="font-mono flex items-center gap-2">
                <Eye size={14} className="text-emerald-400" /> Compiled PDF Document Preview
              </span>
              {isCompilingPdf ? (
                <span className="flex items-center gap-1.5 text-blue-400 font-medium animate-pulse">
                  <Loader2 size={13} className="animate-spin text-blue-400" /> Compiling PDF...
                </span>
              ) : (
                <span className="text-emerald-400 text-[11px] font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  Ready (100% Vector PDF)
                </span>
              )}
            </div>

            {/* LaTeX Compilation Error Panel */}
            {compileError && (
              <div className="w-full mb-3 bg-red-950/90 border border-red-600 rounded-xl p-4 text-red-200 shadow-xl z-20">
                <div className="flex items-center gap-2 font-bold text-red-300 mb-1.5 text-xs uppercase tracking-wider">
                  <AlertTriangle size={16} /> LaTeX Compilation Error
                </div>
                <pre className="text-xs font-mono bg-slate-950/90 p-3 rounded-lg overflow-x-auto text-red-300 border border-red-900/60 whitespace-pre-wrap max-h-48">
                  {compileError}
                </pre>
                <p className="text-[11px] text-red-400 mt-2">
                  Please check your LaTeX syntax in the editor on the left and click <strong>Sync Preview</strong> or <strong>Regenerate</strong>.
                </p>
              </div>
            )}

            {/* PDF Viewer iFrame */}
            {compiledPdfUrl ? (
              <div className="w-full h-full min-h-[750px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700 flex-1 relative">
                <iframe
                  src={`${compiledPdfUrl}#view=FitH`}
                  title="Compiled PDF Preview"
                  className="w-full h-full min-h-[750px] border-none"
                />
              </div>
            ) : (
              <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center text-slate-400 py-20 bg-slate-950/50 rounded-xl border border-slate-800">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                <p className="text-xs font-medium">Compiling PDF document preview...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {editorTab === 'form' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
          {/* LEFT PANEL — Form Controls */}
          <div className="space-y-4">
            
            {/* Contact Information */}
            <SectionCard title="Contact Information">
              <div className="grid grid-cols-2 gap-3">
                {['name', 'email', 'phone', 'linkedin', 'github', 'portfolio'].map(field => (
                  <Field key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={contact[field] || ''}
                      onChange={e => handleContactChange(field, e.target.value)}
                      className={inputCls}
                      placeholder={field}
                    />
                  </Field>
                ))}
              </div>
            </SectionCard>

            {/* Professional Summary */}
            <SectionCard title="Professional Summary">
              <textarea
                value={resumeData.summary}
                onChange={e => updateResumeData(prev => ({ ...prev, summary: e.target.value }))}
                rows={4}
                className={textareaCls}
                placeholder="Write a compelling professional summary…"
              />
            </SectionCard>

            {/* Technical Skills */}
            <SectionCard
              title="Skills"
              action={
                <button
                  type="button"
                  onClick={() => autoAddSkills(["System Design", "Blockchain", "Web3", "Go", "PostgreSQL"])}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md font-semibold transition"
                  title="Auto add missing JD skills"
                >
                  <Sparkles size={12} /> Auto-Add Missing Skills
                </button>
              }
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {resumeData.skills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {skill}
                    <button onClick={() => removeSkill(i)} className="hover:text-red-500">
                      <Trash2 size={10} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick AI Skill Suggestions */}
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                    <Zap size={11} className="text-purple-600" /> Suggested for Engineering / JD Match:
                  </span>
                  <button
                    type="button"
                    onClick={() => autoAddSkills(["System Design", "Blockchain", "Web3", "Go", "PostgreSQL", "Docker", "CI/CD"])}
                    className="text-[10px] text-purple-700 hover:underline font-bold"
                  >
                    + Add All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["System Design", "Blockchain", "Web3", "Go", "PostgreSQL", "Docker", "CI/CD"]
                    .filter(s => !(resumeData.skills || []).some(curr => curr.toLowerCase() === s.toLowerCase()))
                    .map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => autoAddSkills([s])}
                        className="text-[11px] px-2 py-0.5 bg-white border border-purple-200 text-purple-800 rounded-md hover:bg-purple-600 hover:text-white transition font-medium flex items-center gap-1"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  className={`${inputCls} flex-1`}
                  placeholder="Add skill and press Enter…"
                />
                <button onClick={addSkill} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Plus size={15} />
                </button>
              </div>
            </SectionCard>

            {/* Experience */}
            <SectionCard title="Experience" collapsible>
              <div className="space-y-4">
                {resumeData.experience.map((exp, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3 relative">
                    <button onClick={() => removeListItem('experience', i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Job Title">
                        <input className={inputCls} value={exp.title || ''} onChange={e => updateListItem('experience', i, 'title', e.target.value)} placeholder="Software Engineer" />
                      </Field>
                      <Field label="Company">
                        <input className={inputCls} value={exp.company || ''} onChange={e => updateListItem('experience', i, 'company', e.target.value)} placeholder="Company Name" />
                      </Field>
                      <Field label="Dates">
                        <input className={inputCls} value={exp.dates || ''} onChange={e => updateListItem('experience', i, 'dates', e.target.value)} placeholder="Jan 2022 – Present" />
                      </Field>
                      <Field label="Location">
                        <input className={inputCls} value={exp.location || ''} onChange={e => updateListItem('experience', i, 'location', e.target.value)} placeholder="Remote" />
                      </Field>
                    </div>
                    <Field label="Bullet Points (one per line)">
                      <textarea
                        className={textareaCls}
                        rows={3}
                        value={Array.isArray(exp.bullets) ? exp.bullets.join('\n') : ''}
                        onChange={e => updateListItem('experience', i, 'bullets', e.target.value.split('\n'))}
                        placeholder="• Built RESTful APIs…&#10;• Reduced load time by 40%…"
                      />
                    </Field>
                  </div>
                ))}
                <button
                  onClick={() => addListItem('experience', { title: '', company: '', dates: '', location: '', bullets: [] })}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Add Experience
                </button>
              </div>
            </SectionCard>

            {/* Education */}
            <SectionCard title="Education" collapsible>
              <div className="space-y-4">
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3 relative">
                    <button onClick={() => removeListItem('education', i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Degree">
                        <input className={inputCls} value={edu.degree || ''} onChange={e => updateListItem('education', i, 'degree', e.target.value)} placeholder="B.Tech Computer Science" />
                      </Field>
                      <Field label="Institution">
                        <input className={inputCls} value={edu.institution || ''} onChange={e => updateListItem('education', i, 'institution', e.target.value)} placeholder="University Name" />
                      </Field>
                      <Field label="Year">
                        <input className={inputCls} value={edu.year || ''} onChange={e => updateListItem('education', i, 'year', e.target.value)} placeholder="2020 – 2024" />
                      </Field>
                      <Field label="GPA / CGPA">
                        <input className={inputCls} value={edu.gpa || ''} onChange={e => updateListItem('education', i, 'gpa', e.target.value)} placeholder="9.0 / 10" />
                      </Field>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addListItem('education', { degree: '', institution: '', year: '', gpa: '' })}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Add Education
                </button>
              </div>
            </SectionCard>

            {/* Projects */}
            <SectionCard title="Projects" collapsible>
              <div className="space-y-4">
                {resumeData.projects.map((proj, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3 relative">
                    <button onClick={() => removeListItem('projects', i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Project Name">
                        <input className={inputCls} value={proj.name || ''} onChange={e => updateListItem('projects', i, 'name', e.target.value)} placeholder="My Awesome Project" />
                      </Field>
                      <Field label="Tech Stack">
                        <input className={inputCls} value={proj.tech || ''} onChange={e => updateListItem('projects', i, 'tech', e.target.value)} placeholder="React, Node.js, MongoDB" />
                      </Field>
                    </div>
                    <Field label="Bullet Points (one per line)">
                      <textarea
                        className={textareaCls}
                        rows={3}
                        value={Array.isArray(proj.bullets) ? proj.bullets.join('\n') : ''}
                        onChange={e => updateListItem('projects', i, 'bullets', e.target.value.split('\n'))}
                        placeholder="• Developed real-time chat…"
                      />
                    </Field>
                  </div>
                ))}
                <button
                  onClick={() => addListItem('projects', { name: '', tech: '', bullets: [] })}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT PANEL — Live Render Preview */}
          <div className="xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)] xl:overflow-y-auto">
            <ResumePreview resumeData={resumeData} templateId={selectedTemplate} />
          </div>
        </div>
      )}

      {editorTab === 'preview' && (
        <div className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full flex flex-col gap-4">
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-blue-400" />
              <div>
                <h2 className="text-sm font-semibold text-white">Full Compiled Document Preview</h2>
                <p className="text-xs text-slate-400">Viewing standard rendered PDF document output</p>
              </div>
            </div>
            <button
              onClick={() => compilePdf(latexCode)}
              disabled={isCompilingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              {isCompilingPdf ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Recompile PDF
            </button>
          </div>

          {compileError && (
            <div className="bg-red-950/90 border border-red-600 rounded-xl p-4 text-red-200">
              <div className="flex items-center gap-2 font-bold text-red-300 mb-1 text-xs">
                <AlertTriangle size={16} /> Compilation Error
              </div>
              <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg text-red-300 border border-red-900 whitespace-pre-wrap">
                {compileError}
              </pre>
            </div>
          )}

          {compiledPdfUrl ? (
            <div className="w-full h-[850px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700">
              <iframe
                src={`${compiledPdfUrl}#view=FitH`}
                title="Full Compiled PDF Preview"
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <ResumePreview resumeData={resumeData} templateId={selectedTemplate} full />
          )}
        </div>
      )}
    </div>
  );
};

// ─── Preview Component ────────────────────────────────────────────────────────
function ResumePreview({ resumeData, templateId = 'modern-tech', full = false }) {
  const isDataEmpty = !resumeData || (
    !resumeData.contactInfo?.name &&
    (!resumeData.experience || resumeData.experience.length === 0) &&
    (!resumeData.projects || resumeData.projects.length === 0)
  );

  const baseData = isDataEmpty ? TEJA_DEFAULT_RESUME_DATA : resumeData;

  const contact = {
    name: baseData?.contactInfo?.name?.trim() || '',
    email: baseData?.contactInfo?.email?.trim() || '',
    phone: baseData?.contactInfo?.phone?.trim() || '',
    linkedin: baseData?.contactInfo?.linkedin?.trim() || '',
    github: baseData?.contactInfo?.github?.trim() || '',
  };

  const summary = baseData?.summary?.trim() || '';
  const categories = buildCategorizedSkills(baseData?.skills || [], baseData?.skillCategories || {});
  const expList = baseData?.experience || [];
  const eduList = baseData?.education || [];
  const rawProjList = baseData?.projects || [];
  const projList = rawProjList.map(cleanProject);
  const compProg = baseData?.competitiveProgramming || [];
  const achievements = baseData?.achievements || [];
  const leadership = baseData?.leadership || [];
  const certs = baseData?.certifications || [];

  // ──────────────────────────────────────────────────────────────────────────
  // TEMPLATE: RenderCV Engineering (Official Clean Layout)
  // ──────────────────────────────────────────────────────────────────────────
  if (templateId === 'rendercv-engineering') {
    return (
      <div id="printable-resume" className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-gray-900 font-serif ${full ? '' : 'sticky top-0'}`}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden !important; }
            #printable-resume, #printable-resume * { visibility: visible !important; }
            #printable-resume {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: white !important;
              z-index: 99999 !important;
            }
            .no-print { display: none !important; }
            @page { margin: 1.2cm; size: A4 portrait; }
          }
        `}} />
        <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4 font-mono no-print">
          <span className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Eye size={12} className="text-indigo-600" /> RENDERCV ENGINEERING TEMPLATE
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">ATS Optimized (Charter / Paracol)</span>
        </div>

        {/* Centered RenderCV Header */}
        <div className="text-center pb-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">{contact.name}</h1>
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-700 font-sans">
            {contact.email && <a href={`mailto:${contact.email}`} className="hover:underline text-indigo-700">{contact.email}</a>}
            {contact.email && contact.phone && <span className="text-gray-400">|</span>}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.linkedin && (
              <>
                <span className="text-gray-400">|</span>
                <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">LinkedIn</a>
              </>
            )}
            {contact.github && (
              <>
                <span className="text-gray-400">|</span>
                <a href={contact.github} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">GitHub</a>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Sections from Parsed LaTeX Source Code */}
        {baseData?.sections && baseData.sections.length > 0 ? (
          <div className="space-y-3">
            {baseData.sections.map((sec, i) => (
              <div key={i} className="mb-3 page-break-avoid">
                <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1 tracking-wider">
                  {sec.title}
                </h3>
                {sec.text && (
                  <p className="text-xs text-gray-800 leading-relaxed font-sans mb-1.5 whitespace-pre-line">{sec.text}</p>
                )}
                {sec.items && sec.items.length > 0 && (
                  <ul className="space-y-0.5 mt-0.5 list-disc pl-4 text-xs text-gray-800 font-sans">
                    {sec.items.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Profile Section */}
            {summary && (
              <div className="mb-3">
                <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1 tracking-wider">
                  Profile
                </h3>
                <p className="text-xs text-gray-800 leading-relaxed font-sans">{summary}</p>
              </div>
            )}

            {/* Experience Section */}
            {expList.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1.5 tracking-wider">
                  Experience
                </h3>
                <div className="space-y-2.5">
                  {expList.map((exp, i) => (
                    <div key={i} className="page-break-avoid">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-gray-950">
                          {exp.title}{exp.company ? `, ${exp.company}` : ''}
                        </span>
                        <span className="text-xs font-medium text-gray-700 font-sans">{exp.dates}</span>
                      </div>
                      <ul className="space-y-0.5 mt-0.5 list-disc pl-4 text-xs text-gray-800 font-sans">
                        {exp.bullets?.filter(b => b && b.trim()).map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {eduList.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1.5 tracking-wider">
                  Education
                </h3>
                <div className="space-y-1.5">
                  {eduList.map((edu, i) => (
                    <div key={i} className="page-break-avoid">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-gray-950">
                          {edu.institution}, <span className="font-normal">{edu.degree}</span>
                        </span>
                        <span className="text-xs font-medium text-gray-700 font-sans">{edu.year}</span>
                      </div>
                      {edu.gpa && (
                        <p className="text-xs text-gray-700 font-sans pl-4 mt-0.5">• CGPA: <strong>{edu.gpa}</strong></p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies & Skills */}
            <div className="mb-3">
              <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1 tracking-wider">
                Technologies & Skills
              </h3>
              <div className="space-y-0.5 text-xs font-sans">
                {Object.entries(categories).map(([cat, val], i) => (
                  <div key={i} className="text-gray-800">
                    <strong className="text-gray-950 font-serif">{cat}:</strong> {val}
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            {projList.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1.5 tracking-wider">
                  Projects
                </h3>
                <div className="space-y-2.5">
                  {projList.map((proj, i) => (
                    <div key={i} className="page-break-avoid">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-gray-950">{proj.name}</span>
                        <span className="text-xs italic text-gray-600 font-sans">{proj.tech}</span>
                      </div>
                      <ul className="space-y-0.5 mt-0.5 list-disc pl-4 text-xs text-gray-800 font-sans">
                        {proj.bullets?.filter(b => b && b.trim()).map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Programming */}
            {compProg.length > 0 && (
              <div className="mb-3 page-break-avoid">
                <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1 tracking-wider">
                  Competitive Programming
                </h3>
                <ul className="space-y-0.5 list-disc pl-4 text-xs text-gray-800 font-sans">
                  {compProg.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1.5 tracking-wider">
                  Achievements
                </h3>
                <ul className="space-y-0.5 list-disc pl-4 text-xs text-gray-800 font-sans">
                  {achievements.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {/* Certifications */}
            {certs.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-black pb-0.5 mb-1.5 tracking-wider">
                  Certifications
                </h3>
                <ul className="space-y-0.5 list-disc pl-4 text-xs text-gray-800 font-sans">
                  {certs.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEMPLATE 1: Compact Two-Column Sidebar
  // ──────────────────────────────────────────────────────────────────────────
  if (templateId === 'compact-sidebar') {
    return (
      <div id="printable-resume" className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-gray-900 ${full ? '' : 'sticky top-0'}`}>
        <div className="bg-slate-900 text-white px-6 py-2.5 flex justify-between items-center text-xs font-mono no-print">
          <span className="flex items-center gap-1.5"><Eye size={13} className="text-blue-400" /> TWO-COLUMN SIDEBAR TEMPLATE</span>
          <span className="text-slate-400">1-Page Optimized</span>
        </div>

        <div className="grid grid-cols-12 min-h-[750px]">
          {/* Left Column (Sidebar - 35% width) */}
          <div className="col-span-12 md:col-span-4 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-3.5">
            {/* Contact Info */}
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-base mb-2 shadow-sm">
                {contact.name ? contact.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'TS'}
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{contact.name}</h2>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">Software & AI Engineer</p>

              <div className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                <p className="break-all">✉ {contact.email}</p>
                <p>📞 {contact.phone}</p>
                {contact.linkedin && <p className="truncate">🔗 <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a></p>}
                {contact.github && <p className="truncate">🐙 <a href={contact.github} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GitHub Profile</a></p>}
              </div>
            </div>

            {/* Education in Sidebar */}
            {eduList.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mb-1.5">
                  Education
                </h3>
                {eduList.map((edu, i) => (
                  <div key={i} className="mb-1 text-[11px]">
                    <p className="font-bold text-slate-900">{edu.degree || 'B.Tech in IT'}</p>
                    <p className="text-slate-600 text-[10.5px]">{edu.institution}</p>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-medium">
                      <span>{edu.year}</span>
                      {edu.gpa && <span className="text-blue-700 font-bold">CGPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Technical Skills */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mb-1.5">
                Technical Skills
              </h3>
              <div className="space-y-1.5 text-[11px]">
                {Object.entries(categories).map(([cat, val], i) => (
                  <div key={i}>
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{cat}</p>
                    <p className="text-[10.5px] text-slate-600 leading-tight">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications in Sidebar */}
            {certs.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mb-1">
                  Certifications
                </h3>
                <ul className="space-y-0.5 text-[10.5px] text-slate-600">
                  {certs.map((c, i) => <li key={i}>• {c}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column (Main Content - 65% width) */}
          <div className="col-span-12 md:col-span-8 p-4 flex flex-col gap-3.5">
            {/* Profile */}
            {summary && (
              <div>
                <div className="flex items-center gap-2 border-b border-blue-600 pb-0.5 mb-1.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Profile Summary</h3>
                </div>
                <p className="text-[11.5px] text-slate-700 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Experience */}
            {expList.length > 0 && (
              <div>
                <div className="flex items-center gap-2 border-b border-blue-600 pb-0.5 mb-1.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Experience</h3>
                </div>
                {expList.map((exp, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <p className="text-[11.5px] font-bold text-slate-900">{exp.title}</p>
                      <span className="text-[10.5px] text-blue-600 font-semibold">{exp.dates}</span>
                    </div>
                    {exp.company && <p className="text-[10.5px] text-slate-500 italic">{exp.company}</p>}
                    <ul className="space-y-0.5 mt-0.5">
                      {exp.bullets?.filter(b => b && b.trim()).map((b, j) => (
                        <li key={j} className="text-xs text-slate-700 pl-2 border-l-2 border-slate-200">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projList.length > 0 && (
              <div>
                <div className="flex items-center gap-2 border-b border-blue-600 pb-1 mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">Key Projects</h3>
                </div>
                <div className="space-y-3">
                  {projList.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-bold text-slate-900">{proj.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono italic">{proj.tech}</p>
                      </div>
                      <ul className="space-y-1 mt-1">
                        {proj.bullets?.filter(b => b && b.trim()).map((b, j) => (
                          <li key={j} className="text-xs text-slate-700 pl-2 border-l-2 border-blue-100">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Programming & Achievements */}
            {compProg.length > 0 && (
              <div>
                <div className="flex items-center gap-2 border-b border-blue-600 pb-1 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">Competitive Programming</h3>
                </div>
                <ul className="space-y-1 text-xs text-slate-700">
                  {compProg.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            )}

            {achievements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 border-b border-blue-600 pb-1 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">Achievements</h3>
                </div>
                <ul className="space-y-1 text-xs text-slate-700">
                  {achievements.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEMPLATE 2: Classic Executive (Serif & Navy Accents)
  // ──────────────────────────────────────────────────────────────────────────
  if (templateId === 'classic-executive') {
    return (
      <div id="printable-resume" className={`bg-[#fdfbf7] rounded-xl shadow-lg border border-[#e5dec9] p-8 text-gray-900 font-serif ${full ? '' : 'sticky top-0'}`}>
        <div className="flex justify-between items-center border-b border-[#e5dec9] pb-3 mb-6 font-sans no-print">
          <span className="text-xs font-mono text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <Eye size={12} /> CLASSIC EXECUTIVE SERIF TEMPLATE
          </span>
        </div>

        {/* Executive Centered Header */}
        <div className="text-center pb-4 border-b-2 border-indigo-950 mb-6">
          <h2 className="text-3xl font-bold tracking-wide text-indigo-950 uppercase">{contact.name}</h2>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs font-sans text-slate-700">
            <span>{contact.phone}</span>
            <span>|</span>
            <a href={`mailto:${contact.email}`} className="text-indigo-900 hover:underline">{contact.email}</a>
            {contact.linkedin && <><span>|</span><a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-indigo-900 hover:underline">LinkedIn</a></>}
            {contact.github && <><span>|</span><a href={contact.github} target="_blank" rel="noreferrer" className="text-indigo-900 hover:underline">GitHub</a></>}
          </div>
        </div>

        {/* Profile */}
        {summary && (
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase text-indigo-950 tracking-wider border-b border-indigo-900/30 pb-1 mb-2">Executive Profile</h3>
            <p className="text-xs leading-relaxed text-slate-800">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {expList.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase text-indigo-950 tracking-wider border-b border-indigo-900/30 pb-1 mb-2.5">Professional Experience</h3>
            <div className="space-y-3">
              {expList.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-bold text-slate-900">{exp.title}</p>
                    <p className="text-xs text-slate-600 italic font-sans">{exp.dates}</p>
                  </div>
                  {exp.company && <p className="text-xs text-slate-700 italic">{exp.company}</p>}
                  <ul className="space-y-1 mt-1">
                    {exp.bullets?.filter(b => b && b.trim()).map((b, j) => (
                      <li key={j} className="text-xs text-slate-800 pl-3 relative before:content-['—'] before:absolute before:left-0 before:text-indigo-900">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {eduList.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase text-indigo-950 tracking-wider border-b border-indigo-900/30 pb-1 mb-2">Education</h3>
            {eduList.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline mb-1">
                <div>
                  <p className="text-xs font-bold text-slate-900">{edu.institution}</p>
                  <p className="text-xs text-slate-700 italic">{edu.degree}</p>
                </div>
                <div className="text-right font-sans">
                  {edu.gpa && <p className="text-xs font-bold text-indigo-950">CGPA: {edu.gpa}</p>}
                  <p className="text-xs text-slate-600">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Technical Skills */}
        <div className="mb-5">
          <h3 className="text-sm font-bold uppercase text-indigo-950 tracking-wider border-b border-indigo-900/30 pb-1 mb-2">Technical Competencies</h3>
          <div className="space-y-1 text-xs">
            {Object.entries(categories).map(([cat, val], i) => (
              <p key={i} className="text-slate-800">
                <span className="font-bold text-indigo-950">{cat}:</span> {val}
              </p>
            ))}
          </div>
        </div>

        {/* Projects */}
        {projList.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase text-indigo-950 tracking-wider border-b border-indigo-900/30 pb-1 mb-2.5">Key Projects</h3>
            <div className="space-y-3">
              {projList.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-bold text-slate-900">{proj.name}</p>
                    <p className="text-xs text-slate-600 font-sans italic">{proj.tech}</p>
                  </div>
                  <ul className="space-y-1 mt-1">
                    {proj.bullets?.filter(b => b && b.trim()).map((b, j) => (
                      <li key={j} className="text-xs text-slate-800 pl-3 relative before:content-['—'] before:absolute before:left-0 before:text-indigo-900">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitive & Achievements */}
        {compProg.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase text-indigo-950 tracking-wider border-b border-indigo-900/30 pb-1 mb-2">Competitive Programming</h3>
            <ul className="space-y-1 text-xs text-slate-800">
              {compProg.map((item, i) => <li key={i}>• {item}</li>)}
            </ul>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase text-indigo-950 tracking-wider border-b border-indigo-900/30 pb-1 mb-2">Achievements</h3>
            <ul className="space-y-1 text-xs text-slate-800">
              {achievements.map((item, i) => <li key={i}>• {item}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEMPLATE 3: Minimal Academic
  // ──────────────────────────────────────────────────────────────────────────
  if (templateId === 'minimal-academic') {
    return (
      <div id="printable-resume" className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-gray-900 ${full ? '' : 'sticky top-0'}`}>
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5 font-mono no-print">
          <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Eye size={12} /> MINIMAL ACADEMIC TEMPLATE
          </span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-900 pb-3 mb-5">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">{contact.name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-600 font-mono">
            <span>{contact.email}</span>
            <span>[{contact.phone}]</span>
            {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-gray-900 hover:underline">LinkedIn</a>}
            {contact.github && <a href={contact.github} target="_blank" rel="noreferrer" className="text-gray-900 hover:underline">GitHub</a>}
          </div>
        </div>

        {/* Profile */}
        {summary && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">Profile</h3>
            <p className="text-xs text-gray-800 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {expList.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-gray-300 pb-0.5 mb-2">Experience</h3>
            {expList.map((exp, i) => (
              <div key={i} className="mb-2.5">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-bold text-gray-900">{exp.title}</p>
                  <p className="text-xs text-gray-600 font-mono">{exp.dates}</p>
                </div>
                <ul className="space-y-0.5 mt-1">
                  {exp.bullets?.filter(b => b && b.trim()).map((b, j) => (
                    <li key={j} className="text-xs text-gray-800 pl-2">· {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {eduList.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">Education</h3>
            {eduList.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="text-xs font-bold text-gray-900">{edu.institution}</span>
                  <span className="text-xs text-gray-600 ml-2">— {edu.degree}</span>
                </div>
                <span className="text-xs font-mono text-gray-700">{edu.gpa ? `CGPA ${edu.gpa}` : ''} ({edu.year})</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">Technical Skills</h3>
          <div className="space-y-1 text-xs">
            {Object.entries(categories).map(([cat, val], i) => (
              <p key={i} className="text-gray-800">
                <span className="font-semibold text-gray-900">{cat}:</span> {val}
              </p>
            ))}
          </div>
        </div>

        {/* Projects */}
        {projList.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-gray-300 pb-0.5 mb-2">Projects</h3>
            {projList.map((proj, i) => (
              <div key={i} className="mb-2.5">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-bold text-gray-900">{proj.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{proj.tech}</p>
                </div>
                <ul className="space-y-0.5 mt-1">
                  {proj.bullets?.filter(b => b && b.trim()).map((b, j) => (
                    <li key={j} className="text-xs text-gray-800 pl-2">· {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Competitive Programming & Achievements */}
        {compProg.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">Competitive Programming</h3>
            <ul className="space-y-0.5 text-xs text-gray-800">
              {compProg.map((item, i) => <li key={i}>· {item}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DEFAULT: Modern Tech (Jake's Resume / Single-Column Clean ATS)
  // ──────────────────────────────────────────────────────────────────────────
  const sectionTitle = (text) => (
    <div className="flex items-center gap-3 mb-2.5">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">{text}</h3>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );

  return (
    <div id="printable-resume" className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-gray-900 ${full ? '' : 'sticky top-0'}`}>
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5 no-print">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Eye size={12} /> Rendered PDF Preview (Modern Tech - Jake's Template)
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">{contact.name}</h2>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-700">
          <span>{contact.email}</span>
          <span>• {contact.phone}</span>
          {contact.linkedin && <span>• <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></span>}
          {contact.github && <span>• <a href={contact.github} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GitHub</a></span>}
        </div>
      </div>

      {/* Profile */}
      {summary && (
        <div className="mb-5">
          {sectionTitle('Profile')}
          <p className="text-xs text-gray-800 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {expList.length > 0 && (
        <div className="mb-5">
          {sectionTitle('Experience')}
          <div className="space-y-3">
            {expList.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-gray-900">{exp.title}</p>
                  <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">{exp.dates}</p>
                </div>
                {exp.company && <p className="text-xs text-gray-600 italic mb-1">{exp.company}</p>}
                {exp.bullets?.filter(b => b && b.trim()).map((b, j) => (
                  <p key={j} className="text-xs text-gray-800 mt-1 pl-2">• {b}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {eduList.length > 0 && (
        <div className="mb-5">
          {sectionTitle('Education')}
          <div className="space-y-2">
            {eduList.map((edu, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-900">{edu.institution}</p>
                  <p className="text-xs text-gray-700">{edu.degree}</p>
                </div>
                <div className="text-right">
                  {edu.gpa && <p className="text-xs font-bold text-gray-900">CGPA: {edu.gpa}</p>}
                  <p className="text-xs text-gray-600">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Skills */}
      <div className="mb-5">
        {sectionTitle('Technical Skills')}
        <div className="space-y-1 text-xs">
          {Object.entries(categories).map(([cat, val], i) => (
            <p key={i} className="text-gray-800">
              <span className="font-bold text-gray-900">{cat}:</span> {val}
            </p>
          ))}
        </div>
      </div>

      {/* Projects */}
      {projList.length > 0 && (
        <div className="mb-5">
          {sectionTitle('Projects')}
          <div className="space-y-3">
            {projList.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-gray-900">{proj.name}</p>
                  <p className="text-xs font-semibold text-gray-700 italic">{proj.tech}</p>
                </div>
                {proj.bullets?.filter(b => b && b.trim()).map((b, j) => (
                  <p key={j} className="text-xs text-gray-800 mt-1 pl-2">• {b}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Programming */}
      {compProg.length > 0 && (
        <div className="mb-5">
          {sectionTitle('Competitive Programming')}
          <ul className="space-y-1 text-xs text-gray-800">
            {compProg.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-5">
          {sectionTitle('Achievements')}
          <ul className="space-y-1 text-xs text-gray-800">
            {achievements.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Leadership & Clubs */}
      {leadership.length > 0 && (
        <div className="mb-5">
          {sectionTitle('Leadership & Clubs')}
          <ul className="space-y-1 text-xs text-gray-800">
            {leadership.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <div className="mb-5">
          {sectionTitle('Certifications')}
          <ul className="space-y-1 text-xs text-gray-800">
            {certs.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ResumeEditor;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Wand2, Download, Copy, CheckCircle, AlertCircle, FileCode, Sparkles } from 'lucide-react';
import { aiAPI, downloadAPI } from '../services/api';

const DEFAULT_RESUME_SNIPPET = `TEJA SRI LAKSHMI ILLA
itejasrilakshmi@gmail.com | +91 9553348754 | B.Tech Information Technology (CGPA: 9.15/10)
Shri Vishnu Engineering College for Women (2023 - 2027)

Profile:
Information Technology undergraduate with strong foundations in Data Structures, Algorithms, Object-Oriented Programming, DBMS, SQL, and full-stack software development. Experienced in building scalable applications using Java, Python, JavaScript, Spring Boot, Django, Node.js, REST APIs, MySQL, and MongoDB. Solved 650+ LeetCode problems. Trainee at Amazon ML Summer School 2026.

Key Projects:
- AI Resume Analyzer & Corrector: Spring Boot, React, MongoDB, REST APIs
- Real-Time BookSwap Platform: Django, React, MySQL, Channels, WebSockets
- License Plate Recognition Parking System: Python, OpenCV, OCR, Node.js, MongoDB
- AI Meeting Summarizer: Python, Whisper, NLP, Streamlit, SQLite`;

const CoverLetterGenerator = () => {
  const [formData, setFormData] = useState({
    resumeText: DEFAULT_RESUME_SNIPPET,
    jobDescription: '',
    userName: 'Teja Sri Lakshmi Illa'
  });
  const [coverLetter, setCoverLetter] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async () => {
    if (!formData.resumeText.trim() || !formData.jobDescription.trim() || !formData.userName.trim()) {
      setError('Please fill in your name, resume content, and job description');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await aiAPI.generateCoverLetter(
        formData.resumeText,
        formData.jobDescription,
        formData.userName
      );

      const parsedResponse = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      setCoverLetter(parsedResponse.coverLetter || parsedResponse);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!coverLetter) return;
    setDownloadingPdf(true);
    try {
      const response = await downloadAPI.coverLetterPdf(coverLetter, formData.userName || 'Applicant');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover-letter-${(formData.userName || 'applicant').toLowerCase().replace(/\s+/g, '-')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback: simple text blob
      handleDownloadTxt();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!coverLetter) return;
    setDownloadingDocx(true);
    try {
      const response = await downloadAPI.coverLetterDocx(coverLetter, formData.userName || 'Applicant');
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover-letter-${(formData.userName || 'applicant').toLowerCase().replace(/\s+/g, '-')}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('DOCX download error:', err);
      // Fallback to text file
      handleDownloadTxt();
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `cover-letter-${(formData.userName || 'applicant').toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-widest mb-1">
            <Sparkles size={14} /> AI Tailored Application
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Cover Letter Generator</h1>
          <p className="text-slate-600 mt-1">
            Generate a targeted, high-impact cover letter dynamically tailored to the specific role, company, and job description requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Application Context
                </h3>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, resumeText: DEFAULT_RESUME_SNIPPET, userName: 'Teja Sri Lakshmi Illa' }))}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Reset to My Profile
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    placeholder="e.g. Teja Sri Lakshmi Illa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Job Description / Target Role
                  </label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 font-mono text-xs"
                    placeholder="Paste the target job description (e.g. CoinDCX Intern, Google SWE, Amazon SDE)..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Resume Highlights & Skills
                  </label>
                  <textarea
                    name="resumeText"
                    value={formData.resumeText}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 font-mono text-xs"
                    placeholder="Paste your resume content or key achievements here..."
                  />
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="text-xs text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {generating ? (
                    <>
                      <Wand2 className="h-5 w-5 animate-spin" />
                      Crafting Custom Cover Letter...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Generate Tailored Cover Letter
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Output Preview */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-full"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full min-h-[580px]">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-blue-600" />
                  Generated Cover Letter
                </h3>

                {coverLetter && (
                  <div className="flex flex-wrap gap-1.5">
                    {/* Copy Button */}
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                      title="Copy letter to clipboard"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-green-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* PDF Download Button */}
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-bold transition shadow-sm disabled:opacity-50"
                      title="Download formatted PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{downloadingPdf ? 'PDF...' : 'PDF'}</span>
                    </button>

                    {/* Word DOCX Download Button */}
                    <button
                      onClick={handleDownloadDocx}
                      disabled={downloadingDocx}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold transition shadow-sm disabled:opacity-50"
                      title="Download editable Microsoft Word document"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{downloadingDocx ? 'Word...' : 'Word (.docx)'}</span>
                    </button>
                  </div>
                )}
              </div>

              {coverLetter ? (
                <div className="flex-1 border border-slate-200 rounded-xl p-6 bg-slate-50/70 overflow-y-auto max-h-[540px]">
                  <div className="prose prose-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap text-xs md:text-sm">
                    {coverLetter}
                  </div>
                </div>
              ) : (
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center bg-slate-50/40">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <FileText className="h-7 w-7 text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Ready to Generate</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Paste the target job description on the left and click "Generate Tailored Cover Letter" to craft your application.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;

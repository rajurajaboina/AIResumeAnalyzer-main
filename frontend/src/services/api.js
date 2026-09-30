import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired – clear storage and reload to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    api.post('/api/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
};

// ── Resume ────────────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/api/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getById: (id) => api.get(`/api/resume/${id}`),
  getUserResumes: () => api.get('/api/resume/user'),
  /** Save only the structured ResumeData fields */
  saveData: (id, resumeData) => api.patch(`/api/resume/${id}/data`, resumeData),
  /** Full resume update (latex content, template, etc.) */
  update: (id, resume) => api.put(`/api/resume/${id}`, resume),
  delete: (id) => api.delete(`/api/resume/${id}`),
};

// ── Analysis ──────────────────────────────────────────────────────────────────
export const analysisAPI = {
  analyze: (resumeId, jobDescription) =>
    api.post('/api/analysis/analyze', { resumeId, jobDescription }),
  reanalyze: (analysisId) =>
    api.post(`/api/analysis/reanalyze/${analysisId}`),
  getById: (id) => api.get(`/api/analysis/${id}`),
  getUserAnalyses: () => api.get('/api/analysis/user'),
  delete: (id) => api.delete(`/api/analysis/${id}`),
};


// ── AI ────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  rewriteBullet: (originalBullet, rewriteType = 'professional') =>
    api.post('/api/ai/improve-bullet', { originalBullet, rewriteType }),
  generateSummary: (resumeText, jobDescription) =>
    api.post('/api/ai/generate-summary', { resumeText, jobDescription }),
  suggestSkills: (resumeText, jobDescription) =>
    api.post('/api/ai/suggest-skills', { resumeText, jobDescription }),
  generateCoverLetter: (resumeText, jobDescription, userName) =>
    api.post('/api/ai/generate-cover-letter', { resumeText, jobDescription, userName }),
  extractKeywords: (jobDescription) =>
    api.post('/api/ai/extract-keywords', jobDescription, {
      headers: { 'Content-Type': 'text/plain' },
    }),
};

// ── Downloads ─────────────────────────────────────────────────────────────────
export const downloadAPI = {
  pdf: (resumeId) =>
    api.get(`/api/download/resume/pdf/${resumeId}`, { responseType: 'blob' }),
  docx: (resumeId) =>
    api.get(`/api/download/resume/docx/${resumeId}`, { responseType: 'blob' }),
  coverLetterPdf: (coverLetter, userName) =>
    api.post('/api/download/cover-letter/pdf', { coverLetter, userName }, { responseType: 'blob' }),
  coverLetterDocx: (coverLetter, userName) =>
    api.post('/api/download/cover-letter/docx', { coverLetter, userName }, { responseType: 'blob' }),
  compileRawLatexPdf: (latexCode) =>
    api.post('/api/download/compile-latex-pdf', { latexCode }, { responseType: 'blob' }),
};

// ── Versions ──────────────────────────────────────────────────────────────────
export const versionAPI = {
  /** List all saved versions for a resume (newest first) */
  list: (resumeId) => api.get(`/api/resume/${resumeId}/versions`),
  /** Save the current resume state as a named snapshot */
  save: (resumeId, changeSummary = 'Manual save') =>
    api.post(`/api/resume/${resumeId}/versions`, { changeSummary }),
  /** Retrieve a specific version's data */
  getById: (resumeId, versionId) =>
    api.get(`/api/resume/${resumeId}/versions/${versionId}`),
};

export default api;

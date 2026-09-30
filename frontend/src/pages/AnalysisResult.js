import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  CheckCircle, XCircle, AlertCircle, Download, Edit, 
  RefreshCw, FileText, TrendingUp, Zap, Sparkles 
} from 'lucide-react';
import { analysisAPI, downloadAPI } from '../services/api';

const AnalysisResult = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeAnalysisId } = useParams();

  const fetchAnalysisData = useCallback(async () => {
    try {
      const analysisId = routeAnalysisId || location.pathname.split('/').pop();
      const response = await analysisAPI.getById(analysisId);
      setAnalysisData(response.data);
    } catch (error) {
      setError('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  }, [routeAnalysisId, location.pathname]);

  useEffect(() => {
    if (location.state?.analysisData) {
      setAnalysisData(location.state.analysisData);
      setLoading(false);
    } else {
      fetchAnalysisData();
    }
  }, [location.state?.analysisData, fetchAnalysisData]);

  const getScoreColor = (score) => {
    if (score >= 81) return '#10b981';
    if (score >= 61) return '#3b82f6';
    if (score >= 41) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 81) return 'Excellent Match';
    if (score >= 61) return 'Good Match';
    if (score >= 41) return 'Needs Improvement';
    return 'Poor Match';
  };

  const handleDownload = async (format) => {
    try {
      const resumeId = analysisData.resumeId || routeAnalysisId;
      if (!resumeId) {
        setError('Resume ID missing. Please go back to dashboard.');
        return;
      }
      const response = format === 'pdf' 
        ? await downloadAPI.pdf(resumeId)
        : await downloadAPI.docx(resumeId);

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `resume.${format}`;
      link.click();
    } catch (error) {
      setError('Failed to download resume. Please try again.');
    }
  };

  const handleEdit = (autoAdd = false) => {
    const targetResumeId = analysisData?.resumeId || routeAnalysisId;
    if (targetResumeId) {
      navigate(`/editor/${targetResumeId}`, {
        state: {
          missingSkills: analysisData?.missingSkills || [],
          missingKeywords: analysisData?.missingKeywords || [],
          jobDescription: analysisData?.jobDescription || '',
          autoAdd: autoAdd
        }
      });
    } else {
      setError('Cannot edit: Resume ID not found.');
    }
  };

  const handleReanalyze = async () => {
    try {
      const analysisId = routeAnalysisId || location.pathname.split('/').pop();
      const response = await analysisAPI.reanalyze(analysisId);
      setAnalysisData(response.data);
    } catch (error) {
      setError('Failed to reanalyze resume');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analysis...</div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'No analysis data found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
            <p className="text-gray-600 mt-2">Your resume has been analyzed against the job description.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReanalyze}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-Analyze
            </button>
            <button
              onClick={() => handleEdit(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 text-sm font-semibold shadow-sm transition"
              title="Automatically add missing skills to your resume and open editor"
            >
              <Zap className="h-4 w-4 mr-1.5 text-yellow-300 fill-yellow-300" />
              Auto-Add Skills & Edit
            </button>
            <button
              onClick={() => handleEdit(false)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Resume
            </button>
          </div>
        </div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-md p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ATS Score</h2>
              <p className="text-gray-600 mb-4">{getScoreLabel(analysisData.atsScore)}</p>
              
              {analysisData.previousAtsScore && (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    Improved from {analysisData.previousAtsScore} to {analysisData.atsScore} 
                    (+{analysisData.atsScore - analysisData.previousAtsScore} points)
                  </span>
                </div>
              )}
            </div>
            
            <div className="w-48">
              <CircularProgressbar
                value={analysisData.atsScore}
                text={`${analysisData.atsScore}/100`}
                styles={buildStyles({
                  textColor: getScoreColor(analysisData.atsScore),
                  pathColor: getScoreColor(analysisData.atsScore),
                  trailColor: '#e5e7eb',
                })}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700">{analysisData.finalRecommendation}</p>
          </div>
        </motion.div>

        {/* Keywords Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              Matched Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysisData.matchedKeywords.length > 0 ? (
                analysisData.matchedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No matched keywords found</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <XCircle className="h-6 w-6 text-red-600 mr-2" />
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysisData.missingKeywords.length > 0 ? (
                analysisData.missingKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No missing keywords</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Skills Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysisData.matchedSkills.length > 0 ? (
                analysisData.matchedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No matched skills found</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                  Missing Skills
                </h3>
                {analysisData.missingSkills && analysisData.missingSkills.length > 0 && (
                  <button
                    onClick={() => handleEdit(true)}
                    className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition"
                  >
                    <Sparkles size={12} /> Auto-Add to Resume
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisData.missingSkills.length > 0 ? (
                  analysisData.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No missing skills</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-2" />
            AI Suggestions
          </h3>
          <ul className="space-y-3">
            {analysisData.aiSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Improved Bullets */}
        {analysisData.improvedBullets && analysisData.improvedBullets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              Improved Bullet Points
            </h3>
            <div className="space-y-4">
              {analysisData.improvedBullets.map((bullet, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-2">
                    <p className="text-sm font-medium text-red-600 mb-1">Before:</p>
                    <p className="text-gray-600 text-sm">{bullet.before}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">After:</p>
                    <p className="text-gray-800">{bullet.after}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Download Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Download className="h-6 w-6 text-blue-600 mr-2" />
            Download Optimized Resume
          </h3>
          <div className="flex space-x-4">
            <button
              onClick={() => handleDownload('pdf')}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download as PDF
            </button>
            <button
              onClick={() => handleDownload('docx')}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download as DOCX
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisResult;

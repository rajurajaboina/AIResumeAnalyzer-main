import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analysisAPI } from '../services/api';
import { Briefcase, FileText, ArrowRight, AlertCircle } from 'lucide-react';

const JobDescription = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { resumeId } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (!resumeId) {
      setError('No resume selected. Please upload a resume first.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const response = await analysisAPI.analyze(resumeId, jobDescription);
      navigate(`/analysis/${response.data.analysisId}`, {
        state: { analysisData: response.data }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBack = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back to Upload
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Paste Job Description</h1>
          <p className="text-gray-600 mt-2">Paste the job description you want to apply for to get AI-powered analysis.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste the complete job description here, including requirements, responsibilities, qualifications, and preferred skills..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Tip: Include the full job description for better analysis results
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={analyzing}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {analyzing ? 'Analyzing...' : (
                  <>
                    <Briefcase className="h-5 w-5 mr-2" />
                    Analyze Resume
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tips Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Tips for Best Results
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Paste the complete job description including all requirements
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Include both required and preferred qualifications
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Make sure to include the job responsibilities and key skills
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                The more detailed the job description, the better the analysis
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDescription;

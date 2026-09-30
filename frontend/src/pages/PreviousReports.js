import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Calendar, TrendingUp, Eye, Trash2, Download } from 'lucide-react';
import { analysisAPI, downloadAPI } from '../services/api';

const PreviousReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await analysisAPI.getUserAnalyses();
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 81) return 'text-green-600 bg-green-50';
    if (score >= 61) return 'text-blue-600 bg-blue-50';
    if (score >= 41) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score) => {
    if (score >= 81) return 'Excellent';
    if (score >= 61) return 'Good';
    if (score >= 41) return 'Needs Improvement';
    return 'Poor';
  };

  const handleView = (reportId) => {
    navigate(`/analysis/${reportId}`);
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await analysisAPI.delete(reportId);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (error) {
      alert('Failed to delete report');
    }
  };

  const handleDownload = async (resumeId, format) => {
    try {
      const response = format === 'pdf'
        ? await downloadAPI.pdf(resumeId)
        : await downloadAPI.docx(resumeId);

      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `resume.${format}`;
      link.click();
    } catch (error) {
      alert('Failed to download resume');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Previous Reports</h1>
          <p className="text-gray-600 mt-2">View and manage your previous resume analysis reports.</p>
        </div>

        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-6">Upload and analyze your first resume to get started!</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Upload Resume
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ATS Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matched Keywords
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Missing Keywords
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report, index) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                          <span className={`text-sm font-bold ${getScoreColor(report.atsScore).split(' ')[0]}`}>
                            {report.atsScore}/100
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(report.atsScore)}`}>
                          {getScoreLabel(report.atsScore)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {report.matchedKeywords?.length || 0} matched
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {report.missingKeywords?.length || 0} missing
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(report.id)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View Report"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(report.resumeId, 'pdf')}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PreviousReports;

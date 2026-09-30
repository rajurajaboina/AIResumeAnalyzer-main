import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analysisAPI } from '../services/api';
import { FileText, TrendingUp, Download, Clock, Plus, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    bestAtsScore: 0,
    resumesDownloaded: 0,
    recentReports: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analysisAPI.getUserAnalyses();
      const analyses = response.data;
      const bestScore = analyses.length > 0
        ? Math.max(...analyses.map(a => a.atsScore))
        : 0;

      setStats({
        totalAnalyses: analyses.length,
        bestAtsScore: bestScore,
        resumesDownloaded: analyses.length,
        recentReports: analyses.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 81) return 'text-green-600';
    if (score >= 61) return 'text-blue-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 81) return 'Excellent';
    if (score >= 61) return 'Good';
    if (score >= 41) return 'Needs Improvement';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your resume analysis overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Analyses', value: stats.totalAnalyses, icon: FileText, color: 'bg-blue-500' },
            { label: 'Best ATS Score', value: stats.bestAtsScore, icon: TrendingUp, color: 'bg-green-500' },
            { label: 'Resumes Downloaded', value: stats.resumesDownloaded, icon: Download, color: 'bg-purple-500' },
            { label: 'Recent Reports', value: stats.recentReports.length, icon: Clock, color: 'bg-orange-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">Upload New Resume</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">View All Reports</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
            <button
              onClick={() => navigate('/reports')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>

          {stats.recentReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reports yet. Upload your first resume to get started!</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Resume Analysis</p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(report.atsScore)}`}>
                        {report.atsScore}/100
                      </p>
                      <p className="text-xs text-gray-500">{getScoreLabel(report.atsScore)}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/analysis/${report.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

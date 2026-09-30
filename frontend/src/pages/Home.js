import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Target, Zap, Shield, CheckCircle, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI Resume Analyzer & ATS Optimizer
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Optimize your resume for every job using AI. Upload your resume, paste a job description, 
              get an ATS score, improve weak points, and download your optimized resume instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Analyze Resume
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="h-12 w-12 text-blue-600" />,
                title: 'ATS Score Analysis',
                description: 'Get a comprehensive ATS score out of 100 with detailed feedback on how to improve your resume.'
              },
              {
                icon: <Zap className="h-12 w-12 text-blue-600" />,
                title: 'AI-Powered Suggestions',
                description: 'Receive intelligent suggestions to improve your resume content, bullet points, and formatting.'
              },
              {
                icon: <FileText className="h-12 w-12 text-blue-600" />,
                title: 'Resume Editor',
                description: 'Edit your resume directly in the platform with live preview and AI assistance.'
              },
              {
                icon: <Shield className="h-12 w-12 text-blue-600" />,
                title: 'Keyword Matching',
                description: 'Identify missing keywords and skills from job descriptions to optimize your resume.'
              },
              {
                icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
                title: 'Skills Gap Analysis',
                description: 'Discover which skills you\'re missing and get recommendations on what to learn.'
              },
              {
                icon: <FileText className="h-12 w-12 text-blue-600" />,
                title: 'Download Options',
                description: 'Download your optimized resume in PDF or DOCX format, ready for job applications.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Upload Resume', description: 'Upload your resume in PDF or DOCX format' },
              { step: '2', title: 'Paste Job Description', description: 'Paste the job description you want to apply for' },
              { step: '3', title: 'Get Analysis', description: 'Receive ATS score and AI-powered suggestions' },
              { step: '4', title: 'Download Optimized Resume', description: 'Edit and download your improved resume' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Optimize Your Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers who have improved their resumes with AI.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

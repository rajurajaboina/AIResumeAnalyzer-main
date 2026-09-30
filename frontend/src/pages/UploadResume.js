import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resumeAPI } from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resumeId, setResumeId] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOCX file');
        setFile(null);
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(droppedFile.type)) {
        setError('Please upload a PDF or DOCX file');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setError('');
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await resumeAPI.upload(file);
      setResumeId(response.data.id);
      setExtractedText(response.data.originalResumeText);
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    navigate('/job-description', { state: { resumeId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Your Resume</h1>
          <p className="text-gray-600 mt-2">Upload your resume in PDF or DOCX format to get started with AI analysis.</p>
        </div>

        {!success ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-8"
          >
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOCX (Max size: 10MB)
              </p>
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </motion.div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? 'Uploading...' : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Resume
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-8"
          >
            <div className="flex items-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resume Uploaded Successfully!</h2>
                <p className="text-gray-600">Your resume has been processed and is ready for analysis.</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Extracted Content Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{extractedText.substring(0, 500)}...</pre>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
            >
              Continue to Job Description
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadResume;

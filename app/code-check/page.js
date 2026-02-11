// file: frontend/app/code-check/page.js
'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { checkCode } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

export default function CodeCheckPage() {
  const [formData, setFormData] = useState({
    code: '',
    language: 'javascript',
    taskDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.code.length < 10) {
      toast.error('Code must be at least 10 characters');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await checkCode(formData);
      setResult(response.data.data);
      toast.success('Code checked successfully!');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to check code. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container-custom py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              💻 Code Quality Checker
            </h1>

            <div className="card mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programming Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="php">PHP</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Description (Optional)
                  </label>
                  <input
                    type="text"
                    name="taskDescription"
                    value={formData.taskDescription}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="What should this code do?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Code
                  </label>
                  <textarea
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="input-field min-h-[300px] font-mono text-sm"
                    placeholder="Paste your code here..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Analyzing Code...' : 'Check Code'}
                </button>
              </form>
            </div>

            {loading && (
              <div className="card">
                <LoadingSpinner size="lg" text="AI is reviewing your code..." />
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                {/* Score */}
                <div className="card">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${
                      result.score >= 80 ? 'text-green-600' :
                      result.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {result.score}/100
                    </div>
                    <p className="text-gray-600">Code Quality Score</p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <FiAlertCircle className="mr-2 text-blue-600" />
                    Overall Assessment
                  </h3>
                  <p className="text-gray-700">{result.explanation}</p>
                </div>

                {/* Errors */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    {result.errors.length > 0 ? (
                      <FiXCircle className="mr-2 text-red-600" />
                    ) : (
                      <FiCheckCircle className="mr-2 text-green-600" />
                    )}
                    Errors
                  </h3>
                  {result.errors.length > 0 ? (
                    <ul className="space-y-2">
                      {result.errors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          <span className="text-gray-700">{error}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600 font-medium">No errors found! 🎉</p>
                  )}
                </div>

                {/* Improvements */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <FiAlertCircle className="mr-2 text-yellow-600" />
                    Suggested Improvements
                  </h3>
                  <ul className="space-y-2">
                    {result.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

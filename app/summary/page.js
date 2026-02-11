// file: frontend/app/summary/page.js
'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { createSummary } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SummaryPage() {
  const [formData, setFormData] = useState({
    title: '',
    lectureText: '',
    subject: '',
  });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.lectureText.length < 100) {
      toast.error('Lecture text must be at least 100 characters');
      return;
    }

    setLoading(true);
    setSummary(null);

    try {
      const response = await createSummary(formData);
      setSummary(response.data.data.lecture);
      toast.success('Summary generated successfully!');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to generate summary. Please try again.';
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
              📝 Lecture Summary Generator
            </h1>

            <div className="card mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecture Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Introduction to Machine Learning"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lecture Content (min 100 characters)
                  </label>
                  <textarea
                    name="lectureText"
                    value={formData.lectureText}
                    onChange={handleChange}
                    className="input-field min-h-[300px]"
                    placeholder="Paste your lecture notes here..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.lectureText.length} characters
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Generating Summary...' : 'Generate Summary'}
                </button>
              </form>
            </div>

            {loading && (
              <div className="card">
                <LoadingSpinner size="lg" text="AI is analyzing your lecture..." />
              </div>
            )}

            {summary && !loading && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {summary.title}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {summary.wordCount} words
                  </span>
                </div>

                <div className="prose max-w-none">
                  <div
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: summary.summary.replace(/\n/g, '<br/>') }}
                  />
                </div>

                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Created: {new Date(summary.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(summary.summary);
                      toast.success('Summary copied to clipboard!');
                    }}
                    className="btn-secondary"
                  >
                    Copy Summary
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

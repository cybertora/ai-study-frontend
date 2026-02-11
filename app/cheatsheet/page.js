// file: frontend/app/cheatsheet/page.js
'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { createCheatSheet } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CheatSheetPage() {
  const [formData, setFormData] = useState({
    text: '',
    maxLength: 500,
    format: 'bullet',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.text.length < 100) {
      toast.error('Text must be at least 100 characters');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await createCheatSheet(formData);
      setResult(response.data.data);
      toast.success('Cheat sheet generated successfully!');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to generate cheat sheet. Please try again.';
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
              📄 Cheat Sheet Generator
            </h1>

            <div className="card mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="bullet">Bullet Points</option>
                    <option value="table">Table Format</option>
                    <option value="compact">Ultra Compact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Length (characters)
                  </label>
                  <input
                    type="number"
                    name="maxLength"
                    value={formData.maxLength}
                    onChange={handleChange}
                    className="input-field"
                    min="100"
                    max="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Text (min 100 characters)
                  </label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleChange}
                    className="input-field min-h-[300px]"
                    placeholder="Paste your study material here..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.text.length} characters
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Generating Cheat Sheet...' : 'Generate Cheat Sheet'}
                </button>
              </form>
            </div>

            {loading && (
              <div className="card">
                <LoadingSpinner size="lg" text="AI is creating your cheat sheet..." />
              </div>
            )}

            {result && !loading && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Your Cheat Sheet
                  </h2>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{result.compressedLength}</span> chars
                    <span className="text-gray-400 mx-2">←</span>
                    <span>{result.originalLength}</span> chars
                    <span className="ml-2 text-green-600 font-medium">
                      ({Math.round((1 - result.compressedLength / result.originalLength) * 100)}% smaller)
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
                  <div
                    className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm"
                    dangerouslySetInnerHTML={{ __html: result.cheatSheet.replace(/\n/g, '<br/>') }}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.cheatSheet);
                      toast.success('Cheat sheet copied to clipboard!');
                    }}
                    className="btn-secondary"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn-primary"
                  >
                    Print
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

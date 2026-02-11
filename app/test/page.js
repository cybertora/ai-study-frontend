// file: frontend/app/test/page.js
'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateTest } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TestPage() {
  const [formData, setFormData] = useState({
    topic: '',
    numQuestions: 10,
    difficulty: 'medium',
    timeLimit: 30,
  });
  const [loading, setLoading] = useState(false);
  const [test, setTest] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTest(null);

    try {
      const response = await generateTest(formData);
      setTest(response.data.data.test);
      toast.success('Test generated successfully!');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to generate test. Please try again.';
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
              ✅ Test Generator
            </h1>

            <div className="card mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Object-Oriented Programming"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      name="numQuestions"
                      value={formData.numQuestions}
                      onChange={handleChange}
                      className="input-field"
                      min="3"
                      max="50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (min)
                    </label>
                    <input
                      type="number"
                      name="timeLimit"
                      value={formData.timeLimit}
                      onChange={handleChange}
                      className="input-field"
                      min="5"
                      max="180"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Generating Test...' : 'Generate Test'}
                </button>
              </form>
            </div>

            {loading && (
              <div className="card">
                <LoadingSpinner size="lg" text="AI is creating your test..." />
              </div>
            )}

            {test && !loading && (
              <div className="card">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {test.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Difficulty: <strong className="capitalize">{test.difficulty}</strong></span>
                    <span>•</span>
                    <span>Questions: <strong>{test.questions.length}</strong></span>
                    <span>•</span>
                    <span>Time: <strong>{test.timeLimit} min</strong></span>
                  </div>
                </div>

                <div className="space-y-6">
                  {test.questions.map((q, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                      <p className="font-semibold text-gray-800 mb-3">
                        {index + 1}. {q.question}
                      </p>
                      <div className="space-y-2 ml-4">
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded ${
                              option === q.correctAnswer
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
                          <strong className="text-blue-700">Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// file: frontend/app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FiBookOpen, FiCheckCircle, FiCode, FiFileText, FiClock, FiTrendingUp } from 'react-icons/fi';
import { getLectures, getTests, getExams } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    lectures: 0,
    tests: 0,
    exams: 0,
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch stats
    Promise.all([
      getLectures({ limit: 1 }),
      getTests({ limit: 1 }),
      getExams({ limit: 1 }),
    ])
      .then(([lecturesRes, testsRes, examsRes]) => {
        setStats({
          lectures: lecturesRes.data.data.total || 0,
          tests: testsRes.data.data.total || 0,
          exams: examsRes.data.data.total || 0,
        });
      })
      .catch((error) => {
        console.error('Failed to fetch stats:', error);
      });
  }, []);

  const features = [
    {
      icon: <FiBookOpen className="text-3xl" />,
      title: 'Lecture Summary',
      description: 'Convert lectures to structured notes',
      href: '/summary',
      color: 'bg-blue-500',
    },
    {
      icon: <FiCheckCircle className="text-3xl" />,
      title: 'Generate Test',
      description: 'Create practice tests instantly',
      href: '/test',
      color: 'bg-green-500',
    },
    {
      icon: <FiCode className="text-3xl" />,
      title: 'Code Check',
      description: 'Review and improve your code',
      href: '/code-check',
      color: 'bg-purple-500',
    },
    {
      icon: <FiFileText className="text-3xl" />,
      title: 'Cheat Sheet',
      description: 'Create study guides',
      href: '/cheatsheet',
      color: 'bg-orange-500',
    },
    {
      icon: <FiClock className="text-3xl" />,
      title: 'Live Exam',
      description: 'Practice with real-time feedback',
      href: '/exam',
      color: 'bg-red-500',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container-custom py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.firstName || user?.email || 'Student'}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to boost your academic performance today?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Lectures Summarized</p>
                  <p className="text-4xl font-bold mt-2">{stats.lectures}</p>
                </div>
                <FiBookOpen className="text-5xl text-blue-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Tests Generated</p>
                  <p className="text-4xl font-bold mt-2">{stats.tests}</p>
                </div>
                <FiCheckCircle className="text-5xl text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Exams Completed</p>
                  <p className="text-4xl font-bold mt-2">{stats.exams}</p>
                </div>
                <FiTrendingUp className="text-5xl text-purple-200" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Link key={index} href={feature.href}>
                  <div className="card hover:shadow-xl transition duration-300 cursor-pointer h-full">
                    <div className={`${feature.color} text-white w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

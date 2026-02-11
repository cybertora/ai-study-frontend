// file: frontend/app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBookOpen, FiCheckCircle, FiCode, FiFileText, FiClock } from 'react-icons/fi';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const features = [
    {
      icon: <FiBookOpen className="text-4xl text-primary-600" />,
      title: 'Smart Summaries',
      description: 'Transform long lectures into concise, structured notes',
    },
    {
      icon: <FiCheckCircle className="text-4xl text-green-600" />,
      title: 'Test Generation',
      description: 'Generate practice tests on any topic instantly',
    },
    {
      icon: <FiCode className="text-4xl text-purple-600" />,
      title: 'Code Review',
      description: 'Get instant feedback on your code quality',
    },
    {
      icon: <FiFileText className="text-4xl text-orange-600" />,
      title: 'Cheat Sheets',
      description: 'Create compact study guides from any text',
    },
    {
      icon: <FiClock className="text-4xl text-red-600" />,
      title: 'Live Exams',
      description: 'Practice with real-time AI feedback',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container-custom py-20">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            🎓 AI Study Assistant
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your intelligent companion for academic success at AITU
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
              Get Started
            </Link>
            <Link href="/login" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Powerful Features for Students
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-xl transition duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container-custom text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to boost your academic performance?
          </h2>
          <Link href="/register" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}

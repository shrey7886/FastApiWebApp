'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen, Target, TrendingUp, Sparkles, Users, Clock, Award } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Questions",
      description: "Dynamic quiz generation using advanced AI models"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Personalized Learning",
      description: "Adaptive difficulty and topic-based quizzes"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Detailed analytics and performance insights"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Timed Challenges",
      description: "Real-time quiz sessions with countdown timers"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Achievement System",
      description: "Track your learning milestones and improvements"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Smart Assistant",
      description: "AI chatbot to help with questions and study tips"
    }
  ];

  const stats = [
    { label: "Topics Available", value: "50+" },
    { label: "Questions Generated", value: "1000+" },
    { label: "Active Learners", value: "10K+" },
    { label: "Success Rate", value: "95%" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Quizlet</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Learn • Practice • Excel</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/signup')}
            >
              Sign Up
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
                          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Master Any Topic with Quizlet
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Experience the future of learning with our AI-powered quiz platform. 
                Generate personalized questions, track your progress, and excel in any subject.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => router.push('/topics')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push('/signup')}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try for Free
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Quizlet?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with proven learning methodologies 
              to create an unparalleled educational experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of learners who are already mastering new topics with AI assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => router.push('/topics')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Topics
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => router.push('/signup')}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 dark:bg-gray-900 text-gray-300 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">Quizlet</h3>
                <p className="text-sm text-gray-400">AI-Powered Learning Platform</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Quizlet. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
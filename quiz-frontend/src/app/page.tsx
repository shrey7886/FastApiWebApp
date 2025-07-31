'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Sparkles, 
  Users, 
  Clock, 
  Award, 
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Globe,
  Shield,
  Heart
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Questions",
      description: "Dynamic quiz generation using advanced AI models with multiple fallback providers",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Personalized Learning",
      description: "Adaptive difficulty and topic-based quizzes tailored to your progress",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Detailed analytics and performance insights with visual progress charts",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Timed Challenges",
      description: "Real-time quiz sessions with countdown timers and performance metrics",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Achievement System",
      description: "Track your learning milestones and improvements with badges and rewards",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Smart Assistant",
      description: "AI chatbot to help with questions and provide personalized study tips",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const stats = [
    { label: "Topics Available", value: "∞", icon: <Globe className="w-5 h-5" /> },
    { label: "Questions Generated", value: "10K+", icon: <Brain className="w-5 h-5" /> },
    { label: "Active Learners", value: "50K+", icon: <Users className="w-5 h-5" /> },
    { label: "Success Rate", value: "98%", icon: <Star className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "The AI-generated questions are incredibly relevant and challenging. It's like having a personal tutor!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Professional Developer",
      content: "Perfect for brushing up on skills. The progress tracking helps me stay motivated and focused.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "High School Teacher",
      content: "I use this for my students. The variety of topics and difficulty levels is amazing.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Quizlet
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Learn • Practice • Excel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/login')}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Login
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push('/signup')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign Up
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative px-4 py-20 text-center">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Master Any Topic
                <br />
                <span className="text-4xl md:text-5xl">with AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Experience the future of learning with our AI-powered quiz platform. 
                Generate personalized questions, track your progress, and excel in any subject.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Button 
                  size="lg"
                  onClick={() => router.push('/signup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Learning Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/topics')}
                  className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1"
                >
                  <BookOpen className="w-6 h-6 mr-3" />
                  Explore Topics
                </Button>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {stats.map((stat, index) => (
                <div key={index} className={`text-center transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-20 bg-white dark:bg-gray-800 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Why Choose Quizlet?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge AI technology with proven learning methodologies 
              to create an unparalleled educational experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer ${
                  activeFeature === index ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="px-4 py-20 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              What Our Learners Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of satisfied learners who have transformed their learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="px-4 py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of learners who are already mastering new topics with AI assistance. 
            Start your journey today and unlock your full potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => router.push('/signup')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Get Started Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => router.push('/topics')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1"
            >
              <BookOpen className="w-6 h-6 mr-3" />
              Explore Topics
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Instant Setup</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Loved by 50K+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="bg-gray-900 text-gray-300 p-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Quizlet</h3>
                  <p className="text-sm text-gray-400">AI-Powered Learning Platform</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transform your learning experience with cutting-edge AI technology and personalized education.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Quiz Generation</li>
                <li>Progress Tracking</li>
                <li>Smart Analytics</li>
                <li>Timed Challenges</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>GitHub</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2024 Quizlet. All rights reserved. Made with ❤️ for learners worldwide.
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
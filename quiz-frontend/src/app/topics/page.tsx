'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Brain, Search, BookOpen, Clock, Target, TrendingUp, Sparkles, Plus, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

// Ensure dynamic rendering
export const dynamic = 'force-dynamic';

interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  estimatedTime: number;
  category: string;
  popularity: number;
}

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [showCustomTopic, setShowCustomTopic] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [customQuestionCount, setCustomQuestionCount] = useState(10);

  const filterTopics = useCallback(() => {
    let filtered = topics;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(topic => topic.difficulty === selectedDifficulty);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(topic => topic.category === selectedCategory);
    }

    setFilteredTopics(filtered);
  }, [topics, searchTerm, selectedDifficulty, selectedCategory]);

  useEffect(() => {
    console.log('🎯 Topics page loaded');
    fetchTopics();
  }, []);

  useEffect(() => {
    filterTopics();
  }, [filterTopics]);

  const fetchTopics = async () => {
    try {
      // For demo, create mock topics
      const mockTopics: Topic[] = [
        {
          id: '1',
          name: 'JavaScript Fundamentals',
          description: 'Core concepts of JavaScript programming language',
          difficulty: 'easy',
          questionCount: 10,
          estimatedTime: 15,
          category: 'Programming',
          popularity: 95
        },
        {
          id: '2',
          name: 'React Development',
          description: 'Modern React with hooks and functional components',
          difficulty: 'medium',
          questionCount: 15,
          estimatedTime: 20,
          category: 'Programming',
          popularity: 88
        },
        {
          id: '3',
          name: 'Python Programming',
          description: 'Python basics and advanced concepts',
          difficulty: 'easy',
          questionCount: 12,
          estimatedTime: 18,
          category: 'Programming',
          popularity: 92
        },
        {
          id: '4',
          name: 'Data Structures & Algorithms',
          description: 'Essential computer science concepts',
          difficulty: 'hard',
          questionCount: 20,
          estimatedTime: 30,
          category: 'Computer Science',
          popularity: 85
        },
        {
          id: '5',
          name: 'Web Development',
          description: 'HTML, CSS, and modern web technologies',
          difficulty: 'medium',
          questionCount: 15,
          estimatedTime: 25,
          category: 'Web Development',
          popularity: 90
        },
        {
          id: '6',
          name: 'Machine Learning Basics',
          description: 'Introduction to ML concepts and algorithms',
          difficulty: 'hard',
          questionCount: 18,
          estimatedTime: 35,
          category: 'AI & ML',
          popularity: 78
        },
        {
          id: '7',
          name: 'Database Design',
          description: 'SQL, NoSQL, and database principles',
          difficulty: 'medium',
          questionCount: 12,
          estimatedTime: 20,
          category: 'Database',
          popularity: 82
        },
        {
          id: '8',
          name: 'DevOps Practices',
          description: 'CI/CD, containers, and deployment strategies',
          difficulty: 'medium',
          questionCount: 14,
          estimatedTime: 22,
          category: 'DevOps',
          popularity: 75
        }
      ];

      setTopics(mockTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async (topic: Topic) => {
    setIsGenerating(topic.id);
    
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topic: topic.name,
          difficulty: topic.difficulty,
          num_questions: topic.questionCount
        })
      });

      if (response.ok) {
        const quizData = await response.json();
        router.push(`/take-quiz/${quizData.id}`);
      } else {
        console.error('Failed to generate quiz');
        // For demo, redirect to a mock quiz
        router.push(`/take-quiz/mock-${topic.id}`);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      // For demo, redirect to a mock quiz
      router.push(`/take-quiz/mock-${topic.id}`);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateCustomQuiz = async () => {
    if (!customTopic.trim()) return;
    
    setIsGenerating('custom');
    
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topic: customTopic.trim(),
          difficulty: customDifficulty,
          num_questions: customQuestionCount
        })
      });

      if (response.ok) {
        const quizData = await response.json();
        router.push(`/take-quiz/${quizData.id}`);
      } else {
        console.error('Failed to generate custom quiz');
        // For demo, redirect to a mock quiz
        router.push(`/take-quiz/mock-custom`);
      }
    } catch (error) {
      console.error('Error generating custom quiz:', error);
      // For demo, redirect to a mock quiz
      router.push(`/take-quiz/mock-custom`);
    } finally {
      setIsGenerating(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const categories = Array.from(new Set(topics.map(topic => topic.category)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => router.push('/dashboard')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Choose Your Topic</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select from popular topics or create your own custom quiz on any subject
          </p>
        </div>

        {/* Custom Topic Section */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Create Custom Quiz
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400">Generate questions on any topic you want to learn</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomTopic(!showCustomTopic)}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {showCustomTopic ? 'Hide' : 'Show'} Custom Topic
              </Button>
            </div>
          </CardHeader>
          {showCustomTopic && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic Name *
                  </label>
                  <Input
                    placeholder="e.g., Ancient Egyptian History, Quantum Physics, Cooking Techniques..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Be specific! The more detailed your topic, the better the questions will be.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={customDifficulty}
                      onChange={(e) => setCustomDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="easy">Easy - Basic concepts</option>
                      <option value="medium">Medium - Intermediate level</option>
                      <option value="hard">Hard - Advanced concepts</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={customQuestionCount}
                      onChange={(e) => setCustomQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={5}>5 Questions (Quick Quiz)</option>
                      <option value={10}>10 Questions (Standard)</option>
                      <option value={15}>15 Questions (Comprehensive)</option>
                      <option value={20}>20 Questions (Deep Dive)</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateCustomQuiz}
                  disabled={!customTopic.trim() || isGenerating === 'custom'}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  {isGenerating === 'custom' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Custom Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Custom Quiz
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Popular Topics</h3>
            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700">
              {filteredTopics.length} topics
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{topic.name}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {topic.description}
                      </p>
                    </div>
                    <Badge className={`${getDifficultyColor(topic.difficulty)}`}>
                      {getDifficultyIcon(topic.difficulty)} {topic.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Topic Stats */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="font-medium">{topic.questionCount}</div>
                        <div className="text-gray-500 dark:text-gray-400">Questions</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="font-medium">{topic.estimatedTime}m</div>
                        <div className="text-gray-500 dark:text-gray-400">Time</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="font-medium">{topic.popularity}%</div>
                        <div className="text-gray-500 dark:text-gray-400">Popular</div>
                      </div>
                    </div>

                    {/* Generate Quiz Button */}
                    <Button
                      onClick={() => handleGenerateQuiz(topic)}
                      disabled={isGenerating === topic.id}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isGenerating === topic.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No topics found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters to find more topics.
            </p>
            <Button
              onClick={() => setShowCustomTopic(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Topic
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 
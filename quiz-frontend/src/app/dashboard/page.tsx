'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Brain, 
  TrendingUp, 
  History, 
  BookOpen, 
  Target, 
  Zap, 
  Trophy,
  Clock,
  BarChart3,
  Award,
  Star,
  ArrowRight,
  Play,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useUser } from '@/components/UserContext';

interface PerformanceData {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
}

interface QuizAttempt {
  id: string;
  score: number;
  totalQuestions: number;
  completedOn: string;
  percentage: number;
}

interface QuestionReview {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [performance, setPerformance] = useState<PerformanceData>({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0
  });
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [questions, setQuestions] = useState<QuestionReview[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch performance data
      const performanceResponse = await fetch('/api/analytics/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformance({
          totalAttempts: performanceData.total_quizzes || 0,
          averageScore: performanceData.average_score || 0,
          bestScore: performanceData.best_score || 0
        });
      }

      // Fetch quiz history
      const historyResponse = await fetch('/api/quiz-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        const formattedAttempts = historyData.history?.map((quiz: any) => ({
          id: quiz.quiz_id,
          score: quiz.score,
          totalQuestions: quiz.total_questions,
          completedOn: new Date(quiz.completed_at).toLocaleDateString(),
          percentage: Math.round((quiz.score / quiz.total_questions) * 100)
        })) || [];
        setAttempts(formattedAttempts);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = `I'm here to help you with your learning journey! You can ask me about quiz topics, study strategies, or any questions you have.`;
      setChatHistory(prev => [...prev, { type: 'ai', message: aiResponse }]);
    }, 1000);
  };

  const relatedTopics = ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Trigonometry'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.first_name || 'Learner'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/create-quiz')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Start New Quiz
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Quizzes</p>
                  <p className="text-3xl font-bold">{performance.totalAttempts}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Average Score</p>
                  <p className="text-3xl font-bold">{performance.averageScore}%</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Best Score</p>
                  <p className="text-3xl font-bold">{performance.bestScore}%</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Study Streak</p>
                  <p className="text-3xl font-bold">7 days</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Quiz Attempts */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <History className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/question-history')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {attempts.length > 0 ? (
                  <div className="space-y-4">
                    {attempts.slice(0, 5).map((attempt, index) => (
                      <div key={attempt.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Quiz #{attempt.id}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{attempt.completedOn}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">{attempt.score}/{attempt.totalQuestions}</p>
                          <Badge className={`mt-1 ${
                            attempt.percentage >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            attempt.percentage >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {attempt.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No quiz attempts yet. Start your first quiz!</p>
                    <Button
                      onClick={() => router.push('/create-quiz')}
                      className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      Create Your First Quiz
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push('/create-quiz')}
                    className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center">
                      <Play className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-semibold">New Quiz</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => router.push('/question-history')}
                    className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center">
                      <History className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-semibold">View History</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => router.push('/analytics')}
                    className="h-20 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-semibold">Analytics</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => router.push('/topics')}
                    className="h-20 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center">
                      <BookOpen className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-semibold">Topics</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Assistant & Stats */}
          <div className="space-y-6">
            {/* AI Learning Assistant */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  AI Learning Assistant
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Ask me anything about your studies!
                </p>
              </CardHeader>
              <CardContent>
                {/* Chat History */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Start a conversation to get help with your learning!
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((chat, index) => (
                      <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-xl ${
                          chat.type === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200'
                        }`}>
                          {chat.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask about your studies..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendChatMessage}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-medium">Study Streak</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    7 days
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-medium">Accuracy</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {performance.averageScore}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="font-medium">Best Score</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {performance.bestScore}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Brain,
  Loader2,
  AlertCircle,
  Play,
  History,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic';

interface PerformanceData {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  totalQuizzes: number;
  recentActivity: any[];
}

interface QuizAttempt {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  completedOn: string;
  percentage: number;
  duration: number;
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
    bestScore: 0,
    totalQuizzes: 0,
    recentActivity: []
  });
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [questions, setQuestions] = useState<QuestionReview[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([
    { role: 'assistant', content: 'Hello! I\'m your AI learning assistant. How can I help you improve your quiz performance today?', timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
          bestScore: performanceData.best_score || 0,
          totalQuizzes: performanceData.total_quizzes || 0,
          recentActivity: performanceData.recent_activity || []
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
        if (historyData.success && historyData.history) {
          const formattedAttempts = historyData.history.map((quiz: any) => ({
            id: quiz.quiz_id || quiz.id,
            title: quiz.title || `${quiz.topic} Quiz`,
            topic: quiz.topic || 'General',
            difficulty: quiz.difficulty || 'medium',
            score: quiz.score || 0,
            totalQuestions: quiz.total_questions || 5,
            completedOn: new Date(quiz.completed_at || quiz.created_at).toLocaleDateString(),
            percentage: Math.round(((quiz.score || 0) / (quiz.total_questions || 5)) * 100),
            duration: quiz.duration || 10
          }));
          setAttempts(formattedAttempts);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async (message: string) => {
    if (!message.trim() || isChatLoading) return;
    
    setIsChatLoading(true);
    const userMessage: { role: 'user' | 'assistant'; content: string; timestamp: Date } = { 
      role: 'user', 
      content: message, 
      timestamp: new Date() 
    };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      // Smart LLM-like responses based on user input and performance data
      const responses = [
        `Based on your current performance (${performance.averageScore}% average), I recommend focusing on ${message.toLowerCase().includes('improve') ? 'practice questions in areas where you scored lower. Review the explanations thoroughly and consider retaking quizzes on challenging topics.' : 'building a strong foundation in core concepts before moving to advanced topics.'}`,
        `Looking at your ${performance.totalAttempts} quiz attempts, you're making steady progress. For ${message.toLowerCase().includes('math') ? 'mathematics' : message.toLowerCase().includes('science') ? 'science' : 'this subject'}, try breaking down complex problems into smaller steps and practice regularly.`,
        `Your best score of ${performance.bestScore}% shows you can excel! To maintain this level, ${message.toLowerCase().includes('consistency') ? 'establish a regular study routine and review previous quiz explanations to reinforce learning.' : 'focus on understanding the underlying concepts rather than memorizing answers.'}`,
        `From analyzing your quiz history, I notice you perform well in ${performance.averageScore > 70 ? 'most areas' : 'some areas'}. To improve further, ${message.toLowerCase().includes('strategy') ? 'try creating quizzes on related topics to build comprehensive understanding.' : 'review questions you answered incorrectly and understand the reasoning behind correct answers.'}`,
        `Based on your learning patterns, here's my recommendation: ${message.toLowerCase().includes('help') ? 'Use the detailed explanations after each quiz as study guides. Focus on topics where your scores are lower and practice with different difficulty levels.' : 'You\'re on the right track! Consider exploring topics outside your comfort zone to expand your knowledge base.'}`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      const aiMessage: { role: 'user' | 'assistant'; content: string; timestamp: Date } = { 
        role: 'assistant', 
        content: randomResponse, 
        timestamp: new Date() 
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: { role: 'user' | 'assistant'; content: string; timestamp: Date } = { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.', 
        timestamp: new Date() 
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quizlet</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Learn • Practice • Excel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => router.push('/history')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email || 'user@example.com'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                className="ml-auto"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Master Any Topic with AI-Powered Quizzes
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Generate personalized quizzes on any subject, track your progress, and learn with our intelligent AI assistant. From basic concepts to advanced topics - we've got you covered.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={() => router.push('/create-quiz')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Create Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/history')}
                  className="px-8 py-3 rounded-lg"
                >
                  <History className="w-5 h-5 mr-2" />
                  View History
                </Button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Quizzes Created</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{performance.totalQuizzes}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Quiz Attempts</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">{performance.totalAttempts}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Average Score</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{performance.averageScore}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Quizzes */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Quizzes</h2>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/history')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {attempts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attempts.slice(0, 6).map((attempt) => (
                    <Card key={attempt.id} className="hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {attempt.title}
                            </CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {attempt.topic}
                            </p>
                          </div>
                          <Badge className={`ml-2 ${getDifficultyColor(attempt.difficulty)}`}>
                            {attempt.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {attempt.totalQuestions} questions
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            ~{attempt.duration} min
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Last attempt: {attempt.completedOn}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {attempt.percentage}%
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => router.push(`/take-quiz/${attempt.id}`)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start Quiz
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/results/${attempt.id}`)}
                          >
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No quiz attempts yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Start your learning journey by creating your first quiz
                    </p>
                    <Button
                      onClick={() => router.push('/create-quiz')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Create Your First Quiz
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - AI Assistant */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">AI Learning Assistant</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get personalized learning advice
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chat History */}
                <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-thin">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="mt-4 flex space-x-2">
                  <Input
                    placeholder="Ask about your performance..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage(chatMessage)}
                    className="flex-1"
                    disabled={isChatLoading}
                  />
                  <Button 
                    onClick={() => sendChatMessage(chatMessage)}
                    disabled={isChatLoading || !chatMessage.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
                  >
                    {isChatLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
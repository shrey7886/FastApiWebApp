'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Send, Brain, TrendingUp, History, BookOpen, Target, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

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
        const formattedAttempts = historyData.map((quiz: any) => ({
          id: quiz.id,
          score: quiz.score,
          totalQuestions: quiz.total_questions,
          completedOn: new Date(quiz.completed_at).toLocaleDateString(),
          percentage: Math.round((quiz.score / quiz.total_questions) * 100)
        }));
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

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            performance: performance,
            recent_attempts: attempts.slice(0, 3)
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { type: 'ai', message: data.answer }]);
      } else {
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          message: "I'm having trouble processing your request right now. Please try asking about quiz topics, study tips, or how to use the platform." 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: "I'm having trouble connecting right now. Please try again later." 
      }]);
    }
  };

  const relatedTopics = [
    'Advanced Concepts',
    'Practical Applications', 
    'Common Mistakes',
    'Best Practices',
    'Real-world Examples',
    'Related Technologies'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-800 rounded"></div>
            <div className="h-24 bg-gray-800 rounded"></div>
            <div className="h-24 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
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
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => router.push('/topics')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Topics
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Performance Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Performance Overview</h2>
            </div>
            <Button
              onClick={() => router.push('/question-history')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Question History
            </Button>
          </div>
                  <div className="grid grid-cols-3 gap-4">
          <Card className="bg-blue-500 dark:bg-blue-600 border-blue-400 dark:border-blue-500">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{performance.totalAttempts}</div>
              <div className="text-sm text-blue-100 dark:text-blue-200">Total Attempts</div>
            </CardContent>
          </Card>
          <Card className="bg-green-500 dark:bg-green-600 border-green-400 dark:border-green-500">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{performance.averageScore}%</div>
              <div className="text-sm text-green-100 dark:text-green-200">Average Score</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500 dark:bg-purple-600 border-purple-400 dark:border-purple-500">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{performance.bestScore}%</div>
              <div className="text-sm text-purple-100 dark:text-purple-200">Best Score</div>
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="questions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Questions Review
            </TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Related Topics
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Attempt History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Question Breakdown</CardTitle>
                <p className="text-gray-500 dark:text-gray-400">Review all questions from this quiz</p>
              </CardHeader>
              <CardContent>
                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium mb-2">{question.question}</p>
                        <div className="space-y-2">
                          <div className={`p-2 rounded ${question.isCorrect ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}`}>
                            <span className="font-medium text-white">Your Answer:</span> <span className="text-white">{question.userAnswer}</span>
                            {question.isCorrect ? ' ✓' : ' ✗'}
                          </div>
                          {!question.isCorrect && (
                            <div className="p-2 rounded bg-green-500 dark:bg-green-600">
                              <span className="font-medium text-white">Correct Answer:</span> <span className="text-white">{question.correctAnswer}</span>
                            </div>
                          )}
                          <div className="p-2 rounded bg-blue-500 dark:bg-blue-600">
                            <span className="font-medium text-white">Explanation:</span> <span className="text-white">{question.explanation}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No questions to review yet. Take a quiz to see your breakdown!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="mt-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Related Topics</CardTitle>
                <p className="text-gray-500 dark:text-gray-400">Explore topics related to Mathematics</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {relatedTopics.map((topic) => (
                    <Button key={topic} variant="outline" className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                      {topic}
                    </Button>
                  ))}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Advanced Concepts</h3>
                  <p className="text-gray-600 dark:text-gray-300">Advanced mathematics builds upon fundamental principles and extends into complex problem-solving techniques that require deep understanding and practice.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Attempt History</CardTitle>
                <p className="text-gray-500 dark:text-gray-400">Review all your past attempts for this quiz</p>
              </CardHeader>
              <CardContent>
                {attempts.length > 0 ? (
                  <div className="space-y-3">
                    {attempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">Score: {attempt.score} / {attempt.totalQuestions}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Completed on: {attempt.completedOn}</div>
                        </div>
                        <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          {attempt.percentage}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No quiz attempts yet. Start your learning journey!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Learning Assistant */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <CardTitle>AI Learning Assistant</CardTitle>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Hello! I&apos;m here to help you learn and understand topics better.</p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium">AI Learning Assistant</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Hello! I&apos;m here to help you learn and understand topics better.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask me anything about the quiz or related topics!
              </p>
            </div>

            {/* Chat History */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg ${
                    chat.type === 'user' 
                      ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {chat.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about Mathematics..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Button onClick={sendChatMessage} className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
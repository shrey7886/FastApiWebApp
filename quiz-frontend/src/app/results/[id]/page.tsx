'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, CheckCircle, XCircle, TrendingUp, Clock, Target } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface QuestionResult {
  id: number;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuizResult {
  id: string;
  quiz_title: string;
  subject: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken: number;
  completed_at: string;
  questions: QuestionResult[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;
  
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/results/${resultId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const resultData = await response.json();
        setResult(resultData);
      } else {
        console.error('Failed to fetch result');
      }
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! You\'re on the right track!';
    if (percentage >= 70) return 'Good work! Keep practicing to improve!';
    if (percentage >= 60) return 'Not bad! Focus on weak areas.';
    return 'Keep practicing! Review the fundamentals.';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-800 rounded mb-4"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Result Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
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
              <h1 className="text-xl font-bold">Quiziac</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Learn • Practice • Excel</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quiz Info */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">{result.quiz_title}</CardTitle>
            <p className="text-gray-500 dark:text-gray-400">{result.subject}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getPerformanceColor(result.percentage)}`}>
                  {result.percentage}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">
                  {result.score}/{result.total_questions}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">{getPerformanceMessage(result.percentage)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-blue-500 dark:bg-blue-600 border-blue-400 dark:border-blue-500">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 mr-2 text-white" />
              </div>
              <div className="text-xl font-bold text-white">{result.score}</div>
              <div className="text-sm text-blue-100 dark:text-blue-200">Correct</div>
            </CardContent>
          </Card>
          <Card className="bg-red-500 dark:bg-red-600 border-red-400 dark:border-red-500">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-5 h-5 mr-2 text-white" />
              </div>
              <div className="text-xl font-bold text-white">{result.total_questions - result.score}</div>
              <div className="text-sm text-red-100 dark:text-red-200">Incorrect</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500 dark:bg-purple-600 border-purple-400 dark:border-purple-500">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 mr-2 text-white" />
              </div>
              <div className="text-xl font-bold text-white">{formatTime(result.time_taken)}</div>
              <div className="text-sm text-purple-100 dark:text-purple-200">Time Taken</div>
            </CardContent>
          </Card>
        </div>

        {/* Question Breakdown */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
            <p className="text-gray-500 dark:text-gray-400">Review all questions from this quiz</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.questions.map((question, index) => (
                <div key={question.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    <Badge 
                      variant="secondary" 
                      className={question.is_correct ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}
                    >
                      {question.is_correct ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{question.question_text}</p>
                  
                  <div className="space-y-2 mb-4">
                    {[
                      { key: 'A', value: question.option_a },
                      { key: 'B', value: question.option_b },
                      { key: 'C', value: question.option_c },
                      { key: 'D', value: question.option_d }
                    ].map((option) => (
                      <div
                        key={option.key}
                        className={`p-3 rounded-lg border-2 ${
                          option.key === question.correct_answer
                            ? 'border-green-500 bg-green-500 dark:bg-green-600'
                            : option.key === question.user_answer && !question.is_correct
                            ? 'border-red-500 bg-red-500 dark:bg-red-600'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{option.key})</span>
                          <span className={option.key === question.correct_answer || (option.key === question.user_answer && !question.is_correct) ? 'text-white' : ''}>{option.value}</span>
                          {option.key === question.correct_answer && (
                            <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                          )}
                          {option.key === question.user_answer && !question.is_correct && (
                            <XCircle className="w-4 h-4 text-red-400 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-lg">
                      <h4 className="font-medium mb-2 text-white">Explanation:</h4>
                      <p className="text-sm text-white">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => router.push('/create-quiz')}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700"
          >
            Create New Quiz
          </Button>
        </div>
      </div>
    </div>
  );
} 
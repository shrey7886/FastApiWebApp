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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Quiziac
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learn • Practice • Excel</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Quiz Info Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{result.quiz_title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{result.subject}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
              <div className={`text-5xl font-bold ${getPerformanceColor(result.percentage)} mb-2`}>
                {result.percentage}%
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Overall Score</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
              <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                {result.score}/{result.total_questions}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Correct Answers</div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">{getPerformanceMessage(result.percentage)}</p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{result.score}</div>
              <div className="text-blue-100 font-medium">Correct</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{result.total_questions - result.score}</div>
              <div className="text-red-100 font-medium">Incorrect</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{formatTime(result.time_taken)}</div>
              <div className="text-purple-100 font-medium">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Question Breakdown</h3>
            <p className="text-gray-600 dark:text-gray-400">Review all questions from this quiz</p>
          </div>
          
          <div className="space-y-6">
            {result.questions.map((question, index) => (
              <div key={question.id} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      question.is_correct 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-red-500 to-pink-600'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Question {index + 1}</h4>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`px-3 py-1 rounded-full font-medium ${
                      question.is_correct 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {question.is_correct ? '✓ Correct' : '✗ Incorrect'}
                  </Badge>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">{question.question_text}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {[
                    { key: 'A', value: question.option_a },
                    { key: 'B', value: question.option_b },
                    { key: 'C', value: question.option_c },
                    { key: 'D', value: question.option_d }
                  ].map((option) => (
                    <div
                      key={option.key}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        option.key === question.correct_answer
                          ? 'border-green-500 bg-green-500 dark:bg-green-600 text-white shadow-lg'
                          : option.key === question.user_answer && !question.is_correct
                          ? 'border-red-500 bg-red-500 dark:bg-red-600 text-white shadow-lg'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg">{option.key})</span>
                        <span className="flex-1">{option.value}</span>
                        {option.key === question.correct_answer && (
                          <CheckCircle className="w-5 h-5 text-green-300 ml-auto" />
                        )}
                        {option.key === question.user_answer && !question.is_correct && (
                          <XCircle className="w-5 h-5 text-red-300 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* User Answer vs Correct Answer Summary */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Answer</h5>
                      <div className={`inline-flex items-center px-3 py-2 rounded-lg font-medium ${
                        question.is_correct 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {question.user_answer}
                        {question.is_correct ? (
                          <CheckCircle className="w-4 h-4 ml-2" />
                        ) : (
                          <XCircle className="w-4 h-4 ml-2" />
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Correct Answer</h5>
                      <div className="inline-flex items-center px-3 py-2 rounded-lg font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        {question.correct_answer}
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {question.explanation && (
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                    <h5 className="font-semibold mb-3 text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Explanation
                    </h5>
                    <p className="text-blue-100 leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => router.push('/create-quiz')}
            className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Quiz
          </Button>
        </div>
      </div>
    </div>
  );
} 
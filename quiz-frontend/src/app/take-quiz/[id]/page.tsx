'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, ArrowLeft, ArrowRight, X, CheckCircle, XCircle, Eye, EyeOff, Flag, Check, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  time_limit: number;
  questions: Question[];
}

export default function TakeQuiz() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, timeRemaining]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);
        setTimeRemaining(quizData.time_limit * 60); // Convert to seconds
      } else {
        console.error('Failed to fetch quiz');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
    
    // Mark question as answered
    setAnsweredQuestions(prev => new Set(Array.from(prev).concat([currentQuestionIndex])));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(false);
  };

  const toggleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quiz_id: quizId,
          answers: answers,
          time_taken: (quiz?.time_limit || 0) * 60 - timeRemaining
        })
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/results/${result.id}`);
      } else {
        console.error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getTimeProgressPercentage = () => {
    if (!quiz) return 0;
    const totalTime = quiz.time_limit * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const getAnsweredPercentage = () => {
    if (!quiz) return 0;
    return (answeredQuestions.size / quiz.questions.length) * 100;
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer;
  const isFlagged = flaggedQuestions.has(currentQuestionIndex);
  const isAnswered = answeredQuestions.has(currentQuestionIndex);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
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
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowQuestionReview(!showQuestionReview)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {showQuestionReview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              Review
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quiz Info */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <p className="text-gray-500 dark:text-gray-400">{quiz.subject}</p>
              </div>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700">
                {currentQuestionIndex + 1} / {quiz.questions.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Time Limit:</span>
                <span className="font-medium">30:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Remaining:</span>
                <span className={`font-medium ${timeRemaining < 300 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Time Progress</span>
                  <span>{getTimeProgressPercentage().toFixed(0)}%</span>
                </div>
                <Progress value={getTimeProgressPercentage()} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Questions Answered</span>
                  <span>{answeredQuestions.size}/{quiz.questions.length}</span>
                </div>
                <Progress value={getAnsweredPercentage()} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review Panel */}
        {showQuestionReview && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Question Review</CardTitle>
              <p className="text-gray-500 dark:text-gray-400">Click on any question to jump to it</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleJumpToQuestion(index)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : answeredQuestions.has(index)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : flaggedQuestions.has(index)
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{index + 1}</span>
                      {flaggedQuestions.has(index) && <Flag className="w-3 h-3" />}
                      {answeredQuestions.has(index) && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        {currentQuestion && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium mb-4">{currentQuestion.question_text}</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFlagQuestion}
                    className={`ml-4 ${isFlagged ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'}`}
                  >
                    <Flag className={`w-4 h-4 ${isFlagged ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { key: 'A', value: currentQuestion.option_a },
                    { key: 'B', value: currentQuestion.option_b },
                    { key: 'C', value: currentQuestion.option_c },
                    { key: 'D', value: currentQuestion.option_d }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleAnswerSelect(option.key)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedAnswer === option.key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{option.key})</span>
                        <span>{option.value}</span>
                        {selectedAnswer === option.key && (
                          <div className="ml-auto">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Answer Feedback */}
                {selectedAnswer && (
                  <div className={`p-4 rounded-lg ${
                    isCorrect 
                      ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                      : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`font-medium ${
                        isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {isCorrect ? 'Correct!' : 'Incorrect. The correct answer is ' + currentQuestion.correct_answer}
                      </span>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {showExplanation && currentQuestion.explanation && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Explanation:</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{currentQuestion.explanation}</p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-2">
                    {selectedAnswer && (
                      <Button
                        onClick={() => setShowExplanation(!showExplanation)}
                        variant="outline"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {showExplanation ? 'Hide' : 'Show'} Explanation
                      </Button>
                    )}

                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={!selectedAnswer}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500'
                    : answeredQuestions.has(index)
                    ? 'bg-green-500'
                    : flaggedQuestions.has(index)
                    ? 'bg-yellow-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Warning for unanswered questions */}
        {Object.keys(answers).length < quiz.questions.length && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200">
                You have {quiz.questions.length - Object.keys(answers).length} unanswered questions. 
                Please answer all questions before submitting.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
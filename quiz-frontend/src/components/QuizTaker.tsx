import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchQuiz, submitQuiz } from './api';
import { useUser } from './UserContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Timer,
  AlertTriangle,
  Brain,
  Target,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  BookOpen,
  Zap
} from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  num_questions: number;
  questions: Question[];
}

export default function QuizTaker() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useUser();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]);

  useEffect(() => {
    if (quiz && timeLeft > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, timeLeft, isPaused]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading quiz:', { quizId, tenant_id: user?.tenant_id || 'default' });
      
      const quizData = await fetchQuiz(quizId, user?.tenant_id || 'default', token || undefined);
      
      console.log('✅ Quiz loaded successfully:', { 
        id: quizData.id, 
        title: quizData.title, 
        questions: quizData.questions?.length,
        duration: quizData.duration 
      });
      
      setQuiz(quizData);
      setTimeLeft(quizData.duration * 60); // Convert minutes to seconds
      startTimeRef.current = Date.now();
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading quiz:', error);
      setError(`Failed to load quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleTimeUp = () => {
    setShowConfirmSubmit(true);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    setIsSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const result = await submitQuiz({
        quiz_id: quiz.id,
        answers: userAnswers,
        time_taken: timeTaken,
        tenant_id: user?.tenant_id || 'default',
        token: token || undefined
      });
      
      router.push(`/results/${result.result.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getTimeColor = () => {
    if (timeLeft <= 60) return 'text-red-500';
    if (timeLeft <= 300) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Quiz...</h2>
          <p className="text-gray-600 dark:text-gray-400">Preparing your learning experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={loadQuiz} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(userAnswers).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{quiz.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getDifficultyColor(quiz.difficulty)}>
                {quiz.difficulty}
              </Badge>
              <Button
                variant="ghost"
                onClick={togglePause}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {answeredQuestions} answered
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className={`w-4 h-4 ${getTimeColor()}`} />
                <span className={`font-mono text-lg font-bold ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {quiz.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                        index === currentQuestionIndex
                          ? 'bg-blue-500 text-white shadow-lg'
                          : userAnswers[quiz.questions[index].id]
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Answered</span>
                    <span className="font-semibold text-green-600">{answeredQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                    <span className="font-semibold text-blue-600">{totalQuestions - answeredQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-purple-600">{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Question {currentQuestionIndex + 1}
                    </Badge>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% complete
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
                    {currentQuestion.question_text}
                  </h2>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { key: 'A', value: currentQuestion.option_a },
                    { key: 'B', value: currentQuestion.option_b },
                    { key: 'C', value: currentQuestion.option_c },
                    { key: 'D', value: currentQuestion.option_d }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        userAnswers[currentQuestion.id] === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          userAnswers[currentQuestion.id] === option.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.key}
                        </div>
                        <span className="font-medium">{option.value}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-4">
                    {currentQuestionIndex === totalQuestions - 1 ? (
                      <Button
                        onClick={() => setShowConfirmSubmit(true)}
                        disabled={answeredQuestions === 0}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-3"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-2xl max-w-md w-full">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {timeLeft === 0 ? 'Time\'s Up!' : 'Submit Quiz?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {timeLeft === 0 
                    ? 'Your time has run out. Your quiz will be submitted automatically.'
                    : `You've answered ${answeredQuestions} out of ${totalQuestions} questions. Are you sure you want to submit?`
                  }
                </p>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmSubmit(false)}
                    disabled={timeLeft === 0}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
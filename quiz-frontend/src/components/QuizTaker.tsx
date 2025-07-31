import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Timer,
  AlertTriangle
} from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  total_questions: number;
  is_ai_generated: boolean;
}

const QuizTaker: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    loadQuiz();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]);

  useEffect(() => {
    if (quiz && timeLeft > 0) {
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
  }, [quiz, timeLeft]);

  const loadQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/quizzes/${quizId}?tenant_id=demo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
        setQuestions(data.questions);
        setTimeLeft(data.quiz.duration * 60); // Convert minutes to seconds
        startTimeRef.current = Date.now();
      } else {
        setError('Failed to load quiz');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('Error loading quiz');
    } finally {
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
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleTimeUp = () => {
    alert('Time is up! Submitting your quiz automatically.');
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length < questions.length) {
      const unanswered = questions.length - Object.keys(userAnswers).length;
      if (!confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

      const response = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quiz_id: parseInt(quizId!),
          tenant_id: 'demo',
          user_answers: userAnswers,
          time_taken: timeTaken
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/results/${data.result.id}`, { 
          state: { 
            result: data.result,
            newAchievements: data.new_achievements 
          }
        });
      } else {
        alert('Failed to submit quiz. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
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
    return (Object.keys(userAnswers).length / questions.length) * 100;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return 'text-red-600';
    if (timeLeft < 300) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Quiz not found or no questions available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = userAnswers[currentQuestion.id.toString()];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>

        {/* Progress and Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Object.keys(userAnswers).length}/{questions.length}
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time Remaining</span>
                <div className={`flex items-center space-x-1 ${getTimeColor()}`}>
                  <Timer className="h-4 w-4" />
                  <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
              <Progress 
                value={(timeLeft / (quiz.duration * 60)) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Difficulty</span>
                <Badge variant="outline" className="capitalize">
                  {quiz.difficulty}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question {currentQuestionIndex + 1}</span>
              {isAnswered && <CheckCircle className="h-5 w-5 text-green-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-lg font-medium">{currentQuestion.question_text}</p>
              
              <div className="space-y-3">
                {Object.entries(currentQuestion.options).map(([option, text]) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(currentQuestion.id.toString(), text)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      userAnswers[currentQuestion.id.toString()] === text
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        userAnswers[currentQuestion.id.toString()] === text
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {userAnswers[currentQuestion.id.toString()] === text && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-medium">{option}.</span>
                      <span>{text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Question Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-2 text-sm border rounded ${
                    index === currentQuestionIndex
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : userAnswers[questions[index].id.toString()]
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Confirm Submit Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle>Confirm Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Are you sure you want to submit your quiz? You cannot change your answers after submission.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmSubmit(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConfirmSubmit(false);
                      handleSubmitQuiz();
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTaker; 
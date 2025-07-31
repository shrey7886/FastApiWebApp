import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  Send,
  ArrowLeft,
  TrendingUp,
  Brain,
  BookOpen,
  Zap
} from 'lucide-react';

interface QuizResult {
  id: number;
  score: number;
  total_questions: number;
  percentage: number;
  grade: string;
  time_taken: number;
  feedback: string;
  questions_analysis: Array<{
    question_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
  }>;
}

interface ChatMessage {
  id: string;
  user_message: string;
  bot_response: string;
  timestamp: string;
  is_user: boolean;
}

const QuizResults: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<QuizResult | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      setNewAchievements(location.state.newAchievements || []);
      setLoading(false);
    } else {
      loadResult();
    }
  }, [location.state, resultId]);

  const loadResult = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/quiz-results/${resultId}?tenant_id=demo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      } else {
        setError('Failed to load quiz results');
      }
    } catch (error) {
      console.error('Error loading results:', error);
      setError('Error loading quiz results');
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isSendingMessage) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsSendingMessage(true);

    // Add user message to chat
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      user_message: userMessage,
      bot_response: '',
      timestamp: new Date().toISOString(),
      is_user: true
    };

    setChatMessages(prev => [...prev, userChatMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            quiz_id: result?.id,
            tenant_id: 'demo'
          },
          tenant_id: 'demo'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          user_message: '',
          bot_response: data.response.answer,
          timestamp: new Date().toISOString(),
          is_user: false
        };

        setChatMessages(prev => [...prev, botMessage]);
      } else {
        // Add error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          user_message: '',
          bot_response: 'Sorry, I\'m having trouble responding right now. Please try again later.',
          timestamp: new Date().toISOString(),
          is_user: false
        };

        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_message: '',
        bot_response: 'Sorry, I\'m having trouble responding right now. Please try again later.',
        timestamp: new Date().toISOString(),
        is_user: false
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>{error || 'Results not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const correctAnswers = result.questions_analysis.filter(q => q.is_correct).length;
  const incorrectAnswers = result.questions_analysis.filter(q => !q.is_correct).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
              <p className="text-gray-600">Here's how you performed</p>
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

        {/* New Achievements Alert */}
        {newAchievements.length > 0 && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Trophy className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Congratulations!</strong> You've earned new achievements: {newAchievements.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.percentage}%
              </div>
              <Badge className={`text-lg px-4 py-2 ${getGradeColor(result.grade)}`}>
                Grade {result.grade}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="font-medium">Score</span>
              </div>
              <div className="text-2xl font-bold">{result.score}/{result.total_questions}</div>
              <p className="text-sm text-muted-foreground">Correct answers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Time Taken</span>
              </div>
              <div className="text-2xl font-bold">{formatTime(result.time_taken)}</div>
              <p className="text-sm text-muted-foreground">Total time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Performance</span>
              </div>
              <div className="text-2xl font-bold">
                {result.percentage >= 90 ? 'Excellent' : 
                 result.percentage >= 80 ? 'Good' : 
                 result.percentage >= 70 ? 'Fair' : 
                 result.percentage >= 60 ? 'Needs Improvement' : 'Poor'}
              </div>
              <p className="text-sm text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Analysis */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Question Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.questions_analysis.map((question, index) => (
                    <div key={question.question_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        {question.is_correct ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Your Answer:</span>
                          <span className={`ml-2 ${question.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                            {question.user_answer || 'Not answered'}
                          </span>
                        </div>
                        
                        {!question.is_correct && (
                          <div>
                            <span className="font-medium">Correct Answer:</span>
                            <span className="ml-2 text-green-600">{question.correct_answer}</span>
                          </div>
                        )}
                        
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium text-blue-800">Explanation:</span>
                            <p className="text-blue-700 mt-1">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Correct Answers</span>
                      <span>{correctAnswers}</span>
                    </div>
                    <Progress value={(correctAnswers / result.total_questions) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Incorrect Answers</span>
                      <span>{incorrectAnswers}</span>
                    </div>
                    <Progress value={(incorrectAnswers / result.total_questions) * 100} className="h-2" />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Feedback:</p>
                    <p className="text-sm">{result.feedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex items-center space-x-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Take Another Quiz</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/dashboard?tab=analytics')}
                    className="w-full flex items-center space-x-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>View Analytics</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="w-full flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Ask Questions</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chatbot */}
        {isChatOpen && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Learning Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Ask me anything about the quiz questions or get study tips!</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                            message.is_user
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border'
                          }`}
                        >
                          <p className="text-sm">{message.is_user ? message.user_message : message.bot_response}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isSendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-white border p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about the quiz questions or get study tips..."
                    disabled={isSendingMessage}
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isSendingMessage}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuizResults; 
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BookOpen, 
  Target, 
  TrendingUp,
  Filter,
  Search,
  Calendar,
  Brain
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { fetchQuestionHistory } from '@/components/api';
import { useUser } from '@/components/UserContext';

interface QuestionHistoryItem {
  question_id: number;
  question_text: string;
  topic_name: string;
  difficulty_level: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  time_taken_seconds: number;
  answered_at: string;
  quiz_id: number;
}

interface QuestionHistorySummary {
  total_questions_answered: number;
  correct_answers: number;
  accuracy_percentage: number;
  unique_topics: string[];
  topics_count: number;
}

export default function QuestionHistoryPage() {
  const router = useRouter();
  const { user, token } = useUser();
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [summary, setSummary] = useState<QuestionHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadQuestionHistory();
    }
  }, [user]);

  const loadQuestionHistory = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchQuestionHistory({
        tenant_id: user.tenant_id,
        limit: 100,
        token: token || undefined
      });
      
      if (response.success) {
        setQuestionHistory(response.question_history);
        setSummary(response.summary);
      } else {
        setError('Failed to load question history');
      }
    } catch (err) {
      setError('Failed to load question history');
      console.error('Error loading question history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const filteredQuestions = questionHistory.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.topic_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || question.topic_name === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty_level === selectedDifficulty;
    const matchesResult = selectedResult === 'all' || 
                         (selectedResult === 'correct' && question.is_correct) ||
                         (selectedResult === 'incorrect' && !question.is_correct);
    
    return matchesSearch && matchesTopic && matchesDifficulty && matchesResult;
  });

  const uniqueTopics = summary?.unique_topics || [];
  const uniqueDifficulties = Array.from(new Set(questionHistory.map(q => q.difficulty_level)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your question history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Question History</h1>
              <p className="text-gray-600 dark:text-gray-400">Review all questions you've answered</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Total Questions</span>
                </div>
                <div className="text-2xl font-bold">{summary.total_questions_answered}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Questions answered</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Correct Answers</span>
                </div>
                <div className="text-2xl font-bold">{summary.correct_answers}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Right answers</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Accuracy</span>
                </div>
                <div className="text-2xl font-bold">{summary.accuracy_percentage}%</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall accuracy</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Topics</span>
                </div>
                <div className="text-2xl font-bold">{summary.topics_count}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unique topics</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search questions or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All topics</SelectItem>
                    {uniqueTopics.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All difficulties</SelectItem>
                    {uniqueDifficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Result</label>
                <Select value={selectedResult} onValueChange={setSelectedResult}>
                  <SelectTrigger>
                    <SelectValue placeholder="All results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All results</SelectItem>
                    <SelectItem value="correct">Correct answers</SelectItem>
                    <SelectItem value="incorrect">Incorrect answers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question List */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>
              Question History ({filteredQuestions.length} questions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No questions found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question, index) => (
                  <div
                    key={`${question.question_id}-${question.answered_at}`}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {question.question_text}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {question.topic_name}
                            </Badge>
                            <Badge className={`text-xs ${getDifficultyColor(question.difficulty_level)}`}>
                              {question.difficulty_level}
                            </Badge>
                            {question.is_correct ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(question.time_taken_seconds)}</span>
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(question.answered_at)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Your Answer: </span>
                        <span className={question.is_correct ? 'text-green-600' : 'text-red-600'}>
                          {question.user_answer}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Correct Answer: </span>
                        <span className="text-green-600">{question.correct_answer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
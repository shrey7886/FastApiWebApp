'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';

interface QuizHistory {
  id: number;
  quiz_id: number;
  topic: string;
  difficulty: string;
  score: number;
  total_questions: number;
  percentage: number;
  grade: string;
  time_taken: number;
  completed_at: string;
}

const HistoryPage: React.FC = () => {
  const router = useRouter();
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/quiz-history?tenant_id=demo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      } else {
        // Mock data for demo
        const mockHistory: QuizHistory[] = [
          {
            id: 1,
            quiz_id: 101,
            topic: 'Space Travel',
            difficulty: 'medium',
            score: 4,
            total_questions: 5,
            percentage: 80,
            grade: 'B',
            time_taken: 420,
            completed_at: '2024-01-28T10:30:00Z'
          },
          {
            id: 2,
            quiz_id: 102,
            topic: 'JavaScript Basics',
            difficulty: 'easy',
            score: 5,
            total_questions: 5,
            percentage: 100,
            grade: 'A',
            time_taken: 300,
            completed_at: '2024-01-27T14:15:00Z'
          },
          {
            id: 3,
            quiz_id: 103,
            topic: 'Python Programming',
            difficulty: 'hard',
            score: 3,
            total_questions: 5,
            percentage: 60,
            grade: 'C',
            time_taken: 600,
            completed_at: '2024-01-26T09:45:00Z'
          },
          {
            id: 4,
            quiz_id: 104,
            topic: 'World History',
            difficulty: 'medium',
            score: 4,
            total_questions: 5,
            percentage: 80,
            grade: 'B',
            time_taken: 450,
            completed_at: '2024-01-25T16:20:00Z'
          },
          {
            id: 5,
            quiz_id: 105,
            topic: 'Chemistry Fundamentals',
            difficulty: 'hard',
            score: 2,
            total_questions: 5,
            percentage: 40,
            grade: 'D',
            time_taken: 720,
            completed_at: '2024-01-24T11:10:00Z'
          }
        ];
        setHistory(mockHistory);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(quiz => {
    const matchesSearch = quiz.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || quiz.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStats = () => {
    if (history.length === 0) return { total: 0, average: 0, best: 0, totalTime: 0 };
    
    const total = history.length;
    const average = Math.round(history.reduce((sum, quiz) => sum + quiz.percentage, 0) / total);
    const best = Math.max(...history.map(quiz => quiz.percentage));
    const totalTime = history.reduce((sum, quiz) => sum + quiz.time_taken, 0);
    
    return { total, average, best, totalTime };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Quiz History</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.average}%</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.best}%</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-3xl font-bold text-gray-900">{formatTime(stats.totalTime)}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-900">Quiz History</h2>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => router.push('/create-quiz')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((quiz) => (
                <div key={quiz.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{quiz.topic}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(quiz.grade)}`}>
                          Grade {quiz.grade}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>{quiz.score}/{quiz.total_questions} correct</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(quiz.time_taken)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(quiz.completed_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{quiz.percentage}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${quiz.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => router.push(`/results/${quiz.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      View Details →
                    </button>
                    
                    <button
                      onClick={() => router.push(`/take-quiz/${quiz.quiz_id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage; 
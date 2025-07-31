'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Award, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy,
  Lightbulb,
  Calendar
} from 'lucide-react';

interface Analytics {
  user_info: {
    total_quizzes_taken: number;
    total_questions_answered: number;
    total_correct_answers: number;
    average_score: number;
    best_score: number;
    total_study_time: number;
  };
  performance_metrics: {
    overall_average: number;
    recent_average: number;
    best_score: number;
    average_time_per_question: number;
    improvement_rate: number;
    completion_rate: number;
  };
  topic_performance: Array<{
    topic: string;
    category: string;
    quizzes_taken: number;
    average_score: number;
    accuracy: number;
  }>;
  streaks: {
    current_streak: number;
    longest_streak: number;
  };
  weak_areas: Array<{
    category: string;
    difficulty: string;
    incorrect_count: number;
    recommendation: string;
  }>;
  achievements: Array<{
    name: string;
    description: string;
    points: number;
    unlocked_at: string;
  }>;
  recommendations: string[];
}

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/analytics/user?tenant_id=demo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        // Mock data for demo
        const mockAnalytics: Analytics = {
          user_info: {
            total_quizzes_taken: 15,
            total_questions_answered: 75,
            total_correct_answers: 58,
            average_score: 77.3,
            best_score: 95.0,
            total_study_time: 120
          },
          performance_metrics: {
            overall_average: 77.3,
            recent_average: 82.5,
            best_score: 95.0,
            average_time_per_question: 45.2,
            improvement_rate: 12.5,
            completion_rate: 93.3
          },
          topic_performance: [
            { topic: 'Science', category: 'STEM', quizzes_taken: 5, average_score: 85.0, accuracy: 85.0 },
            { topic: 'History', category: 'Humanities', quizzes_taken: 4, average_score: 72.5, accuracy: 72.5 },
            { topic: 'Mathematics', category: 'STEM', quizzes_taken: 3, average_score: 68.3, accuracy: 68.3 },
            { topic: 'Literature', category: 'Humanities', quizzes_taken: 3, average_score: 81.7, accuracy: 81.7 }
          ],
          streaks: {
            current_streak: 5,
            longest_streak: 12
          },
          weak_areas: [
            { category: 'Mathematics', difficulty: 'hard', incorrect_count: 8, recommendation: 'Focus on advanced algebra concepts' },
            { category: 'History', difficulty: 'medium', incorrect_count: 5, recommendation: 'Review 20th century events' }
          ],
          achievements: [
            { name: 'First Steps', description: 'Completed your first quiz!', points: 10, unlocked_at: '2024-01-15' },
            { name: 'High Achiever', description: 'Scored 90% or higher!', points: 25, unlocked_at: '2024-01-20' },
            { name: 'Streak Master', description: 'Maintained a 7-day study streak', points: 50, unlocked_at: '2024-01-25' }
          ],
          recommendations: [
            'Practice more Mathematics questions to improve your weak areas',
            'Try advanced difficulty quizzes to challenge yourself',
            'Maintain your current study streak for better consistency'
          ]
        };
        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Not Available</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
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
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Analytics & Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.user_info.total_quizzes_taken}</p>
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
                <p className="text-3xl font-bold text-gray-900">{analytics.performance_metrics.overall_average}%</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.streaks.current_streak} days</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Score</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.performance_metrics.best_score}%</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Topic Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <PieChart className="h-6 w-6 mr-2 text-blue-600" />
              Topic Performance
            </h3>
            <div className="space-y-4">
              {analytics.topic_performance.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{topic.topic}</h4>
                    <p className="text-sm text-gray-600">{topic.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{topic.average_score}%</p>
                    <p className="text-sm text-gray-600">{topic.quizzes_taken} quizzes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Areas */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="h-6 w-6 mr-2 text-red-600" />
              Areas for Improvement
            </h3>
            <div className="space-y-4">
              {analytics.weak_areas.map((area, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-800">{area.category}</h4>
                    <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">
                      {area.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mb-2">{area.recommendation}</p>
                  <p className="text-xs text-red-600">{area.incorrect_count} incorrect answers</p>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-6 w-6 mr-2 text-yellow-600" />
              Achievements
            </h3>
            <div className="space-y-4">
              {analytics.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="bg-yellow-500 rounded-full p-2">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800">{achievement.name}</h4>
                    <p className="text-sm text-yellow-700">{achievement.description}</p>
                    <p className="text-xs text-yellow-600">{achievement.points} points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Lightbulb className="h-6 w-6 mr-2 text-blue-600" />
              Recommendations
            </h3>
            <div className="space-y-4">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-green-600" />
            Performance Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+{analytics.performance_metrics.improvement_rate}%</div>
              <p className="text-gray-600">Improvement Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.performance_metrics.completion_rate}%</div>
              <p className="text-gray-600">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{analytics.performance_metrics.average_time_per_question}s</div>
              <p className="text-gray-600">Avg Time per Question</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 
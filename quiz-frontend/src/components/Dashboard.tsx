'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { 
  Plus, 
  History, 
  TrendingUp, 
  MessageCircle, 
  BookOpen, 
  Target,
  Award,
  Clock,
  CheckCircle,
  BarChart3,
  Settings,
  LogOut,
  User,
  Trophy,
  Zap,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  totalQuestions: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  score?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user, token, logout } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    averageScore: 0,
    currentStreak: 0,
    totalQuestions: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user stats
      const statsResponse = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalQuizzes: statsData.total_quizzes_taken || 0,
          averageScore: statsData.average_score || 0,
          currentStreak: statsData.current_streak || 0,
          totalQuestions: statsData.total_questions_answered || 0
        });
      }

      // Load recent activity
      const activityResponse = await fetch('/api/user/recent-activity', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }

      // Load achievements
      const achievementsResponse = await fetch('/api/user/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData.achievements || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Quiz Generator</h1>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {user?.first_name || user?.email}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/create-quiz')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Quiz</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.first_name || 'Quiz Master'}! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to challenge yourself with AI-generated quizzes?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalQuizzes}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.currentStreak} days</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions Answered</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => router.push('/create-quiz')}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-3">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Create New Quiz</h3>
                  <p className="text-gray-600 dark:text-gray-400">Generate a custom quiz with AI</p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          <button
            onClick={() => router.push('/history')}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-3">
                  <History className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">View History</h3>
                  <p className="text-gray-600 dark:text-gray-400">Review your past quizzes and performance</p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>

        {/* Recent Activity and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description} • {activity.timestamp}
                      </p>
                    </div>
                    {activity.score && (
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {activity.score}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No recent activity</p>
                <p className="text-sm">Start taking quizzes to see your activity here!</p>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h3>
              <Award className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {achievements.slice(0, 4).map((achievement) => (
                  <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.earned 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}>
                    <div className={`rounded-full p-2 ${
                      achievement.earned 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      <Trophy className={`h-6 w-6 ${achievement.earned ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${achievement.earned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {achievement.name}
                      </p>
                      <p className={`text-sm ${achievement.earned ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No achievements yet</p>
                <p className="text-sm">Complete quizzes to earn achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
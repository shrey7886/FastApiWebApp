#!/usr/bin/env python3
"""
Analytics Service for Quiz Application
Provides comprehensive analytics, progress tracking, and performance insights
"""

import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np

class AnalyticsService:
    def __init__(self, db_session: Session):
        self.db_session = db_session
    
    def get_user_analytics(self, user_id: int, tenant_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for a user"""
        try:
            from models import User, QuizResult, Topic, Quiz, Question
            
            # Get user data
            user = self.db_session.query(User).filter(User.id == user_id).first()
            if not user:
                return {"error": "User not found"}
            
            # Get all quiz results for the user
            results = self.db_session.query(QuizResult).filter(
                QuizResult.user_id == user_id,
                QuizResult.tenant_id == tenant_id
            ).all()
            
            if not results:
                return self._get_empty_analytics()
            
            # Calculate basic metrics
            total_quizzes = len(results)
            total_questions = sum(r.total_questions for r in results)
            total_correct = sum(r.score for r in results)
            average_score = total_correct / total_questions if total_questions > 0 else 0
            best_score = max(r.percentage for r in results) if results else 0
            
            # Calculate time-based metrics
            total_time = sum(r.time_taken for r in results)
            average_time_per_question = total_time / total_questions if total_questions > 0 else 0
            
            # Get recent performance (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_results = [r for r in results if r.completed_at >= thirty_days_ago]
            recent_average = sum(r.percentage for r in recent_results) / len(recent_results) if recent_results else 0
            
            # Get topic-wise performance
            topic_performance = self._get_topic_performance(user_id, tenant_id)
            
            # Get difficulty-wise performance
            difficulty_performance = self._get_difficulty_performance(user_id, tenant_id)
            
            # Get progress over time
            progress_data = self._get_progress_over_time(user_id, tenant_id)
            
            # Get study streaks
            streaks = self._calculate_streaks(results)
            
            # Get improvement rate
            improvement_rate = self._calculate_improvement_rate(results)
            
            # Get weak areas
            weak_areas = self._identify_weak_areas(user_id, tenant_id)
            
            # Get achievements
            achievements = self._get_user_achievements(user_id)
            
            return {
                "user_info": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "total_quizzes_taken": total_quizzes,
                    "total_questions_answered": total_questions,
                    "total_correct_answers": total_correct,
                    "average_score": round(average_score * 100, 2),
                    "best_score": round(best_score, 2),
                    "total_study_time": round(total_time / 60, 2)  # Convert to minutes
                },
                "performance_metrics": {
                    "overall_average": round(average_score * 100, 2),
                    "recent_average": round(recent_average, 2),
                    "best_score": round(best_score, 2),
                    "average_time_per_question": round(average_time_per_question, 2),
                    "improvement_rate": round(improvement_rate, 2),
                    "completion_rate": round(len([r for r in results if r.percentage >= 60]) / total_quizzes * 100, 2)
                },
                "topic_performance": topic_performance,
                "difficulty_performance": difficulty_performance,
                "progress_data": progress_data,
                "streaks": streaks,
                "weak_areas": weak_areas,
                "achievements": achievements,
                "recommendations": self._generate_recommendations(
                    average_score, recent_average, weak_areas, streaks
                )
            }
            
        except Exception as e:
            print(f"❌ Error getting user analytics: {e}")
            return {"error": str(e)}
    
    def _get_empty_analytics(self) -> Dict[str, Any]:
        """Return empty analytics for new users"""
        return {
            "user_info": {
                "total_quizzes_taken": 0,
                "total_questions_answered": 0,
                "total_correct_answers": 0,
                "average_score": 0,
                "best_score": 0,
                "total_study_time": 0
            },
            "performance_metrics": {
                "overall_average": 0,
                "recent_average": 0,
                "best_score": 0,
                "average_time_per_question": 0,
                "improvement_rate": 0,
                "completion_rate": 0
            },
            "topic_performance": [],
            "difficulty_performance": [],
            "progress_data": [],
            "streaks": {"current_streak": 0, "longest_streak": 0},
            "weak_areas": [],
            "achievements": [],
            "recommendations": [
                "Take your first quiz to start tracking your progress!",
                "Try different topics to discover your interests",
                "Set daily study goals to build a learning habit"
            ]
        }
    
    def _get_topic_performance(self, user_id: int, tenant_id: str) -> List[Dict]:
        """Get performance breakdown by topic"""
        try:
            from models import QuizResult, Quiz, Topic
            
            # Get topic-wise performance
            topic_stats = self.db_session.query(
                Topic.name,
                Topic.category,
                func.count(QuizResult.id).label('quizzes_taken'),
                func.avg(QuizResult.percentage).label('average_score'),
                func.sum(QuizResult.score).label('total_correct'),
                func.sum(QuizResult.total_questions).label('total_questions')
            ).join(Quiz, Quiz.topic_id == Topic.id).join(
                QuizResult, QuizResult.quiz_id == Quiz.id
            ).filter(
                QuizResult.user_id == user_id,
                QuizResult.tenant_id == tenant_id
            ).group_by(Topic.id, Topic.name, Topic.category).all()
            
            return [
                {
                    "topic": stat.name,
                    "category": stat.category,
                    "quizzes_taken": stat.quizzes_taken,
                    "average_score": round(stat.average_score, 2),
                    "total_correct": stat.total_correct,
                    "total_questions": stat.total_questions,
                    "accuracy": round(stat.total_correct / stat.total_questions * 100, 2) if stat.total_questions > 0 else 0
                }
                for stat in topic_stats
            ]
        except Exception as e:
            print(f"❌ Error getting topic performance: {e}")
            return []
    
    def _get_difficulty_performance(self, user_id: int, tenant_id: str) -> List[Dict]:
        """Get performance breakdown by difficulty level"""
        try:
            from models import QuizResult, Quiz
            
            difficulty_stats = self.db_session.query(
                Quiz.difficulty,
                func.count(QuizResult.id).label('quizzes_taken'),
                func.avg(QuizResult.percentage).label('average_score'),
                func.sum(QuizResult.score).label('total_correct'),
                func.sum(QuizResult.total_questions).label('total_questions')
            ).join(QuizResult, QuizResult.quiz_id == Quiz.id).filter(
                QuizResult.user_id == user_id,
                QuizResult.tenant_id == tenant_id
            ).group_by(Quiz.difficulty).all()
            
            return [
                {
                    "difficulty": stat.difficulty,
                    "quizzes_taken": stat.quizzes_taken,
                    "average_score": round(stat.average_score, 2),
                    "total_correct": stat.total_correct,
                    "total_questions": stat.total_questions,
                    "accuracy": round(stat.total_correct / stat.total_questions * 100, 2) if stat.total_questions > 0 else 0
                }
                for stat in difficulty_stats
            ]
        except Exception as e:
            print(f"❌ Error getting difficulty performance: {e}")
            return []
    
    def _get_progress_over_time(self, user_id: int, tenant_id: str, days: int = 30) -> List[Dict]:
        """Get progress data over time"""
        try:
            from models import QuizResult
            
            # Get results from last N days
            start_date = datetime.utcnow() - timedelta(days=days)
            
            results = self.db_session.query(QuizResult).filter(
                QuizResult.user_id == user_id,
                QuizResult.tenant_id == tenant_id,
                QuizResult.completed_at >= start_date
            ).order_by(QuizResult.completed_at).all()
            
            # Group by date
            daily_data = {}
            for result in results:
                date_str = result.completed_at.strftime('%Y-%m-%d')
                if date_str not in daily_data:
                    daily_data[date_str] = {
                        'date': date_str,
                        'quizzes_taken': 0,
                        'average_score': 0,
                        'total_questions': 0,
                        'total_correct': 0
                    }
                
                daily_data[date_str]['quizzes_taken'] += 1
                daily_data[date_str]['total_questions'] += result.total_questions
                daily_data[date_str]['total_correct'] += result.score
            
            # Calculate averages
            for date_data in daily_data.values():
                if date_data['total_questions'] > 0:
                    date_data['average_score'] = round(
                        date_data['total_correct'] / date_data['total_questions'] * 100, 2
                    )
            
            return list(daily_data.values())
            
        except Exception as e:
            print(f"❌ Error getting progress over time: {e}")
            return []
    
    def _calculate_streaks(self, results: List) -> Dict[str, int]:
        """Calculate study streaks"""
        try:
            if not results:
                return {"current_streak": 0, "longest_streak": 0}
            
            # Sort results by date
            sorted_results = sorted(results, key=lambda x: x.completed_at.date())
            
            current_streak = 0
            longest_streak = 0
            temp_streak = 0
            last_date = None
            
            for result in sorted_results:
                result_date = result.completed_at.date()
                
                if last_date is None:
                    temp_streak = 1
                elif (result_date - last_date).days == 1:
                    temp_streak += 1
                else:
                    temp_streak = 1
                
                longest_streak = max(longest_streak, temp_streak)
                last_date = result_date
            
            # Check if current streak is ongoing
            if last_date and (datetime.utcnow().date() - last_date).days <= 1:
                current_streak = temp_streak
            
            return {
                "current_streak": current_streak,
                "longest_streak": longest_streak
            }
            
        except Exception as e:
            print(f"❌ Error calculating streaks: {e}")
            return {"current_streak": 0, "longest_streak": 0}
    
    def _calculate_improvement_rate(self, results: List) -> float:
        """Calculate improvement rate over time"""
        try:
            if len(results) < 2:
                return 0.0
            
            # Sort by date
            sorted_results = sorted(results, key=lambda x: x.completed_at)
            
            # Split into first half and second half
            mid_point = len(sorted_results) // 2
            first_half = sorted_results[:mid_point]
            second_half = sorted_results[mid_point:]
            
            first_avg = sum(r.percentage for r in first_half) / len(first_half)
            second_avg = sum(r.percentage for r in second_half) / len(second_half)
            
            improvement_rate = ((second_avg - first_avg) / first_avg * 100) if first_avg > 0 else 0
            return round(improvement_rate, 2)
            
        except Exception as e:
            print(f"❌ Error calculating improvement rate: {e}")
            return 0.0
    
    def _identify_weak_areas(self, user_id: int, tenant_id: str) -> List[Dict]:
        """Identify user's weak areas"""
        try:
            from models import QuizResult, Quiz, Topic, Question
            
            # Get questions where user answered incorrectly
            weak_questions = self.db_session.query(
                Question.category,
                Question.difficulty_level,
                func.count(Question.id).label('incorrect_count')
            ).join(Quiz, Question.quiz_id == Quiz.id).join(
                QuizResult, QuizResult.quiz_id == Quiz.id
            ).filter(
                QuizResult.user_id == user_id,
                QuizResult.tenant_id == tenant_id
            ).group_by(Question.category, Question.difficulty_level).all()
            
            weak_areas = []
            for weak in weak_questions:
                if weak.incorrect_count > 0:
                    weak_areas.append({
                        "category": weak.category or "General",
                        "difficulty": weak.difficulty_level,
                        "incorrect_count": weak.incorrect_count,
                        "recommendation": f"Focus on {weak.category} questions at {weak.difficulty_level} level"
                    })
            
            # Sort by incorrect count
            weak_areas.sort(key=lambda x: x['incorrect_count'], reverse=True)
            return weak_areas[:5]  # Return top 5 weak areas
            
        except Exception as e:
            print(f"❌ Error identifying weak areas: {e}")
            return []
    
    def _get_user_achievements(self, user_id: int) -> List[Dict]:
        """Get user achievements"""
        try:
            from models import UserAchievement
            
            achievements = self.db_session.query(UserAchievement).filter(
                UserAchievement.user_id == user_id
            ).order_by(UserAchievement.unlocked_at.desc()).all()
            
            return [
                {
                    "id": achievement.id,
                    "type": achievement.achievement_type,
                    "name": achievement.achievement_name,
                    "description": achievement.achievement_description,
                    "points": achievement.points_earned,
                    "unlocked_at": achievement.unlocked_at.isoformat()
                }
                for achievement in achievements
            ]
        except Exception as e:
            print(f"❌ Error getting achievements: {e}")
            return []
    
    def _generate_recommendations(self, average_score: float, recent_average: float, 
                                weak_areas: List[Dict], streaks: Dict) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Performance-based recommendations
        if average_score < 70:
            recommendations.append("Focus on reviewing incorrect answers to improve your understanding")
        
        if recent_average < average_score:
            recommendations.append("Your recent performance has declined. Consider taking more practice quizzes")
        
        # Weak areas recommendations
        if weak_areas:
            top_weak_area = weak_areas[0]
            recommendations.append(f"Practice more {top_weak_area['category']} questions to strengthen this area")
        
        # Streak-based recommendations
        if streaks['current_streak'] == 0:
            recommendations.append("Start a daily study habit to build consistency")
        elif streaks['current_streak'] < 7:
            recommendations.append(f"Great! You're on a {streaks['current_streak']}-day streak. Keep it up!")
        
        # General recommendations
        if len(recommendations) < 3:
            recommendations.extend([
                "Try different difficulty levels to challenge yourself",
                "Use the chatbot to get explanations for difficult questions",
                "Set daily study goals to track your progress"
            ])
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def update_user_metrics(self, user_id: int, quiz_result: Dict):
        """Update user metrics after quiz completion"""
        try:
            from models import User, ProgressTracking
            
            user = self.db_session.query(User).filter(User.id == user_id).first()
            if not user:
                return
            
            # Update user metrics
            user.total_quizzes_taken += 1
            user.total_questions_answered += quiz_result['total_questions']
            user.total_correct_answers += quiz_result['score']
            user.total_study_time += quiz_result['time_taken'] // 60  # Convert to minutes
            
            # Update average score
            if user.total_questions_answered > 0:
                user.average_score = user.total_correct_answers / user.total_questions_answered
            
            # Update best score
            if quiz_result['percentage'] > user.best_score:
                user.best_score = quiz_result['percentage']
            
            # Update last login
            user.last_login = datetime.utcnow()
            
            # Create progress tracking entry
            today = datetime.utcnow().date()
            progress = self.db_session.query(ProgressTracking).filter(
                ProgressTracking.user_id == user_id,
                func.date(ProgressTracking.date) == today
            ).first()
            
            if progress:
                progress.quizzes_taken += 1
                progress.questions_answered += quiz_result['total_questions']
                progress.correct_answers += quiz_result['score']
                progress.study_time += quiz_result['time_taken'] // 60
            else:
                progress = ProgressTracking(
                    user_id=user_id,
                    date=datetime.utcnow(),
                    quizzes_taken=1,
                    questions_answered=quiz_result['total_questions'],
                    correct_answers=quiz_result['score'],
                    study_time=quiz_result['time_taken'] // 60,
                    average_score=quiz_result['percentage']
                )
                self.db_session.add(progress)
            
            self.db_session.commit()
            
        except Exception as e:
            print(f"❌ Error updating user metrics: {e}")
            self.db_session.rollback()
    
    def check_and_award_achievements(self, user_id: int, quiz_result: Dict):
        """Check and award achievements based on quiz performance"""
        try:
            from models import UserAchievement, User
            
            user = self.db_session.query(User).filter(User.id == user_id).first()
            if not user:
                return
            
            new_achievements = []
            
            # First quiz achievement
            if user.total_quizzes_taken == 1:
                achievement = UserAchievement(
                    user_id=user_id,
                    achievement_type="first_quiz",
                    achievement_name="First Steps",
                    achievement_description="Completed your first quiz!",
                    points_earned=10
                )
                new_achievements.append(achievement)
            
            # Perfect score achievement
            if quiz_result['percentage'] == 100:
                achievement = UserAchievement(
                    user_id=user_id,
                    achievement_type="perfect_score",
                    achievement_name="Perfect Score",
                    achievement_description="Achieved a perfect score!",
                    points_earned=50
                )
                new_achievements.append(achievement)
            
            # High score achievement
            if quiz_result['percentage'] >= 90:
                achievement = UserAchievement(
                    user_id=user_id,
                    achievement_type="high_score",
                    achievement_name="High Achiever",
                    achievement_description="Scored 90% or higher!",
                    points_earned=25
                )
                new_achievements.append(achievement)
            
            # Add achievements to database
            for achievement in new_achievements:
                self.db_session.add(achievement)
            
            self.db_session.commit()
            
            return [achievement.achievement_name for achievement in new_achievements]
            
        except Exception as e:
            print(f"❌ Error checking achievements: {e}")
            self.db_session.rollback()
            return [] 
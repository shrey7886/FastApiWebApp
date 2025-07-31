'use client'

import { useState, useEffect, useRef } from 'react'
import { generateQuiz } from './api'
import { useUser } from './UserContext'
import { useRouter } from 'next/navigation';

interface QuizGeneratorProps {
  onQuizGenerated: (quiz: any) => void
}

export default function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const { user, token } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    topic: '',
    num_questions: 5,
    tenant_id: 'demo',
    difficulty: 'medium',
    duration: 10
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update tenant_id when user changes
  useEffect(() => {
    if (user?.tenant_id) {
      setFormData(prev => ({ ...prev, tenant_id: user.tenant_id }));
    }
  }, [user]);

  // Dynamic topic suggestions based on common interests
  const topicSuggestions = {
    'Personal Interests': [
      'Your Hobby', 'Favorite Movie', 'Dream Job', 'Pet Name', 'Home Town', 
      'Favorite Food', 'School Subject', 'Travel Destination', 'Sports Team', 
      'Music Genre', 'Book Title', 'Scientific Concept'
    ],
    'Creative Topics': [
      'Art Style', 'Music Band', 'Movie Genre', 'Book Series', 'Video Game', 
      'Dance Style', 'Photography', 'Crafting', 'Writing', 'Design'
    ],
    'Academic Subjects': [
      'Mathematics', 'Science', 'History', 'Geography', 'Literature', 
      'Philosophy', 'Psychology', 'Economics', 'Politics', 'Languages'
    ],
    'Technology & Innovation': [
      'Programming', 'Artificial Intelligence', 'Space Exploration', 'Robotics', 
      'Virtual Reality', 'Cybersecurity', 'Data Science', 'Mobile Apps', 
      'Web Development', 'Blockchain'
    ],
    'Nature & Environment': [
      'Animals', 'Plants', 'Weather', 'Climate', 'Oceans', 'Mountains', 
      'Forests', 'Deserts', 'Rivers', 'Ecosystems'
    ],
    'Daily Life': [
      'Cooking', 'Fitness', 'Health', 'Relationships', 'Work', 'Education', 
      'Transportation', 'Communication', 'Entertainment', 'Shopping'
    ]
  }

  // Handle clicking outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowTopicSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting quiz generation...');
      console.log('📋 Form data:', formData);

      // Call the API with the correct structure
      const quizData = await generateQuiz({
        topic: formData.topic.trim(),
        difficulty: formData.difficulty,
        num_questions: formData.num_questions,
        duration: formData.duration,
        tenant_id: user?.tenant_id || 'default',
        token: token || undefined
      });

      console.log('✅ Quiz generated successfully:', quizData);

      // Navigate to the quiz taking page
      if (quizData && quizData.id) {
        router.push(`/take-quiz/${quizData.id}`);
      } else {
        throw new Error('Quiz generation failed - no quiz ID returned');
      }

    } catch (error) {
      console.error('❌ Quiz generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_questions' || name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleTopicSelect = (topic: string) => {
    setFormData(prev => ({ ...prev, topic }));
    setShowTopicSuggestions(false);
  };

  const difficultyColors = {
    easy: 'from-green-400 to-emerald-500',
    medium: 'from-yellow-400 to-orange-500',
    hard: 'from-red-400 to-pink-500'
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Create Your Quiz
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Let AI generate personalized questions for any topic you want to learn about
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Topic Input Section */}
        <div className="space-y-4">
          <div className="text-center">
            <label htmlFor="topic" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              What would you like to learn about?
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter any topic that interests you
            </p>
          </div>
          
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              onFocus={() => setShowTopicSuggestions(true)}
              className="w-full px-6 py-4 pl-16 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-lg"
              placeholder="e.g., Space Travel, Cooking, JavaScript, Your Hobby..."
              required
            />
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <button
              type="button"
              onClick={() => setShowTopicSuggestions(!showTopicSuggestions)}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Topic Suggestions Dropdown */}
          {showTopicSuggestions && (
            <div ref={dropdownRef} className="absolute z-50 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(topicSuggestions).map(([category, topics]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b-2 border-gray-200 dark:border-gray-600 pb-2">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {topics.map((topic) => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => handleTopicSelect(topic)}
                            className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-all duration-200 hover:shadow-md"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Custom topic message */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Pro Tip:</strong> You can enter any topic! The AI will generate relevant questions for whatever you choose.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Difficulty */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
              Difficulty Level
            </label>
            <div className="space-y-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    formData.difficulty === level
                      ? `border-transparent bg-gradient-to-r ${difficultyColors[level as keyof typeof difficultyColors]} text-white shadow-lg`
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {level === 'easy' && '😊'}
                      {level === 'medium' && '😐'}
                      {level === 'hard' && '😰'}
                    </div>
                    <div className="text-sm font-semibold capitalize">{level}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                Number of Questions
              </label>
              <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">
                {formData.num_questions}
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                id="num_questions"
                name="num_questions"
                min="1"
                max="15"
                value={formData.num_questions}
                onChange={handleInputChange}
                className="w-full slider"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
              </div>
            </div>
          </div>

          {/* Time Limit */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                Time Limit
              </label>
              <div className="text-3xl font-bold text-purple-500 dark:text-purple-400">
                {formData.duration}m
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                id="duration"
                name="duration"
                min="5"
                max="60"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full slider"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                <span>5m</span>
                <span>15m</span>
                <span>30m</span>
                <span>60m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading || !formData.topic.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-6 px-8 rounded-2xl shadow-xl transform hover:-translate-y-1 disabled:transform-none transition-all duration-300 text-xl font-semibold w-full max-w-md mx-auto"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Quiz...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Quiz with AI</span>
              </div>
            )}
          </button>
        </div>

        {/* Smart Question System Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center space-x-3 mb-3">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Smart Question System</h3>
          </div>
          <p className="text-green-700 dark:text-green-300">
            Our AI analyzes your topic and generates engaging, educational questions tailored to your chosen difficulty level. Each question includes detailed explanations to help you learn.
          </p>
        </div>

        {/* Popular Topics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
            Popular Topics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Space Exploration', 'JavaScript', 'Cooking', 'History', 'Science', 'Art', 'Music', 'Sports'].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicSelect(topic)}
                className="p-3 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
} 
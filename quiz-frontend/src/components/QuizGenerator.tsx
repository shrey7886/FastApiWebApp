'use client'

import { useState, useEffect, useRef } from 'react'
import { generateQuiz } from './api'
import { useUser } from './UserContext'

interface QuizGeneratorProps {
  onQuizGenerated: (quiz: any) => void
}

export default function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const { user, token } = useUser();
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
  const [searchQuery, setSearchQuery] = useState('')
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
    e.preventDefault()
    
    // Check if user is logged in
    if (!user || !token) {
      setError('Please log in to generate quizzes')
      return
    }
    
    // Validate topic input
    if (!formData.topic.trim()) {
      setError('Please enter a topic for your quiz')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const quiz = await generateQuiz({
        topic: formData.topic,
        difficulty: formData.difficulty,
        num_questions: formData.num_questions,
        duration: formData.duration,
        tenant_id: formData.tenant_id,
        token
      })
      onQuizGenerated(quiz)
    } catch (err: any) {
      console.error('Quiz generation error:', err)
      setError(err.message || 'Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_questions' || name === 'duration' ? parseInt(value) : value
    }))
    
    // Clear error when user starts typing
    if (name === 'topic' && error) {
      setError(null)
    }
  }

  const handleTopicSelect = (topic: string) => {
    setFormData(prev => ({ ...prev, topic }))
    setShowTopicSuggestions(false)
    setSearchQuery('')
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowTopicSuggestions(true)
  }

  // Filter topics based on search query
  const filteredTopics = Object.entries(topicSuggestions).reduce((acc, [category, topics]) => {
    const filtered = topics.filter(topic => 
      topic.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, string[]>)

  const difficultyColors = {
    easy: 'from-green-500 to-emerald-500',
    medium: 'from-yellow-500 to-orange-500',
    hard: 'from-red-500 to-pink-500'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* User Info Display */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Organization:</strong> {user.tenant_id}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>User:</strong> {user.first_name || user.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Ready to generate questions using AI models
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Topic Input */}
      <div className="space-y-3">
        <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Quiz Topic <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            onFocus={() => setShowTopicSuggestions(true)}
            className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Enter any topic (e.g., 'Dogs', 'Space Travel', 'Cooking', 'Video Games')"
            required
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => setShowTopicSuggestions(!showTopicSuggestions)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Topic Suggestions Dropdown */}
        {showTopicSuggestions && (
          <div ref={dropdownRef} className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg max-h-96 overflow-y-auto">
            <div className="p-4">
              {/* Search within suggestions */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search topics..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(filteredTopics).map(([category, topics]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {topics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleTopicSelect(topic)}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all duration-200"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Custom topic message */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> You can enter any topic! The AI will generate relevant questions for whatever you choose.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-3">
        <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                formData.difficulty === level
                  ? `border-transparent bg-gradient-to-r ${difficultyColors[level as keyof typeof difficultyColors]} text-white shadow-lg`
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">
                  {level === 'easy' && '😊'}
                  {level === 'medium' && '😐'}
                  {level === 'hard' && '😰'}
                </div>
                <div className="text-sm font-medium capitalize">{level}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Number of Questions */}
      <div className="space-y-3">
        <label htmlFor="num_questions" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Number of Questions: <span className="text-blue-500 dark:text-blue-400 font-bold">{formData.num_questions}</span>
        </label>
        <div className="relative">
          <input
            type="range"
            id="num_questions"
            name="num_questions"
            min="1"
            max="15"
            value={formData.num_questions}
            onChange={handleInputChange}
            className="w-full h-3 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-700 dark:to-indigo-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>1</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Time Limit: <span className="text-blue-500 dark:text-blue-400 font-bold">{formData.duration} minutes</span>
        </label>
        <div className="relative">
          <input
            type="range"
            id="duration"
            name="duration"
            min="5"
            max="60"
            step="5"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-full h-3 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-700 dark:to-indigo-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>5m</span>
            <span>15m</span>
            <span>30m</span>
            <span>60m</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Submit button */}
      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
        disabled={loading || !formData.topic.trim() || !user}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Generating Quiz with AI...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Quiz with AI
          </div>
        )}
      </button>

      {/* Dynamic Topic Ideas */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">💡 Enter Any Topic:</p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            <strong>Examples:</strong> Try any topic you're interested in!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['Your Hobby', 'Favorite Movie', 'Dream Job', 'Pet Name', 'Home Town', 'Favorite Food', 'School Subject', 'Travel Destination', 'Sports Team', 'Music Genre', 'Book Title', 'Scientific Concept'].map((suggestion) => (
              <div
                key={suggestion}
                className="px-2 py-1 text-xs bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 rounded-lg text-center"
              >
                {suggestion}
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
            💡 The AI will generate questions about whatever topic you choose!
          </p>
        </div>
      </div>
    </form>
  )
} 
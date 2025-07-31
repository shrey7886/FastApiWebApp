'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { submitQuiz } from './api'

interface Question {
  id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

interface QuizWithQuestions {
  id: number
  title: string
  questions: Question[]
}

interface QuizDisplayProps {
  quiz: QuizWithQuestions
  tenant_id: string
  token?: string
}

export default function QuizDisplay({ quiz, tenant_id, token }: QuizDisplayProps) {
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [similarQuestions, setSimilarQuestions] = useState<any[]>([])

  const handleOptionSelect = (questionId: number, option: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const formattedAnswers: { [key: string]: string } = {}
      Object.entries(userAnswers).forEach(([qid, ans]) => {
        formattedAnswers[qid] = ans
      })
      const res = await submitQuiz({
        quiz_id: quiz.id.toString(),
        answers: formattedAnswers,
        time_taken: 0,
        tenant_id,
        token
      })
      setResult(res.result)
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Results Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6 shadow-lg">
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Quiz Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400">Here are your results</p>
        </div>

        {/* Score Card */}
        <div className="card">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold gradient-text mb-2">
              {result.score}/{result.total_questions}
            </div>
            <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {result.grade}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-400">
              {result.feedback}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${(result.score / result.total_questions) * 100}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.correct_answers}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Correct</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.total_questions - result.correct_answers}</div>
              <div className="text-sm text-red-700 dark:text-red-300">Incorrect</div>
            </div>
          </div>
        </div>

        {/* Question Details */}
        <div className="card">
          <h3 className="text-xl font-bold mb-6 gradient-text">Question Analysis</h3>
          <div className="space-y-4">
            {result.question_details.map((qd: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  qd.is_correct 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    qd.is_correct 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {qd.is_correct ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Question {idx + 1}: {qd.question_text}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Your answer:</span>
                        <span className={`ml-2 ${qd.is_correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {qd.user_answer}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Correct answer:</span>
                        <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                          {qd.correct_answer}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Questions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold gradient-text">Similar Questions</h3>
            <button
              className="btn-secondary"
              onClick={() => window.location.reload()}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </div>
            </button>
          </div>
          
          {similarQuestions.length > 0 ? (
            <div className="space-y-4">
              {similarQuestions.map((q, idx) => (
                <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Similar Question {idx + 1}: {q.question_text}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">A. {q.option_a}</div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">B. {q.option_b}</div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">C. {q.option_c}</div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">D. {q.option_d}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Click &quot;Refresh&quot; to load similar questions for practice
              </p>
            </div>
          )}
        </div>

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
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Quiz Header */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
            <span className="text-xl">📝</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">{quiz.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {quiz.questions.length} questions • Select your answers below
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {question.question_text}
                </h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'A', value: question.option_a },
                    { key: 'B', value: question.option_b },
                    { key: 'C', value: question.option_c },
                    { key: 'D', value: question.option_d }
                  ].map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                        userAnswers[question.id] === option.value
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 border-transparent text-white shadow-lg' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                      onClick={() => handleOptionSelect(question.id, option.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          userAnswers[question.id] === option.value
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {option.key}
                        </div>
                        <span className="font-medium">{option.value}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="card">
        <div className="text-center">
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Questions answered: {Object.keys(userAnswers).length} / {quiz.questions.length}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(userAnswers).length / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <button
            className="btn-primary w-full relative overflow-hidden"
            onClick={handleSubmit}
            disabled={submitting || Object.keys(userAnswers).length < quiz.questions.length}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Submitting Quiz...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Quiz
              </div>
            )}
          </button>
          
          {Object.keys(userAnswers).length < quiz.questions.length && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Please answer all questions before submitting
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
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
    </div>
  )
} 
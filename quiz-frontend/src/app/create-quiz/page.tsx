'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Brain, 
  Target, 
  Clock, 
  Hash, 
  Zap,
  Sparkles,
  CheckCircle,
  Loader2
} from 'lucide-react';

const CreateQuizPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'medium',
    numQuestions: 5,
    duration: 10
  });
  const [generating, setGenerating] = useState(false);
  const [suggestedTopics] = useState([
    'Space Travel', 'Cooking', 'Video Games', 'Ancient Egypt', 
    'Rock Music', 'Superheroes', 'Dogs', 'Programming',
    'Climate Change', 'Art History', 'Sports', 'Technology'
  ]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateQuiz = async () => {
    if (!formData.topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: formData.topic.trim(),
          difficulty: formData.difficulty,
          num_questions: formData.numQuestions,
          duration: formData.duration,
          tenant_id: 'demo'
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/take-quiz/${data.quiz_id}`);
      } else {
        alert('Failed to generate quiz. Please try again.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Quiz
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose any topic and let our AI generate unique, engaging questions just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="space-y-6">
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Sparkles className="inline h-4 w-4 mr-2 text-blue-600" />
                    What topic would you like to learn about?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Space Travel, Cooking, Video Games, Ancient Egypt..."
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  />
                </div>

                {/* Quiz Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Target className="inline h-4 w-4 mr-2 text-green-600" />
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Hash className="inline h-4 w-4 mr-2 text-purple-600" />
                      Questions
                    </label>
                    <select
                      value={formData.numQuestions}
                      onChange={(e) => handleInputChange('numQuestions', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Clock className="inline h-4 w-4 mr-2 text-orange-600" />
                      Time Limit
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateQuiz}
                  disabled={generating || !formData.topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Generate Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Topics */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                Popular Topics
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {suggestedTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleInputChange('topic', topic)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg transition-all duration-200 text-left"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Why Choose AI-Generated Quizzes?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-green-300" />
                  <p className="text-sm">Unique questions every time</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-green-300" />
                  <p className="text-sm">Adaptive difficulty levels</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-green-300" />
                  <p className="text-sm">Instant generation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-green-300" />
                  <p className="text-sm">Detailed explanations</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Tips</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Be specific with your topic for better questions</li>
                <li>• Try different difficulty levels to challenge yourself</li>
                <li>• Take your time to read each question carefully</li>
                <li>• Review explanations to learn from mistakes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage; 
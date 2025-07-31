// quiz-frontend/src/components/api.ts

// Use Next.js API routes (works on Vercel)
const API_BASE = '/api';

interface GenerateQuizParams {
  topic: string;
  difficulty: string;
  num_questions: number;
  duration: number;
  tenant_id: string;
  token?: string;
}

interface FetchQuizParams {
  quiz_id: number;
  tenant_id: string;
  token?: string;
}

interface SubmitQuizParams {
  quiz_id: number;
  user_answers: Record<string, string>;
  tenant_id: string;
  token?: string;
}

interface FetchSimilarQuestionsParams {
  quiz_id: number;
  tenant_id: string;
  token?: string;
}

export async function generateQuiz({ topic, difficulty, num_questions, duration, tenant_id, token }: GenerateQuizParams) {
  console.log('🚀 Calling generateQuiz API with:', { topic, difficulty, num_questions, duration, tenant_id });
  
  const requestBody = { topic, difficulty, num_questions, duration, tenant_id };
  console.log('📤 Request body being sent:', requestBody);
  
  try {
    const res = await fetch(`${API_BASE}/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 API Response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error('❌ API Error:', res.status, errorData);
      throw new Error(`Failed to generate quiz: ${res.status} - ${errorData}`);
    }
    
    const data = await res.json();
    console.log('✅ Quiz generated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error:', error);
    throw new Error('Failed to connect to quiz generation service');
  }
}

export async function fetchQuiz({ quiz_id, tenant_id, token }: FetchQuizParams) {
  const res = await fetch(`${API_BASE}/quizzes/${quiz_id}?tenant_id=${tenant_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch quiz');
  return res.json();
}

export async function submitQuiz({ quiz_id, user_answers, tenant_id, token }: SubmitQuizParams) {
  const res = await fetch(`${API_BASE}/submit-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ quiz_id, user_answers, tenant_id })
  });
  if (!res.ok) throw new Error('Failed to submit quiz');
  return res.json();
}

export async function fetchSimilarQuestions({ quiz_id, tenant_id, token }: FetchSimilarQuestionsParams) {
  const res = await fetch(`${API_BASE}/quizzes/${quiz_id}/similar-questions?tenant_id=${tenant_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch similar questions');
  return res.json();
}

export async function fetchQuestionHistory({ tenant_id, topic, limit, token }: {
  tenant_id: string;
  topic?: string;
  limit?: number;
  token?: string;
}) {
  const params = new URLSearchParams();
  params.append('tenant_id', tenant_id);
  if (topic) params.append('topic', topic);
  if (limit) params.append('limit', limit.toString());
  
  const res = await fetch(`${API_BASE}/question-history?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch question history');
  return res.json();
} 
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
  const res = await fetch(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ topic, difficulty, num_questions, duration, tenant_id })
  });
  if (!res.ok) throw new Error('Failed to generate quiz');
  return res.json();
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
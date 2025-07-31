// API configuration
const API_BASE = '/api';

// Authentication
export async function login(credentials: { email: string; password: string; tenant_id: string }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function signup(userData: { email: string; password: string; first_name: string; last_name: string; tenant_id: string }) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}

// Quiz generation
export async function generateQuiz(formData: {
  topic: string;
  difficulty: string;
  num_questions: number;
  duration: number;
  tenant_id: string;
  token?: string;
}) {
  console.log('🚀 Generating quiz with data:', formData);
  
  try {
    const res = await fetch(`${API_BASE}/generate-quiz`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(formData.token && { Authorization: `Bearer ${formData.token}` })
      },
      body: JSON.stringify(formData)
    });
    
    console.log('📡 Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`Failed to generate quiz: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('✅ Quiz generated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    throw error;
  }
}

// Quiz operations
export async function fetchQuiz(quizId: string, tenant_id: string, token?: string) {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}?tenant_id=${tenant_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch quiz');
  return res.json();
}

export async function submitQuiz(submission: {
  quiz_id: string;
  answers: Record<string, string>;
  time_taken: number;
  tenant_id: string;
  token?: string;
}) {
  const res = await fetch(`${API_BASE}/submit-quiz`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(submission.token && { Authorization: `Bearer ${submission.token}` })
    },
    body: JSON.stringify(submission)
  });
  if (!res.ok) throw new Error('Failed to submit quiz');
  return res.json();
}

// Analytics and history
export async function fetchAnalytics(tenant_id: string, token?: string) {
  const res = await fetch(`${API_BASE}/analytics/user?tenant_id=${tenant_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchQuizHistory(tenant_id: string, limit?: number, token?: string) {
  const params = new URLSearchParams();
  params.append('tenant_id', tenant_id);
  if (limit) params.append('limit', limit.toString());
  
  const res = await fetch(`${API_BASE}/quiz-history?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch quiz history');
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

// Health check
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
} 
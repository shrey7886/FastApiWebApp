import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Set Gemini API key for chatbot
process.env.GEMINI_API_KEY = 'AIzaSyDu1_dNgqt4kjw5J2VdBmETv_RLJBBTzS0';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userContext } = body;

    console.log('🤖 Chatbot request received:', { message, userContext });

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try to use Google Gemini first
    try {
      const geminiResponse = await generateWithGemini(message, userContext);
      console.log('✅ Gemini response generated successfully');
      return NextResponse.json({ 
        response: geminiResponse,
        model: 'Google Gemini'
      });
    } catch (error) {
      console.error('❌ Gemini failed, using fallback:', error);
      // Use intelligent fallback response
      const fallbackResponse = generateFallbackResponse(message, userContext);
      return NextResponse.json({ 
        response: fallbackResponse,
        model: 'Fallback AI'
      });
    }

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

async function generateWithGemini(message: string, userContext?: any): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are an intelligent AI learning assistant for a quiz application. 
  
User Context: ${userContext ? JSON.stringify(userContext) : 'No specific context provided'}

User Message: "${message}"

Please provide a helpful, educational response that:
1. Addresses the user's question or concern
2. Provides educational value and learning tips
3. Encourages continued learning
4. Is conversational but professional
5. Relates to quiz-taking, learning strategies, or educational topics

Keep your response concise (2-4 sentences) and engaging.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
        topP: 0.8,
        topK: 40
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedText) {
    throw new Error('No response generated from Gemini');
  }

  return generatedText.trim();
}

function generateFallbackResponse(message: string, userContext?: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses based on user message
  if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
    return "I'm here to help you with your learning journey! I can provide study tips, explain concepts, and help you improve your quiz performance. What specific area would you like to focus on?";
  }
  
  if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
    return "To improve your performance, I recommend practicing regularly with different topics, reviewing explanations thoroughly, and focusing on areas where you scored lower. Consistent practice is key to success!";
  }
  
  if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
    return "Great question! Effective studying involves breaking down complex topics, using active recall techniques, and regular practice. Try creating quizzes on challenging subjects to reinforce your understanding.";
  }
  
  if (lowerMessage.includes('score') || lowerMessage.includes('grade')) {
    return "Your scores reflect your current understanding. Focus on learning from mistakes by reviewing explanations, and don't be discouraged by lower scores - they're opportunities for growth!";
  }
  
  if (lowerMessage.includes('topic') || lowerMessage.includes('subject')) {
    return "Exploring different topics helps build a well-rounded knowledge base. Try branching out to related subjects and see how concepts connect across disciplines.";
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('timer')) {
    return "Time management is crucial for quiz success. Practice with timed quizzes to improve your pacing, and remember that accuracy is more important than speed.";
  }
  
  if (lowerMessage.includes('difficult') || lowerMessage.includes('hard')) {
    return "Challenging questions help you grow! Don't shy away from difficult topics - they're where the most learning happens. Break them down into smaller concepts.";
  }
  
  if (lowerMessage.includes('motivation') || lowerMessage.includes('encourage')) {
    return "You're doing great! Every quiz attempt is a step toward mastery. Remember that learning is a journey, not a destination. Keep pushing forward!";
  }
  
  // Default response
  return "I'm your AI learning assistant! I can help you with study strategies, explain concepts, and provide guidance on improving your quiz performance. What would you like to know more about?";
} 
// Test script to verify quiz generation functionality
const testQuizGeneration = async () => {
  console.log('🧪 Testing Quiz Generation...');
  
  try {
    // Test 1: Generate a quiz with basic parameters
    console.log('\n📝 Test 1: Basic Quiz Generation');
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'JavaScript Programming',
        difficulty: 'medium',
        num_questions: 3,
        duration: 10,
        tenant_id: 'test-tenant'
      })
    });
    
    if (response.ok) {
      const quiz = await response.json();
      console.log('✅ Quiz generated successfully!');
      console.log('📊 Quiz Details:', {
        id: quiz.id,
        title: quiz.title,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        num_questions: quiz.num_questions,
        duration: quiz.duration,
        questions_count: quiz.questions?.length || 0
      });
      
      if (quiz.questions && quiz.questions.length > 0) {
        console.log('📋 Sample Question:', {
          question: quiz.questions[0].question_text,
          options: {
            a: quiz.questions[0].option_a,
            b: quiz.questions[0].option_b,
            c: quiz.questions[0].option_c,
            d: quiz.questions[0].option_d
          },
          correct: quiz.questions[0].correct_answer
        });
      }
    } else {
      console.error('❌ Quiz generation failed:', response.status, response.statusText);
    }
    
    // Test 2: Test with different topic
    console.log('\n📝 Test 2: Different Topic');
    const response2 = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'Space Exploration',
        difficulty: 'easy',
        num_questions: 2,
        duration: 5,
        tenant_id: 'test-tenant'
      })
    });
    
    if (response2.ok) {
      const quiz2 = await response2.json();
      console.log('✅ Second quiz generated successfully!');
      console.log('📊 Quiz Details:', {
        topic: quiz2.topic,
        difficulty: quiz2.difficulty,
        questions_count: quiz2.questions?.length || 0
      });
    } else {
      console.error('❌ Second quiz generation failed:', response2.status, response2.statusText);
    }
    
    console.log('\n🎉 Quiz generation tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testQuizGeneration = testQuizGeneration;
  console.log('🧪 Test script loaded. Run testQuizGeneration() to test quiz generation.');
} else {
  // Node.js environment
  testQuizGeneration();
} 
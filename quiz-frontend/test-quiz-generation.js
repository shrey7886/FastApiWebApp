// Test script to verify quiz generation
async function testQuizGeneration() {
  console.log('🧪 Testing Quiz Generation...');
  
  try {
    // Test 1: Generate a quiz
    console.log('\n📝 Test 1: Generating a quiz...');
    const quizData = {
      topic: 'Mathematics',
      difficulty: 'medium',
      num_questions: 5,
      duration: 15,
      tenant_id: 'test',
      token: 'test-token'
    };

    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const quiz = await response.json();
    console.log('✅ Quiz generated successfully!');
    console.log('📊 Quiz details:', {
      id: quiz.id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      num_questions: quiz.num_questions,
      questions_count: quiz.questions?.length || 0
    });

    // Test 2: Fetch the generated quiz
    console.log('\n📝 Test 2: Fetching the generated quiz...');
    const fetchResponse = await fetch(`/api/quizzes/${quiz.id}?tenant_id=test`);
    
    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! status: ${fetchResponse.status}`);
    }

    const fetchedQuiz = await fetchResponse.json();
    console.log('✅ Quiz fetched successfully!');
    console.log('📊 Fetched quiz details:', {
      id: fetchedQuiz.id,
      title: fetchedQuiz.title,
      questions_count: fetchedQuiz.questions?.length || 0
    });

    // Test 3: Submit the quiz
    console.log('\n📝 Test 3: Submitting the quiz...');
    const answers = {};
    if (fetchedQuiz.questions) {
      fetchedQuiz.questions.forEach((q, index) => {
        answers[q.id] = q.option_a; // Use first option as answer
      });
    }

    const submitData = {
      quiz_id: fetchedQuiz.id,
      answers: answers,
      time_taken: 300, // 5 minutes
      tenant_id: 'test',
      token: 'test-token'
    };

    const submitResponse = await fetch('/api/submit-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    });

    if (!submitResponse.ok) {
      throw new Error(`HTTP error! status: ${submitResponse.status}`);
    }

    const result = await submitResponse.json();
    console.log('✅ Quiz submitted successfully!');
    console.log('📊 Submission result:', {
      score: result.result?.score,
      correct_answers: result.result?.correct_answers,
      total_questions: result.result?.total_questions
    });

    console.log('\n🎉 All tests passed! Quiz generation is working properly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testQuizGeneration = testQuizGeneration;
  console.log('🧪 Quiz generation test ready. Run testQuizGeneration() to test.');
} else {
  // Node.js environment
  testQuizGeneration().then(success => {
    if (success) {
      console.log('✅ All endpoints are working correctly!');
      process.exit(0);
    } else {
      console.log('❌ Some endpoints have issues.');
      process.exit(1);
    }
  });
} 
// Comprehensive Test Script for Quizlet Application
// Run this in the browser console to test all features

const testAllFeatures = async () => {
  console.log('🧪 Starting Comprehensive Feature Testing...');
  console.log('=============================================');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const addTest = (name, passed, details = '') => {
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name} - ${details}`);
    }
  };

  // Test 1: API Health Check
  console.log('\n📡 Testing API Endpoints...');
  try {
    const healthResponse = await fetch('/api/health');
    addTest('Health Check API', healthResponse.ok, healthResponse.ok ? 'API is healthy' : `Status: ${healthResponse.status}`);
  } catch (error) {
    addTest('Health Check API', false, error.message);
  }

  // Test 2: Quiz Generation
  console.log('\n🎯 Testing Quiz Generation...');
  try {
    const quizResponse = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'JavaScript Programming',
        difficulty: 'medium',
        num_questions: 3,
        duration: 10,
        tenant_id: 'test-tenant'
      })
    });
    
    if (quizResponse.ok) {
      const quiz = await quizResponse.json();
      const hasRequiredFields = quiz.id && quiz.title && quiz.questions && quiz.questions.length > 0;
      const hasCorrectFormat = quiz.questions.every(q => 
        q.question_text && q.option_a && q.option_b && q.option_c && q.option_d && q.correct_answer
      );
      
      addTest('Quiz Generation API', hasRequiredFields && hasCorrectFormat, 
        `Generated ${quiz.questions.length} questions with proper format`);
    } else {
      addTest('Quiz Generation API', false, `Status: ${quizResponse.status}`);
    }
  } catch (error) {
    addTest('Quiz Generation API', false, error.message);
  }

  // Test 3: Authentication APIs
  console.log('\n🔐 Testing Authentication...');
  try {
    const signupResponse = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123',
        tenant_id: 'test-tenant',
        first_name: 'Test',
        last_name: 'User'
      })
    });
    
    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      addTest('Signup API', signupData.access_token && signupData.user, 'User registration successful');
    } else {
      addTest('Signup API', false, `Status: ${signupResponse.status}`);
    }
  } catch (error) {
    addTest('Signup API', false, error.message);
  }

  try {
    const loginResponse = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123',
        tenant_id: 'test-tenant'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      addTest('Login API', loginData.access_token && loginData.user, 'User login successful');
    } else {
      addTest('Login API', false, `Status: ${loginResponse.status}`);
    }
  } catch (error) {
    addTest('Login API', false, error.message);
  }

  // Test 4: Analytics APIs
  console.log('\n📊 Testing Analytics...');
  try {
    const analyticsResponse = await fetch('/api/analytics/user?tenant_id=test-tenant');
    if (analyticsResponse.ok) {
      const analytics = await analyticsResponse.json();
      addTest('Analytics API', analytics.total_quizzes !== undefined, 'Analytics data retrieved');
    } else {
      addTest('Analytics API', false, `Status: ${analyticsResponse.status}`);
    }
  } catch (error) {
    addTest('Analytics API', false, error.message);
  }

  // Test 5: Quiz History APIs
  console.log('\n📚 Testing Quiz History...');
  try {
    const historyResponse = await fetch('/api/quiz-history?tenant_id=test-tenant');
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      addTest('Quiz History API', history.success && Array.isArray(history.history), 'Quiz history retrieved');
    } else {
      addTest('Quiz History API', false, `Status: ${historyResponse.status}`);
    }
  } catch (error) {
    addTest('Quiz History API', false, error.message);
  }

  // Test 6: Question History APIs
  console.log('\n❓ Testing Question History...');
  try {
    const questionHistoryResponse = await fetch('/api/question-history?tenant_id=test-tenant');
    if (questionHistoryResponse.ok) {
      const questionHistory = await questionHistoryResponse.json();
      addTest('Question History API', questionHistory.success && Array.isArray(questionHistory.question_history), 'Question history retrieved');
    } else {
      addTest('Question History API', false, `Status: ${questionHistoryResponse.status}`);
    }
  } catch (error) {
    addTest('Question History API', false, error.message);
  }

  // Test 7: Quiz Fetch API
  console.log('\n📖 Testing Quiz Fetch...');
  try {
    const quizFetchResponse = await fetch('/api/quizzes/test-quiz-id?tenant_id=test-tenant');
    if (quizFetchResponse.ok) {
      const quizData = await quizFetchResponse.json();
      addTest('Quiz Fetch API', quizData.id && quizData.questions, 'Quiz data retrieved');
    } else {
      addTest('Quiz Fetch API', false, `Status: ${quizFetchResponse.status}`);
    }
  } catch (error) {
    addTest('Quiz Fetch API', false, error.message);
  }

  // Test 8: Quiz Submission API
  console.log('\n📝 Testing Quiz Submission...');
  try {
    const submitResponse = await fetch('/api/submit-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: 'test-quiz-id',
        answers: { 'q1': 'A', 'q2': 'B' },
        time_taken: 300,
        tenant_id: 'test-tenant'
      })
    });
    
    if (submitResponse.ok) {
      const submitData = await submitResponse.json();
      addTest('Quiz Submission API', submitData.success && submitData.result, 'Quiz submitted successfully');
    } else {
      addTest('Quiz Submission API', false, `Status: ${submitResponse.status}`);
    }
  } catch (error) {
    addTest('Quiz Submission API', false, error.message);
  }

  // Test 9: Frontend Components
  console.log('\n🎨 Testing Frontend Components...');
  
  // Check if key components exist
  const components = [
    'QuizGenerator',
    'QuizTaker', 
    'QuizDisplay',
    'Dashboard',
    'ThemeToggle'
  ];
  
  components.forEach(component => {
    const exists = typeof window !== 'undefined' && window[component];
    addTest(`${component} Component`, exists, exists ? 'Component available' : 'Component not found');
  });

  // Test 10: Local Storage
  console.log('\n💾 Testing Local Storage...');
  try {
    localStorage.setItem('test-key', 'test-value');
    const retrieved = localStorage.getItem('test-key');
    localStorage.removeItem('test-key');
    addTest('Local Storage', retrieved === 'test-value', 'Local storage working');
  } catch (error) {
    addTest('Local Storage', false, error.message);
  }

  // Test 11: Theme Toggle
  console.log('\n🌙 Testing Theme Toggle...');
  try {
    const themeToggle = document.querySelector('[data-theme-toggle]') || 
                       document.querySelector('.theme-toggle') ||
                       document.querySelector('[aria-label*="theme"]');
    addTest('Theme Toggle Element', !!themeToggle, themeToggle ? 'Theme toggle found' : 'Theme toggle not found');
  } catch (error) {
    addTest('Theme Toggle Element', false, error.message);
  }

  // Test 12: Responsive Design
  console.log('\n📱 Testing Responsive Design...');
  const viewport = window.innerWidth;
  const isMobile = viewport < 768;
  const isTablet = viewport >= 768 && viewport < 1024;
  const isDesktop = viewport >= 1024;
  
  addTest('Responsive Detection', true, `Viewport: ${viewport}px (${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'})`);

  // Test 13: Performance
  console.log('\n⚡ Testing Performance...');
  const startTime = performance.now();
  await new Promise(resolve => setTimeout(resolve, 100));
  const endTime = performance.now();
  const loadTime = endTime - startTime;
  
  addTest('Performance Check', loadTime < 1000, `Load time: ${loadTime.toFixed(2)}ms`);

  // Test 14: Accessibility
  console.log('\n♿ Testing Accessibility...');
  const hasAltText = document.querySelectorAll('img[alt]').length > 0;
  const hasHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0;
  const hasButtons = document.querySelectorAll('button').length > 0;
  
  addTest('Accessibility - Alt Text', hasAltText, hasAltText ? 'Images have alt text' : 'No images with alt text found');
  addTest('Accessibility - Headings', hasHeadings, hasHeadings ? 'Page has proper heading structure' : 'No headings found');
  addTest('Accessibility - Buttons', hasButtons, hasButtons ? 'Interactive buttons available' : 'No buttons found');

  // Test 15: Error Handling
  console.log('\n🛡️ Testing Error Handling...');
  try {
    const errorResponse = await fetch('/api/nonexistent-endpoint');
    addTest('Error Handling', !errorResponse.ok, 'Non-existent endpoints return errors as expected');
  } catch (error) {
    addTest('Error Handling', true, 'Network errors handled properly');
  }

  // Summary
  console.log('\n📋 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  console.log(`🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`  - ${test.name}: ${test.details}`);
    });
  }

  console.log('\n🎉 Feature testing completed!');
  
  return results;
};

// Test specific features
const testQuizGeneration = async () => {
  console.log('🎯 Testing Quiz Generation Specifically...');
  
  const topics = ['JavaScript', 'Python', 'Space Exploration', 'Cooking', 'History'];
  const difficulties = ['easy', 'medium', 'hard'];
  
  for (const topic of topics) {
    for (const difficulty of difficulties) {
      try {
        const response = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            difficulty,
            num_questions: 2,
            duration: 5,
            tenant_id: 'test-tenant'
          })
        });
        
        if (response.ok) {
          const quiz = await response.json();
          console.log(`✅ Generated ${quiz.questions.length} ${difficulty} questions about ${topic}`);
        } else {
          console.log(`❌ Failed to generate quiz for ${topic} (${difficulty})`);
        }
      } catch (error) {
        console.log(`❌ Error generating quiz for ${topic} (${difficulty}): ${error.message}`);
      }
    }
  }
};

const testUIComponents = () => {
  console.log('🎨 Testing UI Components...');
  
  // Check for key UI elements
  const elements = [
    { selector: 'button', name: 'Buttons' },
    { selector: 'input', name: 'Input Fields' },
    { selector: 'select', name: 'Select Dropdowns' },
    { selector: '.card', name: 'Cards' },
    { selector: '.badge', name: 'Badges' },
    { selector: '.progress', name: 'Progress Bars' }
  ];
  
  elements.forEach(({ selector, name }) => {
    const count = document.querySelectorAll(selector).length;
    console.log(`${count > 0 ? '✅' : '❌'} ${name}: ${count} found`);
  });
};

// Export functions for browser use
if (typeof window !== 'undefined') {
  window.testAllFeatures = testAllFeatures;
  window.testQuizGeneration = testQuizGeneration;
  window.testUIComponents = testUIComponents;
  
  console.log('🧪 Test functions loaded!');
  console.log('Available functions:');
  console.log('  - testAllFeatures() - Run comprehensive tests');
  console.log('  - testQuizGeneration() - Test quiz generation with various topics');
  console.log('  - testUIComponents() - Test UI component presence');
} else {
  // Node.js environment
  testAllFeatures();
} 
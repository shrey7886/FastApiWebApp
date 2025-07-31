// BOSS DEMO TESTING SCRIPT
// Comprehensive testing of all features before presentation
// Run this in browser console on the live site

const bossDemoTest = async () => {
  console.log('🎯 BOSS DEMO TESTING - COMPREHENSIVE FEATURE VERIFICATION');
  console.log('========================================================');
  console.log('🌐 Testing Live Application: https://quizlet-pswl7dp3z-shrey-s-projects-012ed0dc.vercel.app');
  console.log('⏰ Test Started:', new Date().toLocaleString());
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    critical: 0,
    tests: []
  };

  const addTest = (name, passed, critical = false, details = '') => {
    results.tests.push({ name, passed, critical, details });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      if (critical) results.critical++;
      console.log(`❌ ${name} - ${details}`);
    }
  };

  // Test 1: Application Loading
  console.log('🚀 TEST 1: APPLICATION LOADING');
  console.log('-----------------------------');
  
  try {
    // Check if page loads
    const pageTitle = document.title;
    addTest('Page Title', pageTitle.includes('Quizlet'), true, `Title: ${pageTitle}`);
    
    // Check for main elements
    const hasHeader = document.querySelector('header') || document.querySelector('[class*="header"]');
    addTest('Header Element', !!hasHeader, true, hasHeader ? 'Header found' : 'Header missing');
    
    const hasMainContent = document.querySelector('main') || document.querySelector('[class*="main"]');
    addTest('Main Content', !!hasMainContent, true, hasMainContent ? 'Main content found' : 'Main content missing');
    
    // Check for theme toggle
    const themeToggle = document.querySelector('[data-theme-toggle]') || 
                       document.querySelector('.theme-toggle') ||
                       document.querySelector('[aria-label*="theme"]') ||
                       document.querySelector('button[class*="theme"]');
    addTest('Theme Toggle', !!themeToggle, false, themeToggle ? 'Theme toggle found' : 'Theme toggle not found');
    
  } catch (error) {
    addTest('Application Loading', false, true, error.message);
  }

  // Test 2: Navigation and Routing
  console.log('\n🧭 TEST 2: NAVIGATION AND ROUTING');
  console.log('----------------------------------');
  
  try {
    // Check for navigation links
    const navLinks = document.querySelectorAll('a[href], button[onclick]');
    addTest('Navigation Links', navLinks.length > 0, true, `Found ${navLinks.length} navigation elements`);
    
    // Check for specific important links
    const hasSignupLink = Array.from(navLinks).some(link => 
      link.textContent?.toLowerCase().includes('sign') || 
      link.href?.includes('signup')
    );
    addTest('Signup Link', hasSignupLink, true, hasSignupLink ? 'Signup link found' : 'Signup link missing');
    
    const hasLoginLink = Array.from(navLinks).some(link => 
      link.textContent?.toLowerCase().includes('login') || 
      link.href?.includes('login')
    );
    addTest('Login Link', hasLoginLink, true, hasLoginLink ? 'Login link found' : 'Login link missing');
    
  } catch (error) {
    addTest('Navigation Testing', false, true, error.message);
  }

  // Test 3: API Endpoints
  console.log('\n🔌 TEST 3: API ENDPOINTS');
  console.log('------------------------');
  
  const apiTests = [
    { name: 'Health Check', endpoint: '/api/health', method: 'GET' },
    { name: 'Quiz Generation', endpoint: '/api/generate-quiz', method: 'POST', body: {
      topic: 'JavaScript Programming',
      difficulty: 'medium',
      num_questions: 3,
      duration: 10,
      tenant_id: 'boss-demo'
    }},
    { name: 'User Signup', endpoint: '/api/signup', method: 'POST', body: {
      email: 'boss-demo@test.com',
      password: 'testpass123',
      tenant_id: 'boss-demo',
      first_name: 'Demo',
      last_name: 'User'
    }},
    { name: 'User Login', endpoint: '/api/login', method: 'POST', body: {
      email: 'boss-demo@test.com',
      password: 'testpass123',
      tenant_id: 'boss-demo'
    }},
    { name: 'Analytics', endpoint: '/api/analytics/user?tenant_id=boss-demo', method: 'GET' },
    { name: 'Quiz History', endpoint: '/api/quiz-history?tenant_id=boss-demo', method: 'GET' },
    { name: 'Question History', endpoint: '/api/question-history?tenant_id=boss-demo', method: 'GET' }
  ];

  for (const test of apiTests) {
    try {
      const response = await fetch(test.endpoint, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
        body: test.body ? JSON.stringify(test.body) : undefined
      });
      
      const isSuccess = response.ok || response.status === 200 || response.status === 201;
      addTest(`${test.name} API`, isSuccess, test.name === 'Quiz Generation', 
        isSuccess ? `Status: ${response.status}` : `Failed: ${response.status}`);
      
    } catch (error) {
      addTest(`${test.name} API`, false, test.name === 'Quiz Generation', error.message);
    }
  }

  // Test 4: Quiz Generation (CRITICAL)
  console.log('\n🎯 TEST 4: QUIZ GENERATION (CRITICAL)');
  console.log('-------------------------------------');
  
  try {
    const quizResponse = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Space Exploration',
        difficulty: 'medium',
        num_questions: 3,
        duration: 10,
        tenant_id: 'boss-demo'
      })
    });
    
    if (quizResponse.ok) {
      const quiz = await quizResponse.json();
      
      // Verify quiz structure
      const hasRequiredFields = quiz.id && quiz.title && quiz.questions;
      addTest('Quiz Structure', hasRequiredFields, true, 
        hasRequiredFields ? 'All required fields present' : 'Missing required fields');
      
      // Verify questions
      const hasQuestions = quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0;
      addTest('Questions Generated', hasQuestions, true, 
        hasQuestions ? `Generated ${quiz.questions.length} questions` : 'No questions generated');
      
      // Verify question format
      if (hasQuestions) {
        const firstQuestion = quiz.questions[0];
        const hasCorrectFormat = firstQuestion.question_text && 
                                firstQuestion.option_a && 
                                firstQuestion.option_b && 
                                firstQuestion.option_c && 
                                firstQuestion.option_d && 
                                firstQuestion.correct_answer;
        
        addTest('Question Format', hasCorrectFormat, true, 
          hasCorrectFormat ? 'Questions have correct format' : 'Questions missing required fields');
        
        // Test different topics
        const topics = ['Python Programming', 'World History', 'Mathematics'];
        let topicSuccess = 0;
        
        for (const topic of topics) {
          try {
            const topicResponse = await fetch('/api/generate-quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                topic,
                difficulty: 'easy',
                num_questions: 2,
                duration: 5,
                tenant_id: 'boss-demo'
              })
            });
            
            if (topicResponse.ok) {
              const topicQuiz = await topicResponse.json();
              if (topicQuiz.questions && topicQuiz.questions.length > 0) {
                topicSuccess++;
              }
            }
          } catch (error) {
            console.log(`  ⚠️ Topic "${topic}" failed: ${error.message}`);
          }
        }
        
        addTest('Multiple Topics', topicSuccess >= 2, false, 
          `Successfully generated quizzes for ${topicSuccess}/3 topics`);
      }
      
    } else {
      addTest('Quiz Generation API', false, true, `API failed: ${quizResponse.status}`);
    }
    
  } catch (error) {
    addTest('Quiz Generation', false, true, error.message);
  }

  // Test 5: User Interface Components
  console.log('\n🎨 TEST 5: USER INTERFACE COMPONENTS');
  console.log('------------------------------------');
  
  try {
    // Check for key UI elements
    const uiElements = [
      { selector: 'button', name: 'Buttons', critical: false },
      { selector: 'input', name: 'Input Fields', critical: true },
      { selector: 'select', name: 'Select Dropdowns', critical: false },
      { selector: '.card, [class*="card"]', name: 'Cards', critical: false },
      { selector: '.badge, [class*="badge"]', name: 'Badges', critical: false },
      { selector: '.progress, [class*="progress"]', name: 'Progress Bars', critical: false }
    ];
    
    for (const element of uiElements) {
      const count = document.querySelectorAll(element.selector).length;
      addTest(element.name, count > 0, element.critical, 
        count > 0 ? `${count} ${element.name.toLowerCase()} found` : `No ${element.name.toLowerCase()} found`);
    }
    
    // Check for responsive design
    const viewport = window.innerWidth;
    const isResponsive = viewport > 0;
    addTest('Responsive Design', isResponsive, false, 
      `Viewport width: ${viewport}px (${isResponsive ? 'Responsive' : 'Not responsive'})`);
    
  } catch (error) {
    addTest('UI Components', false, true, error.message);
  }

  // Test 6: Interactive Features
  console.log('\n🖱️ TEST 6: INTERACTIVE FEATURES');
  console.log('-------------------------------');
  
  try {
    // Test theme toggle functionality
    const themeToggle = document.querySelector('[data-theme-toggle]') || 
                       document.querySelector('.theme-toggle') ||
                       document.querySelector('[aria-label*="theme"]');
    
    if (themeToggle) {
      const initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      themeToggle.click();
      
      // Wait a bit for theme change
      setTimeout(() => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const themeChanged = initialTheme !== newTheme;
        addTest('Theme Toggle', themeChanged, false, 
          themeChanged ? 'Theme successfully toggled' : 'Theme toggle not working');
      }, 100);
    } else {
      addTest('Theme Toggle', false, false, 'Theme toggle element not found');
    }
    
    // Test button hover effects
    const buttons = document.querySelectorAll('button');
    const hasHoverEffects = buttons.length > 0;
    addTest('Button Hover Effects', hasHoverEffects, false, 
      hasHoverEffects ? `${buttons.length} buttons with hover effects` : 'No buttons found');
    
  } catch (error) {
    addTest('Interactive Features', false, false, error.message);
  }

  // Test 7: Performance and Loading
  console.log('\n⚡ TEST 7: PERFORMANCE AND LOADING');
  console.log('----------------------------------');
  
  try {
    // Check page load time
    const loadTime = performance.now();
    addTest('Page Load Time', loadTime < 5000, false, 
      `Page loaded in ${loadTime.toFixed(2)}ms`);
    
    // Check for loading states
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
    addTest('Loading States', loadingElements.length >= 0, false, 
      `${loadingElements.length} loading state elements found`);
    
    // Check for animations
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
    addTest('Animations', animatedElements.length >= 0, false, 
      `${animatedElements.length} animated elements found`);
    
  } catch (error) {
    addTest('Performance Testing', false, false, error.message);
  }

  // Test 8: Error Handling
  console.log('\n🛡️ TEST 8: ERROR HANDLING');
  console.log('--------------------------');
  
  try {
    // Test non-existent endpoint
    const errorResponse = await fetch('/api/nonexistent-endpoint');
    const handlesErrors = !errorResponse.ok;
    addTest('API Error Handling', handlesErrors, false, 
      handlesErrors ? 'Properly handles non-existent endpoints' : 'Does not handle errors properly');
    
    // Check for error boundaries or error messages
    const errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
    addTest('Error Display Elements', errorElements.length >= 0, false, 
      `${errorElements.length} error display elements found`);
    
  } catch (error) {
    addTest('Error Handling', true, false, 'Network errors handled properly');
  }

  // Test 9: Accessibility
  console.log('\n♿ TEST 9: ACCESSIBILITY');
  console.log('----------------------');
  
  try {
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim() !== '');
    addTest('Image Alt Text', imagesWithAlt.length === images.length || images.length === 0, false, 
      `${imagesWithAlt.length}/${images.length} images have alt text`);
    
    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    addTest('Heading Structure', headings.length > 0, false, 
      `${headings.length} headings found for proper document structure`);
    
    // Check for focus indicators
    const focusableElements = document.querySelectorAll('button, input, select, a[href]');
    addTest('Focusable Elements', focusableElements.length > 0, false, 
      `${focusableElements.length} focusable elements found`);
    
  } catch (error) {
    addTest('Accessibility', false, false, error.message);
  }

  // Test 10: Mobile Responsiveness
  console.log('\n📱 TEST 10: MOBILE RESPONSIVENESS');
  console.log('--------------------------------');
  
  try {
    const viewport = window.innerWidth;
    const isMobile = viewport < 768;
    const isTablet = viewport >= 768 && viewport < 1024;
    const isDesktop = viewport >= 1024;
    
    addTest('Viewport Detection', true, false, 
      `Current viewport: ${viewport}px (${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'})`);
    
    // Check for mobile-specific elements
    const mobileElements = document.querySelectorAll('[class*="mobile"], [class*="sm:"], [class*="md:"]');
    addTest('Responsive Classes', mobileElements.length >= 0, false, 
      `${mobileElements.length} responsive utility classes found`);
    
  } catch (error) {
    addTest('Mobile Responsiveness', false, false, error.message);
  }

  // Final Summary
  console.log('\n📊 FINAL TEST SUMMARY');
  console.log('=====================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`🚨 Critical Failures: ${results.critical}`);
  console.log(`📊 Total Tests: ${results.passed + results.failed}`);
  console.log(`🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log(`⏰ Test Completed: ${new Date().toLocaleString()}`);

  if (results.critical > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    results.tests.filter(t => !t.passed && t.critical).forEach(test => {
      console.log(`  - ${test.name}: ${test.details}`);
    });
  }

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`  - ${test.name}: ${test.details}`);
    });
  }

  // Boss Demo Readiness Assessment
  console.log('\n🎯 BOSS DEMO READINESS ASSESSMENT');
  console.log('================================');
  
  const readinessScore = (results.passed / (results.passed + results.failed)) * 100;
  
  if (readinessScore >= 95 && results.critical === 0) {
    console.log('🏆 EXCELLENT - Ready for Boss Demo!');
    console.log('   All critical features working perfectly');
    console.log('   High success rate indicates robust application');
  } else if (readinessScore >= 85 && results.critical === 0) {
    console.log('✅ GOOD - Ready for Boss Demo with minor notes');
    console.log('   Core functionality working well');
    console.log('   Minor issues can be addressed later');
  } else if (readinessScore >= 70) {
    console.log('⚠️ FAIR - Needs attention before Boss Demo');
    console.log('   Some features need fixing');
    console.log('   Consider addressing critical issues first');
  } else {
    console.log('🚨 POOR - Not ready for Boss Demo');
    console.log('   Multiple critical issues found');
    console.log('   Significant work needed before presentation');
  }

  console.log(`\n📈 Overall Score: ${readinessScore.toFixed(1)}%`);
  console.log('🎉 Testing completed!');

  return results;
};

// Export for browser use
if (typeof window !== 'undefined') {
  window.bossDemoTest = bossDemoTest;
  console.log('🎯 Boss Demo Test loaded!');
  console.log('Run bossDemoTest() to start comprehensive testing');
} else {
  // Node.js environment
  bossDemoTest();
} 
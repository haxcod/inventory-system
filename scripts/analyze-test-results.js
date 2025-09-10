#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Analyze test results and generate insights
 */
function analyzeTestResults() {
  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      successRate: 0,
      executionTime: 0
    },
    failures: [],
    performance: {
      slowestTests: [],
      memoryUsage: 0,
      executionTime: 0
    },
    coverage: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    },
    recommendations: []
  };

  // Analyze test results
  analyzeJestResults(analysis);
  analyzeCoverage(analysis);
  analyzePerformance(analysis);
  generateRecommendations(analysis);

  // Write analysis report
  const reportPath = './test-analysis.json';
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  
  console.log('📊 Test analysis completed:', reportPath);
  return analysis;
}

function analyzeJestResults(analysis) {
  try {
    const resultsPath = './test-results/jest-results.json';
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      analysis.summary.totalTests = results.numTotalTests || 0;
      analysis.summary.passedTests = results.numPassedTests || 0;
      analysis.summary.failedTests = results.numFailedTests || 0;
      analysis.summary.skippedTests = results.numPendingTests || 0;
      analysis.summary.successRate = results.numTotalTests > 0 
        ? (results.numPassedTests / results.numTotalTests) * 100 
        : 0;
      analysis.summary.executionTime = results.startTime ? 
        Date.now() - results.startTime : 0;

      // Analyze failures
      if (results.testResults) {
        results.testResults.forEach(testResult => {
          if (testResult.status === 'failed') {
            analysis.failures.push({
              file: testResult.name,
              failures: testResult.assertionResults
                .filter(assertion => assertion.status === 'failed')
                .map(assertion => ({
                  title: assertion.title,
                  message: assertion.failureMessages?.[0] || 'Unknown error'
                }))
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not analyze Jest results:', error.message);
  }
}

function analyzeCoverage(analysis) {
  try {
    const coveragePath = './coverage/coverage-summary.json';
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      
      analysis.coverage.statements = coverage.total.statements.pct;
      analysis.coverage.branches = coverage.total.branches.pct;
      analysis.coverage.functions = coverage.total.functions.pct;
      analysis.coverage.lines = coverage.total.lines.pct;
    }
  } catch (error) {
    console.warn('⚠️ Could not analyze coverage:', error.message);
  }
}

function analyzePerformance(analysis) {
  try {
    const perfPath = './performance-results/performance-metrics.json';
    if (fs.existsSync(perfPath)) {
      const perf = JSON.parse(fs.readFileSync(perfPath, 'utf8'));
      
      analysis.performance.memoryUsage = perf.memoryUsage || 0;
      analysis.performance.executionTime = perf.executionTime || 0;
      analysis.performance.slowestTests = perf.slowestTests || [];
    }
  } catch (error) {
    console.warn('⚠️ Could not analyze performance:', error.message);
  }
}

function generateRecommendations(analysis) {
  const recommendations = [];

  // Success rate recommendations
  if (analysis.summary.successRate < 90) {
    recommendations.push({
      type: 'reliability',
      priority: 'high',
      message: `Test success rate is ${analysis.summary.successRate.toFixed(1)}%. Consider fixing failing tests.`,
      current: analysis.summary.successRate,
      target: 90
    });
  }

  // Coverage recommendations
  if (analysis.coverage.lines < 80) {
    recommendations.push({
      type: 'coverage',
      priority: 'medium',
      message: `Line coverage is ${analysis.coverage.lines}%. Aim for at least 80%.`,
      current: analysis.coverage.lines,
      target: 80
    });
  }

  // Performance recommendations
  if (analysis.performance.executionTime > 30000) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: `Test execution time is ${analysis.performance.executionTime}ms. Consider optimizing slow tests.`,
      current: analysis.performance.executionTime,
      target: 30000
    });
  }

  // Failure analysis
  if (analysis.failures.length > 0) {
    const commonFailures = findCommonFailures(analysis.failures);
    if (commonFailures.length > 0) {
      recommendations.push({
        type: 'stability',
        priority: 'high',
        message: `Common failure patterns detected: ${commonFailures.join(', ')}`,
        current: analysis.failures.length,
        target: 0
      });
    }
  }

  analysis.recommendations = recommendations;
}

function findCommonFailures(failures) {
  const failurePatterns = {};
  
  failures.forEach(failure => {
    failure.failures.forEach(f => {
      const pattern = f.message.split(':')[0]; // Get error type
      failurePatterns[pattern] = (failurePatterns[pattern] || 0) + 1;
    });
  });

  return Object.entries(failurePatterns)
    .filter(([pattern, count]) => count > 1)
    .map(([pattern]) => pattern);
}

// Run if called directly
if (require.main === module) {
  analyzeTestResults();
}

module.exports = { analyzeTestResults };

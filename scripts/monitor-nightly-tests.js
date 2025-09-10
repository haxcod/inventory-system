#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Monitor nightly test runs and generate alerts
 */
function monitorNightlyTests() {
  const monitoring = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    alerts: [],
    trends: {
      successRate: [],
      executionTime: [],
      coverage: [],
      failures: []
    },
    recommendations: []
  };

  // Check test results
  checkTestStatus(monitoring);
  analyzeTrends(monitoring);
  generateAlerts(monitoring);
  generateRecommendations(monitoring);

  // Write monitoring report
  const reportPath = './nightly-monitoring.json';
  fs.writeFileSync(reportPath, JSON.stringify(monitoring, null, 2));
  
  console.log('🌙 Nightly test monitoring completed:', reportPath);
  return monitoring;
}

function checkTestStatus(monitoring) {
  try {
    // Check if tests are running
    const lockFile = './test-results/.running';
    if (fs.existsSync(lockFile)) {
      monitoring.status = 'running';
      monitoring.alerts.push({
        type: 'info',
        message: 'Tests are currently running',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check latest test results
    const resultsPath = './test-results/latest-results.json';
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      if (results.success) {
        monitoring.status = 'success';
      } else {
        monitoring.status = 'failure';
        monitoring.alerts.push({
          type: 'error',
          message: `Tests failed: ${results.failures} failures`,
          timestamp: results.timestamp
        });
      }
    } else {
      monitoring.status = 'unknown';
      monitoring.alerts.push({
        type: 'warning',
        message: 'No test results found',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    monitoring.status = 'error';
    monitoring.alerts.push({
      type: 'error',
      message: `Error checking test status: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

function analyzeTrends(monitoring) {
  try {
    // Load historical data
    const historyPath = './test-results/history.json';
    if (fs.existsSync(historyPath)) {
      const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      
      // Analyze success rate trend
      if (history.length > 0) {
        const recentSuccessRates = history.slice(-7).map(h => h.successRate);
        monitoring.trends.successRate = recentSuccessRates;
        
        // Check for declining trend
        if (recentSuccessRates.length >= 3) {
          const trend = calculateTrend(recentSuccessRates);
          if (trend < -5) {
            monitoring.alerts.push({
              type: 'warning',
              message: `Success rate declining: ${trend.toFixed(1)}% over last 7 days`,
              timestamp: new Date().toISOString()
            });
          }
        }
      }

      // Analyze execution time trend
      const recentExecutionTimes = history.slice(-7).map(h => h.executionTime);
      monitoring.trends.executionTime = recentExecutionTimes;
      
      if (recentExecutionTimes.length >= 3) {
        const avgTime = recentExecutionTimes.reduce((a, b) => a + b, 0) / recentExecutionTimes.length;
        if (avgTime > 300000) { // 5 minutes
          monitoring.alerts.push({
            type: 'warning',
            message: `Average execution time is high: ${(avgTime / 1000 / 60).toFixed(1)} minutes`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not analyze trends:', error.message);
  }
}

function generateAlerts(monitoring) {
  // Check for critical failures
  if (monitoring.status === 'failure') {
    monitoring.alerts.push({
      type: 'critical',
      message: 'Nightly tests failed - immediate attention required',
      timestamp: new Date().toISOString(),
      action: 'Check test logs and fix failing tests'
    });
  }

  // Check for performance issues
  const avgExecutionTime = monitoring.trends.executionTime.length > 0 
    ? monitoring.trends.executionTime.reduce((a, b) => a + b, 0) / monitoring.trends.executionTime.length
    : 0;

  if (avgExecutionTime > 600000) { // 10 minutes
    monitoring.alerts.push({
      type: 'warning',
      message: 'Test execution time is very high',
      timestamp: new Date().toISOString(),
      action: 'Optimize slow tests or increase timeout'
    });
  }

  // Check for coverage drops
  const coveragePath = './coverage/coverage-summary.json';
  if (fs.existsSync(coveragePath)) {
    try {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const lineCoverage = coverage.total.lines.pct;
      
      if (lineCoverage < 70) {
        monitoring.alerts.push({
          type: 'warning',
          message: `Coverage is below threshold: ${lineCoverage}%`,
          timestamp: new Date().toISOString(),
          action: 'Add more tests to improve coverage'
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not check coverage:', error.message);
    }
  }
}

function generateRecommendations(monitoring) {
  const recommendations = [];

  // Success rate recommendations
  if (monitoring.trends.successRate.length > 0) {
    const avgSuccessRate = monitoring.trends.successRate.reduce((a, b) => a + b, 0) / monitoring.trends.successRate.length;
    
    if (avgSuccessRate < 95) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'Improve test reliability',
        details: 'Focus on fixing flaky tests and improving test stability'
      });
    }
  }

  // Performance recommendations
  if (monitoring.trends.executionTime.length > 0) {
    const avgExecutionTime = monitoring.trends.executionTime.reduce((a, b) => a + b, 0) / monitoring.trends.executionTime.length;
    
    if (avgExecutionTime > 300000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Optimize test performance',
        details: 'Consider parallelizing tests or optimizing slow test cases'
      });
    }
  }

  // Coverage recommendations
  const coveragePath = './coverage/coverage-summary.json';
  if (fs.existsSync(coveragePath)) {
    try {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const lineCoverage = coverage.total.lines.pct;
      
      if (lineCoverage < 80) {
        recommendations.push({
          type: 'coverage',
          priority: 'medium',
          message: 'Increase test coverage',
          details: `Current coverage: ${lineCoverage}%. Target: 80%+`
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not check coverage for recommendations:', error.message);
    }
  }

  monitoring.recommendations = recommendations;
}

function calculateTrend(values) {
  if (values.length < 2) return 0;
  
  const first = values[0];
  const last = values[values.length - 1];
  
  return ((last - first) / first) * 100;
}

// Run if called directly
if (require.main === module) {
  monitorNightlyTests();
}

module.exports = { monitorNightlyTests };

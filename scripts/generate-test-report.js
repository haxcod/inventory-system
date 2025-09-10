#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    testResults: {
      unit: { status: 'pending', duration: 0, coverage: 0 },
      integration: { status: 'pending', duration: 0, coverage: 0 },
      e2e: { status: 'pending', duration: 0, coverage: 0 },
      performance: { status: 'pending', duration: 0, metrics: {} },
      accessibility: { status: 'pending', duration: 0, violations: 0 },
      visual: { status: 'pending', duration: 0, changes: 0 }
    },
    artifacts: {
      coverage: './coverage/',
      testResults: './test-results/',
      performance: './performance-results/',
      security: './security-audit.json',
      bundleAnalysis: './bundle-analysis/'
    },
    recommendations: []
  };

  // Check if coverage directory exists
  if (fs.existsSync('./coverage/')) {
    report.testResults.unit.coverage = getCoveragePercentage();
    report.testResults.integration.coverage = getCoveragePercentage();
  }

  // Check if performance results exist
  if (fs.existsSync('./performance-results/')) {
    report.testResults.performance.metrics = getPerformanceMetrics();
  }

  // Check if security audit exists
  if (fs.existsSync('./security-audit.json')) {
    report.security = getSecurityAuditResults();
  }

  // Generate recommendations
  report.recommendations = generateRecommendations(report);

  // Write report
  const reportPath = './test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('✅ Test report generated:', reportPath);
  return report;
}

function getCoveragePercentage() {
  try {
    const coveragePath = './coverage/coverage-summary.json';
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      return coverage.total.lines.pct;
    }
  } catch (error) {
    console.warn('⚠️ Could not read coverage data:', error.message);
  }
  return 0;
}

function getPerformanceMetrics() {
  try {
    const perfPath = './performance-results/performance-metrics.json';
    if (fs.existsSync(perfPath)) {
      return JSON.parse(fs.readFileSync(perfPath, 'utf8'));
    }
  } catch (error) {
    console.warn('⚠️ Could not read performance metrics:', error.message);
  }
  return {};
}

function getSecurityAuditResults() {
  try {
    const securityPath = './security-audit.json';
    if (fs.existsSync(securityPath)) {
      return JSON.parse(fs.readFileSync(securityPath, 'utf8'));
    }
  } catch (error) {
    console.warn('⚠️ Could not read security audit:', error.message);
  }
  return {};
}

function generateRecommendations(report) {
  const recommendations = [];

  // Coverage recommendations
  if (report.testResults.unit.coverage < 80) {
    recommendations.push({
      type: 'coverage',
      priority: 'high',
      message: 'Unit test coverage is below 80%. Consider adding more tests.',
      current: report.testResults.unit.coverage,
      target: 80
    });
  }

  // Performance recommendations
  if (report.testResults.performance.metrics.loadTime > 3000) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: 'Page load time is above 3 seconds. Consider optimization.',
      current: report.testResults.performance.metrics.loadTime,
      target: 3000
    });
  }

  // Security recommendations
  if (report.security && report.security.vulnerabilities > 0) {
    recommendations.push({
      type: 'security',
      priority: 'high',
      message: 'Security vulnerabilities detected. Please review and update dependencies.',
      current: report.security.vulnerabilities,
      target: 0
    });
  }

  return recommendations;
}

// Run if called directly
if (require.main === module) {
  generateTestReport();
}

module.exports = { generateTestReport };

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, '../artifacts/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

try {
  // Boot the simulator
  console.log('Booting iPhone simulator...');
  execSync('xcrun simctl boot "iPhone 14"');
  
  // Install the app
  console.log('Installing Safari extension app...');
  execSync('xcrun simctl install booted ../artifacts/safari-ios-app/*.app');
  
  // Launch the app
  console.log('Launching Safari extension app...');
  execSync('xcrun simctl launch --console-pty booted dev.allhands.browserhistorytracker &');
  
  // Wait for app to initialize
  console.log('Waiting for app to initialize...');
  execSync('sleep 10');
  
  // Take a screenshot
  console.log('Taking screenshot...');
  execSync(`xcrun simctl io booted screenshot ${path.join(screenshotsDir, 'safari-ios-screenshot.png')}`);
  
  // Terminate the app
  console.log('Terminating app...');
  execSync('xcrun simctl terminate booted dev.allhands.browserhistorytracker');
  
  // Shutdown the simulator
  console.log('Shutting down simulator...');
  execSync('xcrun simctl shutdown booted');
  
  console.log('Safari iOS test completed successfully');
} catch (error) {
  console.error('Error during Safari iOS test:', error.message);
  process.exit(1);
}
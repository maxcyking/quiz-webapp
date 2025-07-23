#!/usr/bin/env node

/**
 * Deploy Firebase Security Rules
 * 
 * This script helps deploy Firestore and Storage security rules to Firebase.
 * Make sure you have Firebase CLI installed and are logged in.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Rules Deployment Script\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'ignore' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.error('❌ Firebase CLI is not installed.');
  console.error('Install it with: npm install -g firebase-tools');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('firebase projects:list', { stdio: 'ignore' });
  console.log('✅ You are logged in to Firebase');
} catch (error) {
  console.error('❌ You are not logged in to Firebase.');
  console.error('Login with: firebase login');
  process.exit(1);
}

// Check if rules files exist
const firestoreRulesPath = path.join(__dirname, '..', 'firestore.rules');
const storageRulesPath = path.join(__dirname, '..', 'storage.rules');

if (!fs.existsSync(firestoreRulesPath)) {
  console.error('❌ firestore.rules file not found');
  process.exit(1);
}

if (!fs.existsSync(storageRulesPath)) {
  console.error('❌ storage.rules file not found');
  process.exit(1);
}

console.log('✅ Rules files found');

// Deploy rules
try {
  console.log('\n📤 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('✅ Firestore rules deployed');

  console.log('\n📤 Deploying Storage rules...');
  execSync('firebase deploy --only storage', { stdio: 'inherit' });
  console.log('✅ Storage rules deployed');

  console.log('\n🎉 All rules deployed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify rules in Firebase Console');
  console.log('2. Test your application');
  console.log('3. Check that permissions work correctly');

} catch (error) {
  console.error('\n❌ Failed to deploy rules');
  console.error('Make sure you have selected the correct Firebase project with:');
  console.error('firebase use <project-id>');
  process.exit(1);
} 
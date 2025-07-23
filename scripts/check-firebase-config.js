#!/usr/bin/env node

/**
 * Firebase Configuration Checker
 * This script validates that all required Firebase environment variables are present
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

// Optional environment variables
const optionalVars = [
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

function checkFirebaseConfig() {
  console.log('🔥 Firebase Configuration Checker\n');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.log('📝 Please create a .env.local file in your project root with Firebase configuration.');
    console.log('📖 See FIREBASE_SETUP.md for detailed instructions.\n');
    process.exit(1);
  }

  // Read .env.local file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  console.log('✅ .env.local file found');

  // Check required variables
  let missingVars = [];
  let hasValues = [];

  requiredVars.forEach(varName => {
    if (!envVars[varName]) {
      missingVars.push(varName);
    } else if (envVars[varName].includes('your_') || envVars[varName] === '') {
      missingVars.push(varName + ' (placeholder value)');
    } else {
      hasValues.push(varName);
    }
  });

  // Check optional variables
  let optionalPresent = [];
  optionalVars.forEach(varName => {
    if (envVars[varName] && !envVars[varName].includes('your_')) {
      optionalPresent.push(varName);
    }
  });

  // Report results
  console.log('\n📋 Configuration Status:');
  
  if (hasValues.length > 0) {
    console.log('\n✅ Required variables configured:');
    hasValues.forEach(varName => {
      console.log(`   ${varName}`);
    });
  }

  if (optionalPresent.length > 0) {
    console.log('\n✅ Optional variables configured:');
    optionalPresent.forEach(varName => {
      console.log(`   ${varName}`);
    });
  }

  if (missingVars.length > 0) {
    console.log('\n❌ Missing or invalid variables:');
    missingVars.forEach(varName => {
      console.log(`   ${varName}`);
    });
    console.log('\n📖 Please update your .env.local file with actual Firebase values.');
    console.log('📖 See FIREBASE_SETUP.md for detailed instructions.');
    process.exit(1);
  }

  console.log('\n🎉 All required Firebase configuration variables are set!');
  console.log('🔄 Don\'t forget to restart your development server after making changes.');
  
  // Check if security rules files exist
  console.log('\n📂 Security Rules:');
  
  const firestoreRulesPath = path.join(process.cwd(), 'firestore.rules');
  const storageRulesPath = path.join(process.cwd(), 'storage.rules');
  
  if (fs.existsSync(firestoreRulesPath)) {
    console.log('✅ firestore.rules found');
  } else {
    console.log('❌ firestore.rules not found');
  }
  
  if (fs.existsSync(storageRulesPath)) {
    console.log('✅ storage.rules found');
  } else {
    console.log('❌ storage.rules not found');
  }
  
  console.log('\n🔐 Remember to deploy these rules to Firebase Console!');
  console.log('📖 See FIREBASE_SETUP.md for deployment instructions.\n');
}

// Run the check
try {
  checkFirebaseConfig();
} catch (error) {
  console.error('❌ Error checking Firebase configuration:', error.message);
  process.exit(1);
} 
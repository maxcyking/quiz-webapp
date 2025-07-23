#!/usr/bin/env node

/**
 * Add Default Categories Script
 * 
 * This script adds default categories to Firebase for testing
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

console.log('🔧 Adding Default Categories to Firebase...\n');

// Firebase config - you may need to adjust these values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultCategories = [
  {
    name: "Engineering",
    description: "Engineering entrance exams and competitive tests",
    icon: "⚙️",
    color: "from-blue-500 to-cyan-500",
    type: "main",
    slug: "engineering",
    isActive: true,
    order: 1,
    thumbnailUrl: ""
  },
  {
    name: "Medical",
    description: "Medical entrance exams and NEET preparation",
    icon: "🏥",
    color: "from-green-500 to-emerald-500",
    type: "main",
    slug: "medical",
    isActive: true,
    order: 2,
    thumbnailUrl: ""
  },
  {
    name: "Banking",
    description: "Banking sector exams and financial services",
    icon: "🏦",
    color: "from-purple-500 to-indigo-500",
    type: "main",
    slug: "banking",
    isActive: true,
    order: 3,
    thumbnailUrl: ""
  },
  {
    name: "Civil Services",
    description: "UPSC and state civil services examinations",
    icon: "⚖️",
    color: "from-red-500 to-pink-500",
    type: "main",
    slug: "civil-services",
    isActive: true,
    order: 4,
    thumbnailUrl: ""
  },
  {
    name: "SSC",
    description: "Staff Selection Commission exams",
    icon: "🏛️",
    color: "from-yellow-500 to-orange-500",
    type: "main",
    slug: "ssc",
    isActive: true,
    order: 5,
    thumbnailUrl: ""
  }
];

async function addCategories() {
  try {
    console.log('📁 Adding default categories...');
    
    for (const category of defaultCategories) {
      const docRef = await addDoc(collection(db, "categories"), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`   ✅ Added "${category.name}" with ID: ${docRef.id}`);
    }
    
    console.log('\n🎉 Default categories added successfully!');
    console.log('\n📋 Categories added:');
    defaultCategories.forEach(cat => {
      console.log(`   • ${cat.icon} ${cat.name} - ${cat.description}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error adding categories:', error);
    process.exit(1);
  }
}

addCategories(); 
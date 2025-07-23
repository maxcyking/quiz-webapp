# 🚀 Quiz App Deployment Guide

## 📋 Prerequisites

- ✅ Firebase project setup
- ✅ GitHub account
- ✅ Vercel account

## 🔧 Step 1: Environment Variables

Create these environment variables in Vercel:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 🔍 How to get Firebase values:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to ⚙️ **Project Settings**
4. Scroll to **"Your apps"** section
5. Click on web app to see config

## 🌐 Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Visit:** [vercel.com](https://vercel.com)
2. **Login** with GitHub
3. **Click:** "New Project"
4. **Import:** your `quiz-webapp` repository
5. **Configure:**
   - Framework: `Next.js` (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Add Environment Variables** (from Step 1)
7. **Click:** "Deploy"

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: quiz-webapp
# - Directory: ./
# - Override settings? No
```

## 🔗 Step 3: GitHub Setup

Replace `YOUR_USERNAME` with your GitHub username:

```bash
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/quiz-webapp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## ⚙️ Step 4: Firebase Configuration

1. **Enable Authentication:**
   - Go to Firebase Console > Authentication
   - Enable Email/Password sign-in

2. **Setup Firestore:**
   - Go to Firestore Database
   - Create database in production mode
   - Deploy the rules from `firestore.rules`

3. **Setup Storage:**
   - Go to Storage
   - Get started
   - Deploy the rules from `storage.rules`

## 🎯 Step 5: Verify Deployment

1. **Check build logs** in Vercel dashboard
2. **Test the deployed URL**
3. **Verify Firebase connection**
4. **Test admin login**

## 📱 Features Included

- ✅ **Admin Panel** with full CRUD operations
- ✅ **Bulk Question Upload** (CSV/Excel)
- ✅ **Rich Text Editor** (Tiptap)
- ✅ **Firebase Integration** (Auth, Firestore, Storage)
- ✅ **Responsive Design** (Mobile-friendly)
- ✅ **Bilingual Support** (English/Hindi)
- ✅ **Dark/Light Mode**

## 🐛 Troubleshooting

### Build Errors:
- Check environment variables are set correctly
- Verify Firebase config values
- Check console for specific error messages

### Firebase Errors:
- Ensure Firestore rules are deployed
- Check Authentication is enabled
- Verify Storage rules are set

### Environment Variables Missing:
```bash
# In Vercel dashboard:
# Settings > Environment Variables > Add each variable
```

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com)
- [GitHub Repository](https://github.com/YOUR_USERNAME/quiz-webapp)

---

🎉 **Your quiz app should now be live on Vercel!** 
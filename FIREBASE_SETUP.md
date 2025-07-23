# Firebase Setup Guide

## Environment Variables Setup

To fix the Firebase configuration error, you need to create a `.env.local` file in your project root with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon ⚙️ and select "Project settings"
4. Scroll down to "Your apps" section
5. If you don't have a web app, click "Add app" and select the web icon `</>`
6. Copy the configuration values from the `firebaseConfig` object

## Step-by-Step Instructions

1. **Create .env.local file**: In your project root directory, create a file named `.env.local`

2. **Copy the template**: Copy the environment variables template above into your `.env.local` file

3. **Replace placeholder values**: Replace each `your_*_here` value with the actual values from your Firebase project

4. **Restart your development server**: After creating/updating the `.env.local` file, restart your Next.js development server

## Example Firebase Config

Your Firebase config from the console will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

Map these values to the environment variables like this:

- `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`
- `measurementId` → `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Important Notes

- The `NEXT_PUBLIC_` prefix is required for client-side environment variables in Next.js
- Never commit your `.env.local` file to version control (it should be in `.gitignore`)
- Restart your development server after making changes to environment variables

## Troubleshooting

If you're still seeing the error after setting up the environment variables:

1. Make sure the `.env.local` file is in the root directory (same level as `package.json`)
2. Check that all variable names have the `NEXT_PUBLIC_` prefix
3. Ensure there are no spaces around the `=` sign in your `.env.local` file
4. Restart your development server completely (`Ctrl+C` then `npm run dev`)

## Firebase Project Setup

If you don't have a Firebase project yet:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Follow the setup wizard
4. Enable Authentication and Firestore Database in your project
5. Add a web app to get your configuration credentials

## Security Rules Setup

To fix the "Missing or insufficient permissions" errors, you need to deploy the security rules:

### Method 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. Copy the content from `firestore.rules` in your project root
5. Paste it into the rules editor
6. Click **Publish**

7. Go to **Storage** → **Rules**
8. Copy the content from `storage.rules` in your project root
9. Paste it into the rules editor
10. Click **Publish**

### Method 2: Using Firebase CLI

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init` (select Firestore and Storage)
4. Deploy rules: `firebase deploy --only firestore:rules,storage`

## Authentication Setup

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - Email/Password
   - Google (optional)
   - Phone (optional)

## Firestore Database Setup

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (our security rules will handle permissions)
4. Select a location for your database

## Storage Setup

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Choose **Start in production mode** (our security rules will handle permissions)
4. Select a location for your storage bucket
# Troubleshooting Guide

## Firebase Permission Errors

### Problem: "Missing or insufficient permissions" errors
**Symptoms:**
- `[code=permission-denied]: Missing or insufficient permissions`
- Users can't access exams, categories, or other collections
- Admin dashboard doesn't load

**Solution:**
1. Deploy the security rules provided in `firestore.rules` and `storage.rules`
2. In Firebase Console → Firestore Database → Rules, paste the content from `firestore.rules`
3. In Firebase Console → Storage → Rules, paste the content from `storage.rules`
4. Click "Publish" for both

### Problem: Environment variables not configured
**Symptoms:**
- `Missing required Firebase environment variables` warning
- App doesn't connect to Firebase

**Solution:**
1. Create `.env.local` file in project root
2. Add your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
3. Restart development server

## React 19 Compatibility Warnings

### Problem: "Accessing element.ref was removed in React 19" warnings
**Symptoms:**
- Console warnings about ref access
- No functional impact on the app

**Solution:**
These are warnings from UI libraries (Radix UI) and don't affect functionality. The Next.js config has been updated to suppress these warnings.

**Files affected:**
- `src/components/ui/toast.tsx`
- `src/components/mode-toggle.tsx`
- `src/app/admin/exams/page.tsx`
- `src/components/ui/select.tsx`

**Note:** These will be fixed in future library updates.

## Authentication Issues

### Problem: Users can't sign in
**Symptoms:**
- Sign in fails with unclear errors
- User exists in Firebase Auth but not in Firestore

**Solution:**
1. Check if Authentication is enabled in Firebase Console
2. Verify email/password provider is enabled
3. Ensure security rules allow user document creation

### Problem: Admin features not working
**Symptoms:**
- Admin pages show permission errors
- User appears to be admin but can't access admin features

**Solution:**
1. Verify user has `isAdmin: true` in their Firestore user document
2. Check that admin security rules are properly deployed
3. Log out and log back in to refresh auth state

## CSS and Styling Issues

### Problem: CSS not loading or styles missing
**Symptoms:**
- App shows only content without styling
- Tailwind classes not working

**Solution:**
1. Ensure `tailwind.config.js` exists and is properly configured
2. Check that `src/styles/globals.css` is imported in layout
3. Restart development server: `npm run dev`

### Problem: CSS deprecation warnings
**Symptoms:**
- `-ms-high-contrast is in the process of being deprecated` warning

**Solution:**
This is a browser-level warning and doesn't affect functionality. It will be addressed in future browser updates.

## Development Server Issues

### Problem: Hot reload not working
**Symptoms:**
- Changes don't reflect immediately
- Need to manually refresh page

**Solution:**
1. Restart development server: `npm run dev`
2. Clear browser cache
3. Check for any TypeScript errors in console

### Problem: Build errors
**Symptoms:**
- `npm run build` fails
- Type errors during build

**Solution:**
1. Fix all TypeScript errors shown in output
2. Run `npm run lint` to check for linting issues
3. Ensure all dependencies are installed: `npm install`

## Firebase Setup Checklist

✅ **Environment Variables**
- [ ] `.env.local` file created
- [ ] All Firebase config variables added
- [ ] Development server restarted

✅ **Firestore Security Rules**
- [ ] Rules deployed from `firestore.rules`
- [ ] Categories collection has read access for authenticated users
- [ ] Admin functions properly protected

✅ **Firebase Authentication**
- [ ] Email/Password provider enabled
- [ ] Google Sign-In configured (if using)
- [ ] Phone authentication enabled (if using)

✅ **Firestore Database**
- [ ] Database created in Firebase Console
- [ ] Collections structure matches app requirements
- [ ] Test user has `isAdmin: true` for admin features

## Quick Fixes

### Clear application data
```bash
# Clear Node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear browser storage
# Go to DevTools → Application → Storage → Clear Site Data
```

### Reset Firebase connection
```bash
# Restart with fresh environment
npm run dev
```

### Check Firebase status
1. Go to Firebase Console
2. Check Authentication → Users
3. Check Firestore Database → Data
4. Verify Security Rules are published

## Getting Help

If you're still experiencing issues:

1. Check the browser console for error details
2. Verify your Firebase project configuration
3. Ensure all environment variables are correctly set
4. Test with a fresh incognito/private browser window
5. Check Firebase Console for any service outages 
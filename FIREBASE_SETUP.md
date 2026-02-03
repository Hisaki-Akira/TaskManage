# Firebase Setup Guide

This guide will walk you through setting up Firebase for the Task Manager application.

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "task-manager-ftc")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Email/Password"
5. Toggle "Enable" to ON
6. Click "Save"

## Step 3: Create Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (we'll configure rules next)
4. Select a location closest to your users:
   - For Japan: `asia-northeast1` (Tokyo)
   - For US East: `us-east1`
   - For Europe: `europe-west1`
5. Click "Enable"

## Step 4: Configure Security Rules

1. In Firestore Database, click the "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write all tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish"

## Step 5: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. If you haven't added a web app yet:
   - Click the web icon (`</>`)
   - Register app with nickname: "Task Manager Web"
   - Don't check "Also set up Firebase Hosting"
   - Click "Register app"
5. Copy the `firebaseConfig` object

## Step 6: Update Application Configuration

1. Open `config.js` in your project
2. Replace the placeholder values with your Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "AIza...",  // Your actual API key
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:..."
};
```

3. Save the file
4. Commit and push to your repository:

```bash
git add config.js
git commit -m "Update Firebase configuration"
git push origin main
```

## Step 7: Test Authentication

1. Open your application in a web browser
2. Click "Sign Up"
3. Enter an email and password (minimum 6 characters)
4. Click "Sign Up"
5. You should be logged in and see the task management interface

## Step 8: Verify Firestore Access

1. Create a test task
2. Go to Firebase Console > Firestore Database
3. You should see a "tasks" collection with your task document

## Optional: Configure Firestore Indexes

If you plan to add complex queries later, you may need indexes:

1. In Firestore Database, go to "Indexes" tab
2. Click "Add index"
3. Configure as needed (the app works without custom indexes for now)

## Security Best Practices

### For Development
- It's okay to have your config.js with credentials in the repository during development
- Firebase's security is enforced by the security rules, not by hiding the config

### For Production
- Consider using environment variables for sensitive data
- Monitor authentication activity in Firebase Console
- Review security rules regularly
- Set up budget alerts in Firebase Console to avoid unexpected charges

### Firebase Console Security
- Enable 2-factor authentication on your Google account
- Limit Firebase project access to team members only
- Regularly review project members and their permissions

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Double-check that you've updated config.js with your actual Firebase config
- Ensure Email/Password authentication is enabled in Firebase Console

### Error: "Missing or insufficient permissions"
- Verify Firestore security rules are published
- Check that you're signed in with a valid account
- Review the rules to ensure authenticated users have access

### Tasks not syncing
- Check your internet connection
- Verify Firestore is enabled and rules are configured
- Open browser console to check for errors

### Authentication not working
- Ensure Email/Password provider is enabled in Firebase Console
- Check that the email format is valid
- Verify password is at least 6 characters
- Check browser console for specific error messages

## Firebase Free Tier Limits

Your application should stay within these free tier limits for small to medium teams:

**Authentication:**
- Unlimited Email/Password authentications

**Firestore:**
- 50,000 document reads per day
- 20,000 document writes per day  
- 20,000 document deletes per day
- 1 GB storage
- 10 GB/month network egress

**For a team of 20 users:**
- ~2,500 reads per user per day (plenty for normal usage)
- ~1,000 writes per user per day (more than enough for task management)

## Monitoring Usage

1. Go to Firebase Console
2. Click "Usage and billing" in the left sidebar
3. Monitor your daily usage
4. Set up budget alerts to notify you if approaching limits

## Need Help?

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: Tag questions with `firebase` and `firestore`

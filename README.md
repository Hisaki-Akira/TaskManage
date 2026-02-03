# Task Manager - FTC SIT-Kashiwa

A web-based task management tool with Gantt chart visualization, built for FTC members at SIT-Kashiwa. Features Firebase authentication, real-time updates, and collaborative task management.

## Features

- 🔐 **Authentication**: Email/Password authentication via Firebase
- 📊 **User-Grouped Gantt Chart**: Interactive Gantt chart with tasks grouped by user vertically
- 🎯 **Smart Scheduling**: Next task recommendations based on dependencies and dates
- 🔗 **Task Dependencies**: Link tasks with prerequisite relationships
- 🛣️ **Critical Path**: Automatic detection and highlighting of critical path tasks
- ⚠️ **Schedule Impact**: Visual warnings when task changes affect other tasks
- 📌 **Next Tasks Panel**: Dedicated panel showing ready-to-work tasks
- 🚦 **Task States**: Visual indicators for Ready, Blocked, In Progress, and Critical Path
- 🎯 **Modal Task Creation**: Quick and easy task creation via modal dialog
- 📝 **Task Management**: Create, edit, and delete tasks with full CRUD operations
- 👥 **Multi-user Access**: All authenticated users can read and write tasks
- 👤 **User Assignment**: Assign tasks to users with optional secondary assignees
- 🔄 **Real-time Updates**: Automatic synchronization across all users
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🚀 **GitHub Pages Hosting**: Static site deployment with automatic builds

## Live Demo

Once deployed, your app will be available at:
```
https://hisaki-akira.github.io/TaskManage/
```

## Setup Instructions

### Prerequisites

- A Firebase account (free tier is sufficient)
- A GitHub account
- A modern web browser

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Choose a project name (e.g., "task-manager-ftc")

2. **Enable Authentication**
   - In your Firebase project, go to "Authentication" in the left sidebar
   - Click "Get started"
   - Go to the "Sign-in method" tab
   - Enable "Email/Password" provider
   - Click "Save"

3. **Create Firestore Database**
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in production mode"
   - Select a location (choose the closest to your users)
   - Click "Enable"

4. **Configure Firestore Security Rules**
   - In Firestore Database, go to the "Rules" tab
   - Replace the existing rules with the contents of `firestore.rules` from this repository:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tasks/{taskId} {
         allow read, write: if request.auth != null;
       }
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
   - Click "Publish"

5. **Get Firebase Configuration**
   - Go to Project Settings (gear icon next to "Project Overview")
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Register your app with a nickname (e.g., "Task Manager Web")
   - Copy the Firebase configuration object

6. **Update Configuration File**
   - Open `config.js` in this repository
   - Replace the placeholder values with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```
   - Commit and push this change to your repository

### Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Hisaki-Akira/TaskManage.git
   cd TaskManage
   ```

2. **Update Firebase Configuration**
   - Edit `config.js` with your Firebase credentials (see Firebase Setup step 6)

3. **Run Local Server**
   
   You can use any local web server. Here are a few options:

   **Option 1: Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option 2: Node.js (http-server)**
   ```bash
   npx http-server -p 8000
   ```

   **Option 3: VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:8000`
   - Create an account using the Sign Up form
   - Start creating and managing tasks!

### GitHub Pages Deployment

1. **Enable GitHub Pages**
   - Go to your GitHub repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Deploy**
   - The GitHub Actions workflow (`.github/workflows/deploy.yml`) is already configured
   - Any push to the `main` branch will automatically deploy to GitHub Pages
   - You can also manually trigger deployment from the "Actions" tab

3. **Access Your Deployed App**
   - Once deployed, your app will be available at:
   - `https://hisaki-akira.github.io/TaskManage/`

## Usage Guide

### Scheduling & Planning Features

#### Next Tasks Panel
At the top of the Gantt view, you'll see a purple panel showing tasks that are ready to work on:
- **Ready Tasks**: Tasks with all dependencies completed and start date reached
- Shows task details: assignee, dates, and dependency count
- Click any card to quickly edit the task
- Updates automatically as tasks progress

#### Task Dependencies
When creating or editing a task:
1. Scroll to the "依存タスク" (Dependencies) section
2. Check the boxes for tasks that must complete first
3. The system prevents circular dependencies automatically
4. Dependencies show with status indicators (completed = green, pending = red)

#### Visual Indicators
Tasks are marked with color-coded badges:
- 🟢 **準備完了** (Ready): All dependencies done, ready to start
- 🟢 **次のタスク** (Next Task): Recommended to work on now
- 🔴 **ブロック中** (Blocked): Waiting on dependencies
- 🟠 **クリティカルパス** (Critical Path): On the longest dependency chain

#### Schedule Impact Warnings
When you drag a task to change its dates:
- A warning appears showing affected downstream tasks
- Helps you understand the impact of schedule changes
- Auto-dismisses after 10 seconds

#### Gantt Chart Enhancements
- Dependency lines connect related tasks (via Frappe Gantt)
- Next tasks highlighted in bright green
- Critical path tasks highlighted in red
- Blocked tasks shown with reduced opacity
- Click any task to see its dependencies and blocking status

### Creating a Task

1. Click the "➕ Add Task" button at the top of the page
2. Fill in the task form in the modal dialog:
   - **Title**: Task name (required)
   - **User Name**: Primary person responsible for the task (required)
   - **Assignee**: Secondary person (reviewer/helper) - optional
   - **Start Date**: When the task begins (required)
   - **End Date**: When the task should be completed (required)
   - **Status**: Current task status
   - **Description**: Additional details about the task
   - **Dependencies**: Select tasks that must be completed first (optional)

3. Click "Create Task" to add the task
4. The modal will close automatically upon successful creation

### Viewing Tasks

- **User-Grouped Gantt Chart View**: See tasks organized by user with visual timeline
  - Tasks are grouped by user name (one row per user)
  - Switch between Day, Week, and Month views
  - Drag tasks to change dates
  - Adjust progress by dragging task bars
  - Click on tasks to see details in a popup

- **List View**: See tasks in a detailed list format
  - Toggle between views using the "Switch to List View" button
  - See all task details including user name and assignee at a glance

### Editing Tasks

- **From List View**: Click the "Edit" button on any task
- **From Modal**: The task details will populate the form in the modal dialog
- Make your changes and click "Update Task"
- The modal will close automatically upon successful update

### Deleting Tasks

- Click the "Delete" button on any task
- Confirm the deletion when prompted

### Real-time Collaboration

- All authenticated users can see and edit all tasks
- Changes are synchronized in real-time across all connected users
- Multiple users can work on tasks simultaneously

## Project Structure

```
TaskManage/
├── index.html              # Main HTML file
├── style.css              # Stylesheet
├── app.js                 # Application logic
├── config.js              # Firebase configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes (optional)
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Pages deployment workflow
└── README.md             # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore (Firebase)
- **Gantt Chart**: [Frappe Gantt](https://github.com/frappe/gantt)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## Firebase Free Tier Limits

The application is designed to work within Firebase's free tier limits:

- **Authentication**: 10,000 phone authentications per month (Email auth is unlimited)
- **Firestore**: 
  - 50,000 reads per day
  - 20,000 writes per day
  - 20,000 deletes per day
  - 1 GiB storage
- **Bandwidth**: 10 GiB per month

These limits are sufficient for small to medium-sized teams.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Security Considerations

- All data is protected by Firebase Authentication
- Only authenticated users can access tasks
- Firestore security rules enforce authentication requirements
- Never commit your Firebase configuration with real credentials to public repositories (use environment variables or GitHub Secrets in production)

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've updated `config.js` with your Firebase configuration
- Verify that Email/Password authentication is enabled in Firebase Console

### Tasks not loading
- Check the browser console for errors
- Verify Firestore security rules are correctly configured
- Ensure you're signed in with a valid account

### Gantt chart not displaying
- Check that you have at least one task created
- Verify that task dates are valid
- Open browser console to check for JavaScript errors

### GitHub Pages deployment failing
- Ensure GitHub Pages is enabled in repository settings
- Check the Actions tab for deployment logs
- Verify all files are committed and pushed

## Contributing

This is a project for FTC members at SIT-Kashiwa. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available for use by FTC members at SIT-Kashiwa.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact the FTC team at SIT-Kashiwa

## Acknowledgments

- Frappe Gantt for the excellent Gantt chart library
- Firebase for providing free tier services
- GitHub for free hosting via GitHub Pages

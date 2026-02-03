# Quick Start Guide

Get your Task Manager up and running in 5 minutes!

## For End Users (Team Members)

### Step 1: Access the Application
Open your web browser and navigate to:
```
https://hisaki-akira.github.io/TaskManage/
```

### Step 2: Create Your Account
1. Click "Sign Up" on the login page
2. Enter your email address
3. Create a password (minimum 6 characters)
4. Click "Sign Up"

### Step 3: Start Managing Tasks
Once logged in, you can:
- **Create Tasks**: Fill in the form at the top and click "Create Task"
- **View Tasks**: See tasks in Gantt chart or list view
- **Edit Tasks**: Click "Edit" on any task to modify it
- **Delete Tasks**: Click "Delete" to remove a task

### Step 4: Switch Views
- Click "Switch to List View" to see tasks in a detailed list
- Click "Switch to Gantt View" to see the timeline visualization
- Use Day/Week/Month buttons to adjust the Gantt chart scale

## For Administrators (Setup)

### Prerequisites
- GitHub account with repository access
- Firebase account (free tier)
- 10-15 minutes for setup

### Quick Setup Steps

1. **Set up Firebase** (5 minutes)
   - Create a project at https://console.firebase.google.com/
   - Enable Email/Password authentication
   - Create a Firestore database
   - Configure security rules
   - Get your Firebase configuration
   
   📖 **Detailed guide**: See [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

2. **Update Configuration** (2 minutes)
   - Clone the repository
   - Edit `config.js` with your Firebase credentials
   - Commit and push changes

3. **Deploy** (3 minutes)
   - Enable GitHub Pages in repository settings
   - Select "GitHub Actions" as source
   - Push to main branch to trigger deployment
   
   📖 **Detailed guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

4. **Share with Team**
   - Send the GitHub Pages URL to your team
   - Each member creates their own account
   - Start collaborating!

## Common Tasks

### Creating Your First Task
1. Fill in the task form:
   - **Title**: "Setup project environment" ✅ Required
   - **Assignee**: "John Doe"
   - **Start Date**: Select today's date ✅ Required
   - **End Date**: Select completion date ✅ Required
   - **Status**: Choose from dropdown
   - **Description**: Add details about the task
2. Click "Create Task"

### Understanding Task Status
- **Not Started**: Task hasn't begun (gray)
- **In Progress**: Currently working on it (blue)
- **Completed**: Task is finished (green)
- **On Hold**: Temporarily paused (orange)

### Working with the Gantt Chart
- **Drag Tasks**: Click and drag to change dates
- **View Details**: Click a task to see the popup
- **Adjust Progress**: Drag the progress bar (updates status)
- **Change Scale**: Use Day/Week/Month buttons

### Editing Tasks
1. Find the task in list view or remember its details
2. Click "Edit" button
3. Modify the fields in the form
4. Click "Update Task"
5. Click "Cancel" to discard changes

### Deleting Tasks
1. Click "Delete" on a task
2. Confirm the deletion
3. Task is permanently removed

## Tips & Best Practices

### Task Management
- ✅ Use clear, descriptive task titles
- ✅ Assign tasks to specific people
- ✅ Set realistic date ranges
- ✅ Update status as work progresses
- ✅ Add descriptions for complex tasks

### Collaboration
- ✅ Check the Gantt chart daily for overview
- ✅ Update your assigned tasks regularly
- ✅ Communicate with team about task changes
- ✅ Use the list view for detailed task review

### Date Planning
- ✅ Plan tasks in weekly sprints
- ✅ Leave buffer time for delays
- ✅ Review the Gantt chart to avoid overlaps
- ✅ Use Week view for best overview

## Troubleshooting

### "Can't sign in"
- Check your email format is correct
- Ensure password is at least 6 characters
- Clear browser cache and try again
- Check internet connection

### "Tasks not loading"
- Refresh the page
- Check internet connection
- Clear browser cache
- Try signing out and back in

### "Can't see other users' tasks"
- All tasks are visible to all authenticated users
- Make sure you're signed in
- Check that tasks exist (create a test task)

### "Gantt chart looks wrong"
- Try switching view modes (Day/Week/Month)
- Refresh the page
- Check that task dates are valid
- Ensure browser is up to date

## Keyboard Shortcuts

Currently, the application uses standard browser shortcuts:
- **Ctrl/Cmd + R**: Refresh page
- **Tab**: Navigate between form fields
- **Enter**: Submit form (when in form field)

## Mobile Usage

The application is responsive and works on mobile devices:
- Rotate to landscape for better Gantt chart view
- Use pinch-to-zoom on Gantt chart if needed
- All features available on mobile

## Data & Privacy

- All data stored securely in Firebase
- Only authenticated users can access tasks
- All team members see the same tasks
- Data persists across sessions
- No data is stored locally in browser

## Getting Help

- 📖 Read the full [README.md](README.md)
- 🔧 Firebase setup: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- 🚀 Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 Report issues on GitHub
- 💬 Ask your team administrator

## Next Steps

### For New Users
1. ✅ Create your account
2. ✅ Create your first task
3. ✅ Explore both views (Gantt and List)
4. ✅ Edit and delete a test task
5. ✅ Start managing real tasks!

### For Administrators
1. ✅ Complete Firebase setup
2. ✅ Deploy to GitHub Pages
3. ✅ Test the deployment
4. ✅ Invite team members
5. ✅ Set up regular task reviews

## Support

For questions or issues:
- Check this guide first
- Review the detailed documentation
- Contact your team administrator
- Open a GitHub issue

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-03  
**Repository**: https://github.com/Hisaki-Akira/TaskManage

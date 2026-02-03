# Deployment Guide

This guide covers deploying the Task Manager application to GitHub Pages.

## Prerequisites

- GitHub account with access to the repository
- Firebase project configured (see FIREBASE_SETUP.md)
- `config.js` updated with your Firebase credentials

## GitHub Pages Deployment

### Method 1: Automatic Deployment (Recommended)

The repository is configured with GitHub Actions for automatic deployment.

1. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings"
   - Click "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"
   - Click "Save"

2. **Trigger Deployment**
   
   Any push to the `main` branch will automatically deploy:
   ```bash
   git add .
   git commit -m "Deploy application"
   git push origin main
   ```

3. **Check Deployment Status**
   - Go to the "Actions" tab in your repository
   - You should see a "Deploy to GitHub Pages" workflow running
   - Wait for it to complete (usually 1-2 minutes)

4. **Access Your Application**
   - Once deployed, your app will be available at:
   - `https://hisaki-akira.github.io/TaskManage/`

### Method 2: Manual Deployment

You can also manually trigger deployment:

1. Go to the "Actions" tab in your repository
2. Click "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch (main)
5. Click "Run workflow"

## Deployment Checklist

Before deploying, ensure:

- [ ] Firebase configuration is updated in `config.js`
- [ ] Firebase Authentication is enabled
- [ ] Firestore database is created and rules are configured
- [ ] All changes are committed and pushed to the repository
- [ ] GitHub Pages is enabled in repository settings
- [ ] No sensitive data or API keys are hardcoded (Firebase config is safe to expose)

## Post-Deployment

### 1. Test the Deployment

1. Open `https://hisaki-akira.github.io/TaskManage/` in your browser
2. Create a new account or sign in
3. Create a test task
4. Verify the task appears in both Gantt and List views
5. Test editing and deleting tasks
6. Sign out and sign back in to verify persistence

### 2. Add Users

Share the application URL with your team members:
- Send them: `https://hisaki-akira.github.io/TaskManage/`
- Each user needs to create their own account
- All authenticated users can see and edit all tasks

### 3. Monitor Application

- Check Firebase Console for authentication activity
- Monitor Firestore usage in Firebase Console
- Review GitHub Actions logs for deployment issues

## Custom Domain (Optional)

If you want to use a custom domain:

1. **Purchase a Domain**
   - Buy a domain from a registrar (GoDaddy, Namecheap, etc.)

2. **Configure DNS**
   - Add DNS records pointing to GitHub Pages:
   ```
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   CNAME www   hisaki-akira.github.io
   ```

3. **Configure GitHub Pages**
   - Go to repository Settings > Pages
   - Enter your custom domain
   - Wait for DNS check to complete
   - Enable "Enforce HTTPS"

4. **Update Firebase Configuration**
   - Go to Firebase Console > Authentication > Settings
   - Add your custom domain to "Authorized domains"

## Troubleshooting

### Deployment Failed

Check the Actions tab for error logs:
```
- Repository settings → Actions → General → Check workflow permissions
- Should be set to "Read and write permissions"
```

### 404 Error After Deployment

1. Wait 5-10 minutes for GitHub Pages to fully propagate
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that index.html exists in the repository root
4. Verify GitHub Pages is enabled in settings

### Application Loads But Shows Firebase Errors

1. Verify `config.js` has correct Firebase credentials
2. Check Firebase Console for project status
3. Ensure Firestore security rules are published
4. Check browser console for specific error messages

### CSS/JS Not Loading

1. Check that all file paths are relative (not absolute)
2. Verify all files are committed and pushed
3. Check GitHub Actions logs for upload errors
4. Clear browser cache and hard refresh

### Authentication Not Working

1. Check Firebase Console > Authentication > Settings
2. Add your GitHub Pages domain to "Authorized domains":
   - `hisaki-akira.github.io`
3. If using custom domain, add that too
4. Clear browser cache and try again

## Updating the Application

To deploy updates:

1. Make your changes locally
2. Test locally using a local web server
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
4. Push to GitHub:
   ```bash
   git push origin main
   ```
5. GitHub Actions will automatically deploy
6. Wait 1-2 minutes for deployment to complete

## Rollback

If you need to rollback to a previous version:

1. Find the working commit hash:
   ```bash
   git log --oneline
   ```

2. Revert to that commit:
   ```bash
   git revert HEAD
   # or
   git reset --hard <commit-hash>
   git push --force origin main
   ```

Note: Force push will trigger a new deployment

## Performance Optimization

For better performance:

1. **Enable Caching**
   - GitHub Pages automatically caches static files
   - Firebase CDN caches database queries

2. **Optimize Images** (if you add any)
   - Compress images before uploading
   - Use appropriate image formats (WebP, SVG)

3. **Monitor Load Times**
   - Use browser DevTools Network tab
   - Aim for < 3 second initial load
   - Firebase SDK is loaded from CDN for optimal performance

## Security

- Firebase configuration is safe to expose (security is enforced by Firestore rules)
- Never commit actual user credentials to the repository
- Regularly review Firebase security rules
- Monitor authentication activity for suspicious behavior
- Enable 2FA on your GitHub and Google accounts

## Support

For deployment issues:
- Check GitHub Actions logs
- Review GitHub Pages documentation
- Open an issue in the repository
- Contact repository maintainers

## Resources

- GitHub Pages Documentation: https://docs.github.com/en/pages
- GitHub Actions Documentation: https://docs.github.com/en/actions
- Firebase Hosting: https://firebase.google.com/docs/hosting (alternative to GitHub Pages)

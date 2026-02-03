// Task Manager Application
class TaskManager {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.ganttChart = null;
        this.currentView = 'gantt'; // 'gantt' or 'list'
        this.ganttViewMode = 'Week';
        this.editingTaskId = null;
        this.unsubscribeSnapshot = null;
        
        this.init();
    }

    init() {
        // Set up auth state listener
        auth.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.showApp();
                this.loadTasks();
            } else {
                this.currentUser = null;
                this.showAuth();
            }
        });
    }

    // Auth Methods
    toggleAuthForm() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        loginForm.classList.toggle('hidden');
        signupForm.classList.toggle('hidden');
        this.clearAuthError();
    }

    showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }

    clearAuthError() {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.classList.remove('show');
    }

    async signIn() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showAuthError('Please enter both email and password');
            return;
        }

        this.showLoading(true);
        try {
            await auth.signInWithEmailAndPassword(email, password);
            // Auth state listener will handle showing the app
        } catch (error) {
            this.showLoading(false);
            console.error('Sign in error:', error);
            this.showAuthError(this.getAuthErrorMessage(error.code));
        }
    }

    async signUp() {
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        if (!email || !password) {
            this.showAuthError('Please enter both email and password');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters');
            return;
        }

        this.showLoading(true);
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            // Auth state listener will handle showing the app
        } catch (error) {
            this.showLoading(false);
            console.error('Sign up error:', error);
            this.showAuthError(this.getAuthErrorMessage(error.code));
        }
    }

    async signOut() {
        this.showLoading(true);
        try {
            // Unsubscribe from snapshot listener
            if (this.unsubscribeSnapshot) {
                this.unsubscribeSnapshot();
                this.unsubscribeSnapshot = null;
            }
            await auth.signOut();
            // Auth state listener will handle showing the auth form
        } catch (error) {
            this.showLoading(false);
            console.error('Sign out error:', error);
            alert('Error signing out. Please try again.');
        }
    }

    getAuthErrorMessage(errorCode) {
        const errorMessages = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'Email already in use',
            'auth/weak-password': 'Password is too weak',
            'auth/network-request-failed': 'Network error. Please check your connection',
        };
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    // UI Methods
    showAuth() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
        this.showLoading(false);
    }

    showApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('user-email').textContent = this.currentUser.email;
        this.showLoading(false);
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    openTaskModal() {
        this.resetForm();
        document.getElementById('task-modal').classList.remove('hidden');
        document.getElementById('modal-title').textContent = 'Create New Task';
        document.getElementById('submit-btn').textContent = 'Create Task';
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    closeTaskModal() {
        document.getElementById('task-modal').classList.add('hidden');
        this.resetForm();
        // Restore body scroll
        document.body.style.overflow = '';
    }

    toggleView() {
        const ganttView = document.getElementById('gantt-view');
        const listView = document.getElementById('list-view');
        const toggleBtn = document.getElementById('view-toggle-btn');

        if (this.currentView === 'gantt') {
            ganttView.classList.add('hidden');
            listView.classList.remove('hidden');
            toggleBtn.textContent = 'Switch to Gantt View';
            this.currentView = 'list';
            this.renderTaskList();
        } else {
            ganttView.classList.remove('hidden');
            listView.classList.add('hidden');
            toggleBtn.textContent = 'Switch to List View';
            this.currentView = 'gantt';
            this.renderGanttChart();
        }
    }

    // Task Management Methods
    loadTasks() {
        this.showLoading(true);
        
        // Set up real-time listener for tasks
        this.unsubscribeSnapshot = db.collection('tasks')
            .orderBy('startDate', 'asc')
            .onSnapshot(snapshot => {
                this.tasks = [];
                snapshot.forEach(doc => {
                    this.tasks.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                this.renderGanttChart();
                if (this.currentView === 'list') {
                    this.renderTaskList();
                }
                this.showLoading(false);
            }, error => {
                console.error('Error loading tasks:', error);
                this.showLoading(false);
                alert('Error loading tasks. Please refresh the page.');
            });
    }

    async handleTaskSubmit(event) {
        event.preventDefault();
        
        const taskId = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const userName = document.getElementById('task-user-name').value.trim();
        const assignee = document.getElementById('task-assignee').value.trim();
        const startDate = document.getElementById('task-start-date').value;
        const endDate = document.getElementById('task-end-date').value;
        const status = document.getElementById('task-status').value;
        const description = document.getElementById('task-description').value.trim();

        if (!title || !userName || !startDate || !endDate) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate dates
        if (new Date(endDate) < new Date(startDate)) {
            alert('End date cannot be before start date');
            return;
        }

        this.showLoading(true);

        const taskData = {
            title,
            userName: userName || '',
            assignee: assignee || '',
            startDate,
            endDate,
            status,
            description: description || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (taskId) {
                // Update existing task
                await db.collection('tasks').doc(taskId).update(taskData);
            } else {
                // Create new task
                taskData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('tasks').add(taskData);
            }
            
            this.closeTaskModal();
            this.showLoading(false);
        } catch (error) {
            console.error('Error saving task:', error);
            this.showLoading(false);
            alert('Error saving task. Please try again.');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.editingTaskId = taskId;
        
        document.getElementById('task-id').value = taskId;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-user-name').value = task.userName || '';
        document.getElementById('task-assignee').value = task.assignee || '';
        document.getElementById('task-start-date').value = task.startDate;
        document.getElementById('task-end-date').value = task.endDate;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-description').value = task.description || '';
        
        document.getElementById('modal-title').textContent = 'Edit Task';
        document.getElementById('submit-btn').textContent = 'Update Task';
        
        // Open modal
        document.getElementById('task-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        this.showLoading(true);
        try {
            await db.collection('tasks').doc(taskId).delete();
            this.showLoading(false);
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showLoading(false);
            alert('Error deleting task. Please try again.');
        }
    }

    resetForm() {
        this.editingTaskId = null;
        document.getElementById('task-form').reset();
        document.getElementById('task-id').value = '';
        document.getElementById('modal-title').textContent = 'Create New Task';
        document.getElementById('submit-btn').textContent = 'Create Task';
    }

    // Gantt Chart Methods
    renderGanttChart() {
        const container = document.getElementById('gantt-container');
        
        if (this.tasks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No tasks yet. Create your first task above!</p>';
            return;
        }

        // Group tasks by userName
        const tasksByUser = this.groupTasksByUser();
        
        // If we have users, render grouped view; otherwise fallback to standard view
        if (Object.keys(tasksByUser).length > 0) {
            this.renderUserGroupedGantt(container, tasksByUser);
        } else {
            this.renderStandardGantt(container);
        }
    }

    groupTasksByUser() {
        const tasksByUser = {};
        this.tasks.forEach(task => {
            const userName = task.userName || 'Unassigned';
            if (!tasksByUser[userName]) {
                tasksByUser[userName] = [];
            }
            tasksByUser[userName].push(task);
        });
        return tasksByUser;
    }

    renderUserGroupedGantt(container, tasksByUser) {
        container.innerHTML = '';
        
        // Create a container for each user
        const users = Object.keys(tasksByUser).sort();
        users.forEach(userName => {
            const userSection = document.createElement('div');
            userSection.className = 'gantt-user-section';
            
            const userHeader = document.createElement('div');
            userHeader.className = 'gantt-user-header';
            userHeader.innerHTML = `<h3>${this.escapeHtml(userName)}</h3><span class="task-count">${tasksByUser[userName].length} task(s)</span>`;
            userSection.appendChild(userHeader);
            
            const userGanttContainer = document.createElement('div');
            userGanttContainer.className = 'gantt-user-container';
            userGanttContainer.id = `gantt-user-${userName.replace(/\s+/g, '-')}`;
            userSection.appendChild(userGanttContainer);
            
            container.appendChild(userSection);
            
            // Render Gantt chart for this user's tasks
            this.renderGanttForUser(userGanttContainer, tasksByUser[userName]);
        });
    }

    renderGanttForUser(container, tasks) {
        // Convert tasks to Gantt format
        const ganttTasks = tasks.map(task => ({
            id: task.id,
            name: task.title,
            start: task.startDate,
            end: task.endDate,
            progress: this.getProgressFromStatus(task.status),
            custom_class: this.getStatusClass(task.status)
        }));

        try {
            // Create new Gantt chart for this user
            new Gantt(container, ganttTasks, {
                view_mode: this.ganttViewMode,
                date_format: 'YYYY-MM-DD',
                custom_popup_html: (task) => {
                    const taskData = this.tasks.find(t => t.id === task.id);
                    return `
                        <div class="gantt-popup">
                            <h3>${task.name}</h3>
                            ${taskData.userName ? `<p><strong>User:</strong> ${taskData.userName}</p>` : ''}
                            ${taskData.assignee ? `<p><strong>Assignee:</strong> ${taskData.assignee}</p>` : ''}
                            <p><strong>Status:</strong> ${taskData.status}</p>
                            <p><strong>Duration:</strong> ${task.start} - ${task.end}</p>
                            ${taskData.description ? `<p><strong>Description:</strong> ${taskData.description}</p>` : ''}
                        </div>
                    `;
                },
                on_click: (task) => {
                    // Optional: handle task click
                },
                on_date_change: async (task, start, end) => {
                    // Update task dates in Firestore
                    try {
                        await db.collection('tasks').doc(task.id).update({
                            startDate: start.toISOString().split('T')[0],
                            endDate: end.toISOString().split('T')[0],
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } catch (error) {
                        console.error('Error updating task dates:', error);
                        alert('Error updating task dates');
                    }
                },
                on_progress_change: async (task, progress) => {
                    // Update task progress/status
                    let status = 'Not Started';
                    if (progress >= 100) status = 'Completed';
                    else if (progress > 0) status = 'In Progress';
                    
                    try {
                        await db.collection('tasks').doc(task.id).update({
                            status,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } catch (error) {
                        console.error('Error updating task status:', error);
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering Gantt chart for user:', error);
            container.innerHTML = '<p style="text-align: center; color: #c33; padding: 20px;">Error rendering Gantt chart.</p>';
        }
    }

    renderStandardGantt(container) {
        // Convert tasks to Gantt format
        const ganttTasks = this.tasks.map(task => ({
            id: task.id,
            name: task.title,
            start: task.startDate,
            end: task.endDate,
            progress: this.getProgressFromStatus(task.status),
            custom_class: this.getStatusClass(task.status)
        }));

        // Clear container
        container.innerHTML = '';

        try {
            // Create new Gantt chart
            this.ganttChart = new Gantt(container, ganttTasks, {
                view_mode: this.ganttViewMode,
                date_format: 'YYYY-MM-DD',
                custom_popup_html: (task) => {
                    const taskData = this.tasks.find(t => t.id === task.id);
                    return `
                        <div class="gantt-popup">
                            <h3>${task.name}</h3>
                            ${taskData.userName ? `<p><strong>User:</strong> ${taskData.userName}</p>` : ''}
                            ${taskData.assignee ? `<p><strong>Assignee:</strong> ${taskData.assignee}</p>` : ''}
                            <p><strong>Status:</strong> ${taskData.status}</p>
                            <p><strong>Duration:</strong> ${task.start} - ${task.end}</p>
                            ${taskData.description ? `<p><strong>Description:</strong> ${taskData.description}</p>` : ''}
                        </div>
                    `;
                },
                on_click: (task) => {
                    // Optional: handle task click
                },
                on_date_change: async (task, start, end) => {
                    // Update task dates in Firestore
                    try {
                        await db.collection('tasks').doc(task.id).update({
                            startDate: start.toISOString().split('T')[0],
                            endDate: end.toISOString().split('T')[0],
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } catch (error) {
                        console.error('Error updating task dates:', error);
                        alert('Error updating task dates');
                    }
                },
                on_progress_change: async (task, progress) => {
                    // Update task progress/status
                    let status = 'Not Started';
                    if (progress >= 100) status = 'Completed';
                    else if (progress > 0) status = 'In Progress';
                    
                    try {
                        await db.collection('tasks').doc(task.id).update({
                            status,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } catch (error) {
                        console.error('Error updating task status:', error);
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering Gantt chart:', error);
            container.innerHTML = '<p style="text-align: center; color: #c33; padding: 40px;">Error rendering Gantt chart. Please try refreshing the page.</p>';
        }
    }

    changeGanttView(mode) {
        this.ganttViewMode = mode;
        
        // Update button active states
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Re-render chart with new view mode
        if (this.ganttChart) {
            this.ganttChart.change_view_mode(mode);
        }
    }

    getProgressFromStatus(status) {
        const progressMap = {
            'Not Started': 0,
            'In Progress': 50,
            'Completed': 100,
            'On Hold': 25
        };
        return progressMap[status] || 0;
    }

    getStatusClass(status) {
        const classMap = {
            'Not Started': 'bar-not-started',
            'In Progress': 'bar-in-progress',
            'Completed': 'bar-completed',
            'On Hold': 'bar-on-hold'
        };
        return classMap[status] || '';
    }

    // List View Methods
    renderTaskList() {
        const container = document.getElementById('task-list');
        
        if (this.tasks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No tasks yet. Create your first task above!</p>';
            return;
        }

        container.innerHTML = this.tasks.map(task => `
            <div class="task-item">
                <div class="task-item-header">
                    <div>
                        <div class="task-item-title">${this.escapeHtml(task.title)}</div>
                        <span class="task-item-status status-${this.getStatusSlug(task.status)}">
                            ${task.status}
                        </span>
                    </div>
                </div>
                <div class="task-item-details">
                    ${task.userName ? `<div class="task-item-detail"><strong>User:</strong> ${this.escapeHtml(task.userName)}</div>` : ''}
                    ${task.assignee ? `<div class="task-item-detail"><strong>Assignee:</strong> ${this.escapeHtml(task.assignee)}</div>` : ''}
                    <div class="task-item-detail"><strong>Start Date:</strong> ${task.startDate}</div>
                    <div class="task-item-detail"><strong>End Date:</strong> ${task.endDate}</div>
                    ${task.description ? `<div class="task-item-detail"><strong>Description:</strong> ${this.escapeHtml(task.description)}</div>` : ''}
                </div>
                <div class="task-item-actions">
                    <button class="btn-edit" onclick="app.editTask('${task.id}')">Edit</button>
                    <button class="btn-danger" onclick="app.deleteTask('${task.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    getStatusSlug(status) {
        return status.toLowerCase().replace(/\s+/g, '-');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const app = new TaskManager();

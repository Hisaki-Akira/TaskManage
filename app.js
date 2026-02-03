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
        this.UNASSIGNED_USER = '未割り当て';
        this.nextUpDismissed = false;
        
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
            this.showAuthError('メールアドレスとパスワードを入力してください');
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
            this.showAuthError('メールアドレスとパスワードを入力してください');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('パスワードは6文字以上である必要があります');
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
            alert('サインアウト中にエラーが発生しました。もう一度お試しください。');
        }
    }

    getAuthErrorMessage(errorCode) {
        const errorMessages = {
            'auth/invalid-email': 'メールアドレスが無効です',
            'auth/user-disabled': 'このアカウントは無効になっています',
            'auth/user-not-found': 'このメールアドレスのアカウントが見つかりません',
            'auth/wrong-password': 'パスワードが正しくありません',
            'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
            'auth/weak-password': 'パスワードが弱すぎます',
            'auth/network-request-failed': 'ネットワークエラーです。接続を確認してください',
        };
        return errorMessages[errorCode] || 'エラーが発生しました。もう一度お試しください。';
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
        this.populateDependencyOptions();
        document.getElementById('task-modal').classList.remove('hidden');
        document.getElementById('modal-title').textContent = '新しいタスクを作成';
        document.getElementById('submit-btn').textContent = 'タスクを作成';
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
            toggleBtn.textContent = 'ガント表示に切り替え';
            this.currentView = 'list';
            this.renderTaskList();
        } else {
            ganttView.classList.remove('hidden');
            listView.classList.add('hidden');
            toggleBtn.textContent = 'リスト表示に切り替え';
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
                this.updateNextUpPanel();
                this.showLoading(false);
            }, error => {
                console.error('Error loading tasks:', error);
                this.showLoading(false);
                alert('タスクの読み込み中にエラーが発生しました。ページを更新してください。');
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
        
        // Get selected dependencies
        const dependencySelect = document.getElementById('task-dependencies');
        const dependencies = Array.from(dependencySelect.selectedOptions).map(opt => opt.value);

        if (!title || !userName || !startDate || !endDate) {
            alert('必須項目をすべて入力してください');
            return;
        }

        // Validate dates
        if (new Date(endDate) < new Date(startDate)) {
            alert('終了日は開始日より前にできません');
            return;
        }
        
        // Check for circular dependencies
        if (taskId && dependencies.includes(taskId)) {
            alert('タスクは自分自身に依存できません');
            return;
        }
        
        // Check for circular dependency chains
        if (taskId && this.hasCircularDependency(taskId, dependencies)) {
            alert('循環依存が検出されました。依存関係を見直してください。');
            return;
        }

        this.showLoading(true);

        const taskData = {
            title,
            userName,
            assignee: assignee || '',
            startDate,
            endDate,
            status,
            description: description || '',
            dependencies: dependencies || [],
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
            alert('タスクの保存中にエラーが発生しました。もう一度お試しください。');
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
        
        // Populate and select dependencies
        this.populateDependencyOptions(taskId);
        const dependencySelect = document.getElementById('task-dependencies');
        if (task.dependencies && task.dependencies.length > 0) {
            Array.from(dependencySelect.options).forEach(option => {
                option.selected = task.dependencies.includes(option.value);
            });
        }
        
        document.getElementById('modal-title').textContent = 'タスクを編集';
        document.getElementById('submit-btn').textContent = 'タスクを更新';
        
        // Open modal
        document.getElementById('task-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    async deleteTask(taskId) {
        if (!confirm('このタスクを削除してもよろしいですか？')) {
            return;
        }

        this.showLoading(true);
        try {
            await db.collection('tasks').doc(taskId).delete();
            this.showLoading(false);
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showLoading(false);
            alert('タスクの削除中にエラーが発生しました。もう一度お試しください。');
        }
    }

    resetForm() {
        this.editingTaskId = null;
        document.getElementById('task-form').reset();
        document.getElementById('task-id').value = '';
        document.getElementById('modal-title').textContent = '新しいタスクを作成';
        document.getElementById('submit-btn').textContent = 'タスクを作成';
    }

    // Gantt Chart Methods
    renderGanttChart() {
        const container = document.getElementById('gantt-container');
        
        if (this.tasks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">まだタスクがありません。上のボタンから最初のタスクを作成してください！</p>';
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
            const userName = task.userName || this.UNASSIGNED_USER;
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
            userHeader.innerHTML = `<h3>${this.escapeHtml(userName)}</h3><span class="task-count">${tasksByUser[userName].length} タスク</span>`;
            userSection.appendChild(userHeader);
            
            const userGanttContainer = document.createElement('div');
            userGanttContainer.className = 'gantt-user-container';
            userGanttContainer.id = `gantt-user-${this.sanitizeId(userName)}`;
            userSection.appendChild(userGanttContainer);
            
            container.appendChild(userSection);
            
            // Render Gantt chart for this user's tasks
            this.renderGanttForUser(userGanttContainer, tasksByUser[userName]);
        });
    }

    sanitizeId(str) {
        // Replace any character that's not alphanumeric, hyphen, or underscore with hyphen
        return str.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/--+/g, '-');
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
                    const dependencies = this.getTaskDependencies(task.id);
                    const blockedTasks = this.getBlockingTasks(task.id);
                    const isReady = this.isTaskReady(taskData);
                    const isBlocked = this.isTaskBlocked(taskData);
                    
                    let dependencyInfo = '';
                    if (dependencies.length > 0) {
                        const depList = dependencies.map(dep => 
                            `<li>${this.escapeHtml(dep.title)} (${this.translateStatus(dep.status)})</li>`
                        ).join('');
                        dependencyInfo = `<p><strong>依存タスク:</strong></p><ul style="margin: 5px 0; padding-left: 20px;">${depList}</ul>`;
                    }
                    
                    let blockedInfo = '';
                    if (blockedTasks.length > 0) {
                        const blockList = blockedTasks.map(t => 
                            `<li>${this.escapeHtml(t.title)}</li>`
                        ).join('');
                        blockedInfo = `<p><strong>このタスクに依存しているタスク:</strong></p><ul style="margin: 5px 0; padding-left: 20px;">${blockList}</ul>`;
                    }
                    
                    let statusBadge = '';
                    if (isBlocked) {
                        statusBadge = '<span style="background: rgba(244, 67, 54, 0.2); color: #d32f2f; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">ブロック中</span>';
                    } else if (isReady && taskData.status !== 'Completed') {
                        statusBadge = '<span style="background: rgba(76, 175, 80, 0.2); color: #388e3c; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">準備完了</span>';
                    }
                    
                    return `
                        <div class="gantt-popup">
                            <h3>${task.name} ${statusBadge}</h3>
                            ${taskData.userName ? `<p><strong>ユーザー:</strong> ${taskData.userName}</p>` : ''}
                            ${taskData.assignee ? `<p><strong>担当者:</strong> ${taskData.assignee}</p>` : ''}
                            <p><strong>状態:</strong> ${this.translateStatus(taskData.status)}</p>
                            <p><strong>期間:</strong> ${task.start} - ${task.end}</p>
                            ${dependencyInfo}
                            ${blockedInfo}
                            ${taskData.description ? `<p><strong>説明:</strong> ${taskData.description}</p>` : ''}
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
            container.innerHTML = '<p style="text-align: center; color: #c33; padding: 20px;">ガントチャートの描画中にエラーが発生しました。</p>';
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
                    const dependencies = this.getTaskDependencies(task.id);
                    const blockedTasks = this.getBlockingTasks(task.id);
                    const isReady = this.isTaskReady(taskData);
                    const isBlocked = this.isTaskBlocked(taskData);
                    
                    let dependencyInfo = '';
                    if (dependencies.length > 0) {
                        const depList = dependencies.map(dep => 
                            `<li>${this.escapeHtml(dep.title)} (${this.translateStatus(dep.status)})</li>`
                        ).join('');
                        dependencyInfo = `<p><strong>依存タスク:</strong></p><ul style="margin: 5px 0; padding-left: 20px;">${depList}</ul>`;
                    }
                    
                    let blockedInfo = '';
                    if (blockedTasks.length > 0) {
                        const blockList = blockedTasks.map(t => 
                            `<li>${this.escapeHtml(t.title)}</li>`
                        ).join('');
                        blockedInfo = `<p><strong>このタスクに依存しているタスク:</strong></p><ul style="margin: 5px 0; padding-left: 20px;">${blockList}</ul>`;
                    }
                    
                    let statusBadge = '';
                    if (isBlocked) {
                        statusBadge = '<span style="background: rgba(244, 67, 54, 0.2); color: #d32f2f; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">ブロック中</span>';
                    } else if (isReady && taskData.status !== 'Completed') {
                        statusBadge = '<span style="background: rgba(76, 175, 80, 0.2); color: #388e3c; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">準備完了</span>';
                    }
                    
                    return `
                        <div class="gantt-popup">
                            <h3>${task.name} ${statusBadge}</h3>
                            ${taskData.userName ? `<p><strong>ユーザー:</strong> ${taskData.userName}</p>` : ''}
                            ${taskData.assignee ? `<p><strong>担当者:</strong> ${taskData.assignee}</p>` : ''}
                            <p><strong>状態:</strong> ${this.translateStatus(taskData.status)}</p>
                            <p><strong>期間:</strong> ${task.start} - ${task.end}</p>
                            ${dependencyInfo}
                            ${blockedInfo}
                            ${taskData.description ? `<p><strong>説明:</strong> ${taskData.description}</p>` : ''}
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
                        alert('タスクの日付更新中にエラーが発生しました');
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
            container.innerHTML = '<p style="text-align: center; color: #c33; padding: 40px;">ガントチャートの描画中にエラーが発生しました。ページを更新してください。</p>';
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

    // Translation helper for status display
    // Note: Status values are stored in English in the database for data compatibility
    // This function translates them to Japanese for UI display only
    translateStatus(status) {
        const statusTranslations = {
            'Not Started': '未着手',
            'In Progress': '進行中',
            'Completed': '完了',
            'On Hold': '保留'
        };
        return statusTranslations[status] || status;
    }

    // List View Methods
    renderTaskList() {
        const container = document.getElementById('task-list');
        
        if (this.tasks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">まだタスクがありません。上のボタンから最初のタスクを作成してください！</p>';
            return;
        }

        container.innerHTML = this.tasks.map(task => {
            const isReady = this.isTaskReady(task);
            const isBlocked = this.isTaskBlocked(task);
            const dependencies = this.getTaskDependencies(task.id);
            const blockedTasks = this.getBlockingTasks(task.id);
            
            let statusBadge = '';
            if (isBlocked) {
                statusBadge = '<span class="task-blocked-badge">ブロック中</span>';
            } else if (isReady && task.status !== 'Completed') {
                statusBadge = '<span class="task-ready-badge">準備完了</span>';
            }
            
            let dependencyInfo = '';
            if (dependencies.length > 0) {
                const depList = dependencies.map(dep => 
                    `<li class="dependency-item">${this.escapeHtml(dep.title)} (${this.translateStatus(dep.status)})</li>`
                ).join('');
                dependencyInfo = `<div class="task-item-detail"><strong>依存タスク:</strong><ul class="dependency-list">${depList}</ul></div>`;
            }
            
            let blockedInfo = '';
            if (blockedTasks.length > 0) {
                const blockList = blockedTasks.map(t => 
                    `<li class="dependency-item">${this.escapeHtml(t.title)}</li>`
                ).join('');
                blockedInfo = `<div class="task-item-detail"><strong>このタスクに依存しているタスク:</strong><ul class="dependency-list">${blockList}</ul></div>`;
            }
            
            return `
                <div class="task-item">
                    <div class="task-item-header">
                        <div>
                            <div class="task-item-title">${this.escapeHtml(task.title)}</div>
                            <span class="task-item-status status-${this.getStatusSlug(task.status)}">
                                ${this.translateStatus(task.status)}
                            </span>
                            ${statusBadge}
                        </div>
                    </div>
                    <div class="task-item-details">
                        ${task.userName ? `<div class="task-item-detail"><strong>ユーザー:</strong> ${this.escapeHtml(task.userName)}</div>` : ''}
                        ${task.assignee ? `<div class="task-item-detail"><strong>担当者:</strong> ${this.escapeHtml(task.assignee)}</div>` : ''}
                        <div class="task-item-detail"><strong>開始日:</strong> ${task.startDate}</div>
                        <div class="task-item-detail"><strong>終了日:</strong> ${task.endDate}</div>
                        ${dependencyInfo}
                        ${blockedInfo}
                        ${task.description ? `<div class="task-item-detail"><strong>説明:</strong> ${this.escapeHtml(task.description)}</div>` : ''}
                    </div>
                    <div class="task-item-actions">
                        <button class="btn-edit" onclick="app.editTask('${task.id}')">編集</button>
                        <button class="btn-danger" onclick="app.deleteTask('${task.id}')">削除</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getStatusSlug(status) {
        return status.toLowerCase().replace(/\s+/g, '-');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Dependency Management Methods
    populateDependencyOptions(excludeTaskId = null) {
        const select = document.getElementById('task-dependencies');
        select.innerHTML = '<option value="">依存なし</option>';
        
        // Filter out the current task being edited
        const availableTasks = this.tasks.filter(t => t.id !== excludeTaskId);
        
        availableTasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = `${task.title} (${task.startDate} - ${task.endDate})`;
            select.appendChild(option);
        });
    }
    
    hasCircularDependency(taskId, newDependencies) {
        // Check if adding these dependencies would create a circular dependency
        const visited = new Set();
        const recursionStack = new Set();
        
        const hasCycle = (currentId) => {
            if (recursionStack.has(currentId)) {
                return true; // Found a cycle
            }
            if (visited.has(currentId)) {
                return false; // Already checked this path
            }
            
            visited.add(currentId);
            recursionStack.add(currentId);
            
            // Get dependencies for current task
            const task = this.tasks.find(t => t.id === currentId);
            const deps = task ? (task.dependencies || []) : [];
            
            // If this is the task being edited, use the new dependencies
            const depsToCheck = (currentId === taskId) ? newDependencies : deps;
            
            for (const depId of depsToCheck) {
                if (hasCycle(depId)) {
                    return true;
                }
            }
            
            recursionStack.delete(currentId);
            return false;
        };
        
        return hasCycle(taskId);
    }
    
    getTaskDependencies(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.dependencies) return [];
        
        return task.dependencies
            .map(depId => this.tasks.find(t => t.id === depId))
            .filter(t => t !== undefined);
    }
    
    getBlockingTasks(taskId) {
        // Get all tasks that this task blocks (tasks that depend on this one)
        return this.tasks.filter(t => 
            t.dependencies && t.dependencies.includes(taskId)
        );
    }
    
    isTaskReady(task) {
        // A task is ready if all its dependencies are completed
        if (!task.dependencies || task.dependencies.length === 0) {
            return true;
        }
        
        return task.dependencies.every(depId => {
            const depTask = this.tasks.find(t => t.id === depId);
            return depTask && depTask.status === 'Completed';
        });
    }
    
    isTaskBlocked(task) {
        // A task is blocked if it has incomplete dependencies
        if (!task.dependencies || task.dependencies.length === 0) {
            return false;
        }
        
        return task.dependencies.some(depId => {
            const depTask = this.tasks.find(t => t.id === depId);
            return depTask && depTask.status !== 'Completed';
        });
    }
    
    // Next Up Panel Methods
    updateNextUpPanel() {
        if (this.nextUpDismissed) {
            return;
        }
        
        const panel = document.getElementById('next-up-panel');
        const content = document.getElementById('next-up-content');
        
        // Find the next ready task
        const nextTask = this.findNextTask();
        
        if (nextTask) {
            panel.classList.remove('hidden');
            content.innerHTML = this.renderNextUpTask(nextTask);
        } else {
            // Check if there are any incomplete tasks
            const incompleteTasks = this.tasks.filter(t => 
                t.status !== 'Completed'
            );
            
            if (incompleteTasks.length > 0) {
                panel.classList.remove('hidden');
                content.innerHTML = '<div class="next-up-empty">すべてのタスクがブロックされています。依存関係を確認してください。</div>';
            } else {
                panel.classList.add('hidden');
            }
        }
    }
    
    findNextTask() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter tasks that are:
        // 1. Not completed
        // 2. Not on hold
        // 3. Ready (all dependencies completed)
        // 4. Started or should have started
        const candidateTasks = this.tasks.filter(task => {
            if (task.status === 'Completed' || task.status === 'On Hold') {
                return false;
            }
            
            if (!this.isTaskReady(task)) {
                return false;
            }
            
            const startDate = new Date(task.startDate);
            startDate.setHours(0, 0, 0, 0);
            
            return startDate <= today;
        });
        
        // Sort by start date (earliest first)
        candidateTasks.sort((a, b) => {
            const dateA = new Date(a.startDate);
            const dateB = new Date(b.startDate);
            return dateA - dateB;
        });
        
        return candidateTasks[0] || null;
    }
    
    renderNextUpTask(task) {
        const dependencies = this.getTaskDependencies(task.id);
        const blockedTasks = this.getBlockingTasks(task.id);
        
        return `
            <div class="next-up-task-title">${this.escapeHtml(task.title)}</div>
            <div class="next-up-task-details">
                ${task.userName ? `<div><strong>担当:</strong> ${this.escapeHtml(task.userName)}</div>` : ''}
                ${task.assignee ? `<div><strong>アサイン先:</strong> ${this.escapeHtml(task.assignee)}</div>` : ''}
                <div><strong>期間:</strong> ${task.startDate} - ${task.endDate}</div>
                <div><strong>状態:</strong> ${this.translateStatus(task.status)}</div>
                ${dependencies.length > 0 ? `<div><strong>依存タスク:</strong> ${dependencies.length}件（すべて完了）</div>` : ''}
                ${blockedTasks.length > 0 ? `<div><strong>このタスクに依存しているタスク:</strong> ${blockedTasks.length}件</div>` : ''}
                ${task.description ? `<div style="margin-top: 10px;"><strong>詳細:</strong> ${this.escapeHtml(task.description)}</div>` : ''}
            </div>
        `;
    }
    
    dismissNextUp() {
        this.nextUpDismissed = true;
        document.getElementById('next-up-panel').classList.add('hidden');
    }
}

// Initialize the app
const app = new TaskManager();

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
        const nextTasksPanel = document.getElementById('next-tasks-panel');

        if (this.currentView === 'gantt') {
            ganttView.classList.add('hidden');
            listView.classList.remove('hidden');
            nextTasksPanel.classList.add('hidden');
            toggleBtn.textContent = 'ガント表示に切り替え';
            this.currentView = 'list';
            this.renderTaskList();
        } else {
            ganttView.classList.remove('hidden');
            listView.classList.add('hidden');
            nextTasksPanel.classList.remove('hidden');
            toggleBtn.textContent = 'リスト表示に切り替え';
            this.currentView = 'gantt';
            this.renderGanttChart();
        }
    }

    // Dependency Management Methods
    populateDependencyOptions(excludeTaskId = null) {
        const select = document.getElementById('task-dependencies');
        select.innerHTML = '';
        
        // Filter out the current task being edited
        const availableTasks = this.tasks.filter(t => t.id !== excludeTaskId);
        
        if (availableTasks.length === 0) {
            select.innerHTML = '<option disabled>依存タスクがありません</option>';
            return;
        }
        
        availableTasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = `${task.title} (${task.userName})`;
            select.appendChild(option);
        });
    }

    getSelectedDependencies() {
        const select = document.getElementById('task-dependencies');
        return Array.from(select.selectedOptions).map(opt => opt.value);
    }

    setSelectedDependencies(dependencies) {
        const select = document.getElementById('task-dependencies');
        Array.from(select.options).forEach(option => {
            option.selected = dependencies.includes(option.value);
        });
    }

    getTaskById(taskId) {
        return this.tasks.find(t => t.id === taskId);
    }

    getTaskDependencies(taskId) {
        const task = this.getTaskById(taskId);
        return task && task.dependencies ? task.dependencies : [];
    }

    isTaskBlocked(taskId) {
        const dependencies = this.getTaskDependencies(taskId);
        if (dependencies.length === 0) return false;
        
        // Check if any dependency is not completed
        return dependencies.some(depId => {
            const depTask = this.getTaskById(depId);
            return depTask && depTask.status !== 'Completed';
        });
    }

    getNextTasks() {
        // Tasks that have no incomplete dependencies and are not completed
        return this.tasks.filter(task => {
            if (task.status === 'Completed') return false;
            const dependencies = this.getTaskDependencies(task.id);
            if (dependencies.length === 0) return true;
            
            // Check if all dependencies are completed
            return dependencies.every(depId => {
                const depTask = this.getTaskById(depId);
                return depTask && depTask.status === 'Completed';
            });
        });
    }

    detectCircularDependency(taskId, dependencies, visited = new Set()) {
        if (visited.has(taskId)) return true;
        visited.add(taskId);
        
        for (const depId of dependencies) {
            const depTask = this.getTaskById(depId);
            if (!depTask) continue;
            
            const depDependencies = depTask.dependencies || [];
            if (this.detectCircularDependency(depId, depDependencies, visited)) {
                return true;
            }
        }
        
        return false;
    }

    calculateLatestDependencyEndDate(dependencies) {
        if (dependencies.length === 0) return null;
        
        let latestDate = null;
        dependencies.forEach(depId => {
            const depTask = this.getTaskById(depId);
            if (depTask && depTask.endDate) {
                const depEndDate = new Date(depTask.endDate);
                if (!latestDate || depEndDate > latestDate) {
                    latestDate = depEndDate;
                }
            }
        });
        
        return latestDate;
    }

    async updateDependentTasks(taskId, oldEndDate, newEndDate) {
        // Find all tasks that depend on this task
        const dependentTasks = this.tasks.filter(task => {
            const deps = task.dependencies || [];
            return deps.includes(taskId);
        });
        
        if (dependentTasks.length === 0) return;
        
        // Calculate the difference in days
        const oldDate = new Date(oldEndDate);
        const newDate = new Date(newEndDate);
        const daysDiff = Math.round((newDate - oldDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) return;
        
        // Update each dependent task
        for (const task of dependentTasks) {
            const taskStartDate = new Date(task.startDate);
            const taskEndDate = new Date(task.endDate);
            
            // Add the difference to both start and end dates
            taskStartDate.setDate(taskStartDate.getDate() + daysDiff);
            taskEndDate.setDate(taskEndDate.getDate() + daysDiff);
            
            try {
                await db.collection('tasks').doc(task.id).update({
                    startDate: taskStartDate.toISOString().split('T')[0],
                    endDate: taskEndDate.toISOString().split('T')[0],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (error) {
                console.error('Error updating dependent task:', error);
            }
        }
    }

    renderNextTasksPanel() {
        const container = document.getElementById('next-tasks-list');
        const nextTasks = this.getNextTasks();
        
        if (nextTasks.length === 0) {
            container.innerHTML = '<p class="next-tasks-empty">全てのタスクが完了したか、ブロックされています</p>';
            return;
        }
        
        container.innerHTML = nextTasks.map(task => {
            const blockedCount = this.getBlockedTasksCount(task.id);
            return `
                <div class="next-task-item" onclick="app.editTask('${task.id}')">
                    <div class="next-task-title">${this.escapeHtml(task.title)}</div>
                    <div class="next-task-meta">
                        <span class="next-task-user">${this.escapeHtml(task.userName)}</span>
                        <span class="next-task-date">${task.startDate} 〜 ${task.endDate}</span>
                    </div>
                    ${blockedCount > 0 ? `<div class="next-task-impact">🔗 ${blockedCount}個のタスクをブロック中</div>` : ''}
                </div>
            `;
        }).join('');
    }

    getBlockedTasksCount(taskId) {
        // Count how many tasks are blocked by this task
        return this.tasks.filter(task => {
            const deps = task.dependencies || [];
            return deps.includes(taskId) && task.status !== 'Completed';
        }).length;
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
        const dependencies = this.getSelectedDependencies();

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
        // For existing tasks, check if adding these dependencies creates a cycle
        // For new tasks, check each dependency to ensure they don't create cycles
        if (taskId) {
            if (this.detectCircularDependency(taskId, dependencies)) {
                alert('循環依存が検出されました。依存関係を確認してください。');
                return;
            }
        } else {
            // For new tasks, check if any selected dependency has a chain back to another selected dependency
            for (const depId of dependencies) {
                const depTask = this.getTaskById(depId);
                if (!depTask) continue;
                
                // Check if this dependency has a transitive dependency on any other selected dependency
                const otherDeps = dependencies.filter(d => d !== depId);
                for (const otherId of otherDeps) {
                    if (this.detectCircularDependency(otherId, depTask.dependencies || [])) {
                        alert('循環依存が検出されました。選択した依存タスク間に依存関係のチェーンがあります。');
                        return;
                    }
                }
            }
        }

        // Validate that start date is after all dependency end dates
        const latestDepEndDate = this.calculateLatestDependencyEndDate(dependencies);
        if (latestDepEndDate && new Date(startDate) < latestDepEndDate) {
            const suggestedDate = new Date(latestDepEndDate);
            suggestedDate.setDate(suggestedDate.getDate() + 1);
            if (!confirm(`警告: 依存タスクの終了日より前に開始されています。\n推奨開始日: ${suggestedDate.toISOString().split('T')[0]}\n\nこのまま続行しますか？`)) {
                return;
            }
        }

        this.showLoading(true);

        const oldTask = taskId ? this.getTaskById(taskId) : null;
        const taskData = {
            title,
            userName,
            assignee: assignee || '',
            startDate,
            endDate,
            status,
            description: description || '',
            dependencies: dependencies,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (taskId) {
                // Update existing task
                await db.collection('tasks').doc(taskId).update(taskData);
                
                // If end date changed, update dependent tasks
                if (oldTask && oldTask.endDate !== endDate) {
                    await this.updateDependentTasks(taskId, oldTask.endDate, endDate);
                }
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
        
        // Populate and set dependencies
        this.populateDependencyOptions(taskId);
        this.setSelectedDependencies(task.dependencies || []);
        
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
            document.getElementById('next-tasks-list').innerHTML = '<p class="next-tasks-empty">タスクがありません</p>';
            return;
        }

        // Render next tasks panel
        this.renderNextTasksPanel();

        // Group tasks by userName
        const tasksByUser = this.groupTasksByUser();
        
        // If we have users, render grouped view; otherwise fallback to standard view
        if (Object.keys(tasksByUser).length > 0) {
            this.renderUserGroupedGantt(container, tasksByUser);
        } else {
            this.renderStandardGantt(container);
        }
        
        // Draw dependency lines after a short delay to ensure DOM is ready
        setTimeout(() => this.drawDependencyLines(), 100);
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
        const ganttTasks = tasks.map(task => {
            const isBlocked = this.isTaskBlocked(task.id);
            const isNextTask = this.getNextTasks().some(t => t.id === task.id);
            let customClass = this.getStatusClass(task.status);
            if (isBlocked) customClass += ' bar-blocked';
            if (isNextTask) customClass += ' bar-next-task';
            
            return {
                id: task.id,
                name: task.title,
                start: task.startDate,
                end: task.endDate,
                progress: this.getProgressFromStatus(task.status),
                custom_class: customClass,
                dependencies: task.dependencies || []
            };
        });

        try {
            // Create new Gantt chart for this user
            new Gantt(container, ganttTasks, {
                view_mode: this.ganttViewMode,
                date_format: 'YYYY-MM-DD',
                custom_popup_html: (task) => {
                    const taskData = this.tasks.find(t => t.id === task.id);
                    const isBlocked = this.isTaskBlocked(task.id);
                    const dependencies = this.getTaskDependencies(task.id);
                    const dependentTasks = this.tasks.filter(t => (t.dependencies || []).includes(task.id));
                    
                    let popupHtml = `
                        <div class="gantt-popup">
                            <h3>${task.name}</h3>
                            ${taskData.userName ? `<p><strong>ユーザー:</strong> ${taskData.userName}</p>` : ''}
                            ${taskData.assignee ? `<p><strong>担当者:</strong> ${taskData.assignee}</p>` : ''}
                            <p><strong>状態:</strong> ${this.translateStatus(taskData.status)}</p>
                            ${isBlocked ? '<p class="popup-blocked">⚠️ ブロック中（依存タスク未完了）</p>' : ''}
                            <p><strong>期間:</strong> ${task.start} - ${task.end}</p>`;
                    
                    if (dependencies.length > 0) {
                        popupHtml += '<p><strong>依存タスク:</strong><ul>';
                        dependencies.forEach(depId => {
                            const depTask = this.getTaskById(depId);
                            if (depTask) {
                                const depStatus = depTask.status === 'Completed' ? '✓' : '⏳';
                                popupHtml += `<li>${depStatus} ${depTask.title}</li>`;
                            }
                        });
                        popupHtml += '</ul></p>';
                    }
                    
                    if (dependentTasks.length > 0) {
                        popupHtml += `<p><strong>このタスクに依存:</strong> ${dependentTasks.length}個のタスク</p>`;
                    }
                    
                    if (taskData.description) {
                        popupHtml += `<p><strong>説明:</strong> ${taskData.description}</p>`;
                    }
                    
                    popupHtml += '</div>';
                    return popupHtml;
                },
                on_click: (task) => {
                    // Optional: handle task click
                },
                on_date_change: async (task, start, end) => {
                    const oldTask = this.getTaskById(task.id);
                    const oldEndDate = oldTask.endDate;
                    const newStartDate = start.toISOString().split('T')[0];
                    const newEndDate = end.toISOString().split('T')[0];
                    
                    // Update task dates in Firestore
                    try {
                        await db.collection('tasks').doc(task.id).update({
                            startDate: newStartDate,
                            endDate: newEndDate,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        // Update dependent tasks if end date changed
                        if (oldEndDate !== newEndDate) {
                            await this.updateDependentTasks(task.id, oldEndDate, newEndDate);
                        }
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
                    return `
                        <div class="gantt-popup">
                            <h3>${task.name}</h3>
                            ${taskData.userName ? `<p><strong>ユーザー:</strong> ${taskData.userName}</p>` : ''}
                            ${taskData.assignee ? `<p><strong>担当者:</strong> ${taskData.assignee}</p>` : ''}
                            <p><strong>状態:</strong> ${this.translateStatus(taskData.status)}</p>
                            <p><strong>期間:</strong> ${task.start} - ${task.end}</p>
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

        container.innerHTML = this.tasks.map(task => `
            <div class="task-item">
                <div class="task-item-header">
                    <div>
                        <div class="task-item-title">${this.escapeHtml(task.title)}</div>
                        <span class="task-item-status status-${this.getStatusSlug(task.status)}">
                            ${this.translateStatus(task.status)}
                        </span>
                    </div>
                </div>
                <div class="task-item-details">
                    ${task.userName ? `<div class="task-item-detail"><strong>ユーザー:</strong> ${this.escapeHtml(task.userName)}</div>` : ''}
                    ${task.assignee ? `<div class="task-item-detail"><strong>担当者:</strong> ${this.escapeHtml(task.assignee)}</div>` : ''}
                    <div class="task-item-detail"><strong>開始日:</strong> ${task.startDate}</div>
                    <div class="task-item-detail"><strong>終了日:</strong> ${task.endDate}</div>
                    ${task.description ? `<div class="task-item-detail"><strong>説明:</strong> ${this.escapeHtml(task.description)}</div>` : ''}
                </div>
                <div class="task-item-actions">
                    <button class="btn-edit" onclick="app.editTask('${task.id}')">編集</button>
                    <button class="btn-danger" onclick="app.deleteTask('${task.id}')">削除</button>
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

    // Draw dependency lines between tasks
    drawDependencyLines() {
        // Remove any existing dependency SVG
        const existingSvg = document.getElementById('dependency-svg');
        if (existingSvg) {
            existingSvg.remove();
        }

        const ganttContainer = document.getElementById('gantt-container');
        if (!ganttContainer || this.tasks.length === 0) return;

        // Create SVG overlay
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'dependency-svg';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';

        // Make gantt container relative for absolute positioning
        ganttContainer.style.position = 'relative';
        ganttContainer.appendChild(svg);

        // Draw lines for each task with dependencies
        this.tasks.forEach(task => {
            const dependencies = task.dependencies || [];
            dependencies.forEach(depId => {
                const fromBar = document.querySelector(`.bar[data-id="${depId}"]`);
                const toBar = document.querySelector(`.bar[data-id="${task.id}"]`);

                if (fromBar && toBar) {
                    const fromRect = fromBar.getBoundingClientRect();
                    const toRect = toBar.getBoundingClientRect();
                    const containerRect = ganttContainer.getBoundingClientRect();

                    // Calculate positions relative to gantt container
                    const x1 = fromRect.right - containerRect.left;
                    const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
                    const x2 = toRect.left - containerRect.left;
                    const y2 = toRect.top + toRect.height / 2 - containerRect.top;

                    // Create path
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const midX = (x1 + x2) / 2;
                    const pathData = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
                    path.setAttribute('d', pathData);
                    path.setAttribute('stroke', '#667eea');
                    path.setAttribute('stroke-width', '2');
                    path.setAttribute('fill', 'none');
                    path.setAttribute('marker-end', 'url(#arrowhead)');

                    svg.appendChild(path);
                }
            });
        });

        // Add arrowhead marker definition
        if (this.tasks.some(t => (t.dependencies || []).length > 0)) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrowhead');
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3, 0 6');
            polygon.setAttribute('fill', '#667eea');

            marker.appendChild(polygon);
            defs.appendChild(marker);
            svg.insertBefore(defs, svg.firstChild);
        }
    }
}

// Initialize the app
const app = new TaskManager();

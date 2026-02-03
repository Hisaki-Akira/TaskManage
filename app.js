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
        
        // Cache for expensive calculations
        this.cachedNextTaskIds = [];
        this.cachedCriticalPathIds = [];
        this.cacheValid = false;
        
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
        this.renderDependenciesInModal();
        document.getElementById('task-modal').classList.remove('hidden');
        document.getElementById('modal-title').textContent = '新しいタスクを作成';
        document.getElementById('submit-btn').textContent = 'タスクを作成';
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    renderDependenciesInModal() {
        const container = document.getElementById('task-dependencies-list');
        if (!container) return;

        const currentTaskId = document.getElementById('task-id').value;
        
        // Get available tasks (exclude current task and completed tasks for better UX)
        const availableTasks = this.tasks.filter(t => 
            t.id !== currentTaskId
        ).sort((a, b) => a.startDate.localeCompare(b.startDate));

        if (availableTasks.length === 0) {
            container.innerHTML = '<p class="no-dependencies">利用可能な依存タスクはありません</p>';
            return;
        }

        container.innerHTML = availableTasks.map(task => {
            const statusBadge = this.getStatusBadgeForDependency(task);
            return `
                <label class="dependency-item">
                    <input type="checkbox" class="dependency-checkbox" value="${task.id}" id="dep-${task.id}">
                    <span class="dependency-info">
                        <span class="dependency-title">${this.escapeHtml(task.title)}</span>
                        <span class="dependency-meta">
                            ${statusBadge}
                            <span class="dependency-dates">${task.startDate} 〜 ${task.endDate}</span>
                        </span>
                    </span>
                </label>
            `;
        }).join('');

        // Add change listener to validate circular dependencies
        const checkboxes = container.querySelectorAll('.dependency-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateDependencies());
        });
    }

    getStatusBadgeForDependency(task) {
        const statusClass = this.getStatusSlug(task.status);
        return `<span class="dependency-status status-${statusClass}">${this.translateStatus(task.status)}</span>`;
    }

    validateDependencies() {
        const taskId = document.getElementById('task-id').value || 'new-task';
        const selectedDeps = this.getSelectedDependencies();
        const warningDiv = document.getElementById('dependency-warning');
        
        if (warningDiv) {
            if (taskId !== 'new-task' && this.hasCircularDependency(taskId, selectedDeps)) {
                warningDiv.textContent = '⚠️ 循環依存関係が検出されました。このタスクに依存する他のタスクを選択することはできません。';
                warningDiv.style.display = 'block';
                document.getElementById('submit-btn').disabled = true;
            } else {
                warningDiv.style.display = 'none';
                document.getElementById('submit-btn').disabled = false;
            }
        }
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
                    const data = doc.data();
                    // Ensure dependencies field exists for backward compatibility
                    if (!data.dependencies) {
                        data.dependencies = [];
                    }
                    this.tasks.push({
                        id: doc.id,
                        ...data
                    });
                });
                
                // Invalidate cache when tasks change
                this.cacheValid = false;
                
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

        if (!title || !userName || !startDate || !endDate) {
            alert('必須項目をすべて入力してください');
            return;
        }

        // Validate dates
        if (new Date(endDate) < new Date(startDate)) {
            alert('終了日は開始日より前にできません');
            return;
        }

        this.showLoading(true);

        // Get dependencies from the form
        const dependencies = this.getSelectedDependencies();

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
        
        document.getElementById('modal-title').textContent = 'タスクを編集';
        document.getElementById('submit-btn').textContent = 'タスクを更新';
        
        // Render dependencies list
        this.renderDependenciesInModal();
        
        // Open modal
        document.getElementById('task-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Populate dependencies after modal is open and dependencies list is rendered
        setTimeout(() => {
            this.populateDependenciesInModal(task);
        }, 100);
    }

    populateDependenciesInModal(task) {
        // Check the appropriate dependency checkboxes
        if (task.dependencies && task.dependencies.length > 0) {
            task.dependencies.forEach(depId => {
                const checkbox = document.getElementById(`dep-${depId}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
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
        // Clear dependency checkboxes
        const checkboxes = document.querySelectorAll('.dependency-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
    }

    getSelectedDependencies() {
        const checkboxes = document.querySelectorAll('.dependency-checkbox:checked');
        const dependencies = [];
        checkboxes.forEach(cb => dependencies.push(cb.value));
        return dependencies.length > 0 ? dependencies : [];
    }

    // Dependency and scheduling methods
    updateSchedulingCache() {
        // Only recalculate if cache is invalid
        if (this.cacheValid) {
            return;
        }
        
        this.cachedNextTaskIds = this.calculateNextTasks().map(t => t.id);
        this.cachedCriticalPathIds = this.calculateCriticalPath();
        this.cacheValid = true;
    }

    getNextTaskIds() {
        this.updateSchedulingCache();
        return this.cachedNextTaskIds;
    }

    getCriticalPathIds() {
        this.updateSchedulingCache();
        return this.cachedCriticalPathIds;
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
        // A task is blocked if it has uncompleted dependencies
        if (!task.dependencies || task.dependencies.length === 0) {
            return false;
        }
        return task.dependencies.some(depId => {
            const depTask = this.tasks.find(t => t.id === depId);
            return !depTask || depTask.status !== 'Completed';
        });
    }

    getBlockingTasks(task) {
        // Get list of tasks that are blocking this task
        if (!task.dependencies || task.dependencies.length === 0) {
            return [];
        }
        return task.dependencies
            .map(depId => this.tasks.find(t => t.id === depId))
            .filter(t => t && t.status !== 'Completed');
    }

    calculateNextTasks() {
        // Find tasks that are ready to be worked on
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        return this.tasks.filter(task => {
            // Must not be completed or on hold
            if (task.status === 'Completed' || task.status === 'On Hold') {
                return false;
            }
            // All dependencies must be completed
            if (!this.isTaskReady(task)) {
                return false;
            }
            // Start date should be today or in the past
            if (task.startDate > todayStr) {
                return false;
            }
            return true;
        }).sort((a, b) => {
            // Sort by start date (earlier first)
            return a.startDate.localeCompare(b.startDate);
        });
    }

    calculateCriticalPath() {
        // Simplified critical path: longest chain of dependencies
        const taskMap = new Map(this.tasks.map(t => [t.id, t]));
        const visited = new Set();
        const pathLengths = new Map();

        const calculatePathLength = (taskId) => {
            if (pathLengths.has(taskId)) {
                return pathLengths.get(taskId);
            }
            if (visited.has(taskId)) {
                return 0; // Circular dependency
            }
            
            visited.add(taskId);
            const task = taskMap.get(taskId);
            if (!task) return 0;

            let maxDepLength = 0;
            if (task.dependencies && task.dependencies.length > 0) {
                for (const depId of task.dependencies) {
                    const depLength = calculatePathLength(depId);
                    maxDepLength = Math.max(maxDepLength, depLength);
                }
            }

            const taskDuration = this.getTaskDuration(task);
            const pathLength = maxDepLength + taskDuration;
            pathLengths.set(taskId, pathLength);
            visited.delete(taskId);
            return pathLength;
        };

        // Calculate path length for all tasks
        this.tasks.forEach(task => calculatePathLength(task.id));

        // Find maximum path length
        const maxLength = Math.max(...Array.from(pathLengths.values()));

        // Tasks on critical path are those with maximum path length
        const criticalTasks = this.tasks.filter(task => {
            return pathLengths.get(task.id) === maxLength;
        });

        return criticalTasks.map(t => t.id);
    }

    getTaskDuration(task) {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    }

    getAffectedDownstreamTasks(taskId) {
        // Find all tasks that depend on this task (directly or indirectly)
        const affected = new Set();
        const toProcess = [taskId];
        
        while (toProcess.length > 0) {
            const currentId = toProcess.pop();
            
            this.tasks.forEach(task => {
                if (task.dependencies && task.dependencies.includes(currentId) && !affected.has(task.id)) {
                    affected.add(task.id);
                    toProcess.push(task.id);
                }
            });
        }
        
        return Array.from(affected);
    }

    hasCircularDependency(taskId, newDependencies) {
        // Check if adding these dependencies would create a circular reference
        const visited = new Set();
        const recursionStack = new Set();

        const hasCycle = (currentId, deps) => {
            if (!visited.has(currentId)) {
                visited.add(currentId);
                recursionStack.add(currentId);

                const currentDeps = currentId === taskId ? deps : 
                    (this.tasks.find(t => t.id === currentId)?.dependencies || []);

                for (const depId of currentDeps) {
                    if (!visited.has(depId)) {
                        if (hasCycle(depId, deps)) {
                            return true;
                        }
                    } else if (recursionStack.has(depId)) {
                        return true;
                    }
                }
            }
            recursionStack.delete(currentId);
            return false;
        };

        return hasCycle(taskId, newDependencies);
    }

    // Gantt Chart Methods
    renderGanttChart() {
        const container = document.getElementById('gantt-container');
        
        // Render next tasks panel
        this.renderNextTasksPanel();
        
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

    renderNextTasksPanel() {
        const panel = document.getElementById('next-tasks-list');
        if (!panel) return;

        const nextTasks = this.calculateNextTasks();
        
        if (nextTasks.length === 0) {
            panel.innerHTML = '<div class="no-next-tasks">🎉 現在作業可能なタスクはありません。すべてのタスクが進行中または依存関係待ちです。</div>';
            return;
        }

        panel.innerHTML = nextTasks.map(task => {
            const blockingTasks = this.getBlockingTasks(task);
            const isReady = this.isTaskReady(task);
            
            return `
                <div class="next-task-card" onclick="app.editTask('${task.id}')">
                    <div class="next-task-header">
                        <div class="next-task-title">${this.escapeHtml(task.title)}</div>
                        ${isReady ? '<span class="next-task-badge">準備完了</span>' : ''}
                    </div>
                    <div class="next-task-info">
                        ${task.userName ? `<div class="next-task-info-item">👤 ${this.escapeHtml(task.userName)}</div>` : ''}
                        <div class="next-task-info-item">📅 ${task.startDate} 〜 ${task.endDate}</div>
                        ${task.dependencies && task.dependencies.length > 0 ? 
                            `<div class="next-task-info-item">🔗 依存: ${task.dependencies.length}件</div>` : 
                            '<div class="next-task-info-item">🔗 依存なし</div>'}
                    </div>
                </div>
            `;
        }).join('');
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
        // Use cached calculations
        const nextTaskIds = this.getNextTaskIds();
        const criticalPathIds = this.getCriticalPathIds();
        
        // Convert tasks to Gantt format
        const ganttTasks = tasks.map(task => {
            let customClass = this.getStatusClass(task.status);
            
            // Add special classes for next tasks and critical path
            if (nextTaskIds.includes(task.id)) {
                customClass += ' bar-next-task';
            }
            if (criticalPathIds.includes(task.id)) {
                customClass += ' bar-critical-path';
            }
            if (this.isTaskBlocked(task)) {
                customClass += ' bar-blocked';
            }
            
            return {
                id: task.id,
                name: task.title,
                start: task.startDate,
                end: task.endDate,
                progress: this.getProgressFromStatus(task.status),
                dependencies: task.dependencies ? task.dependencies.filter(depId => 
                    tasks.some(t => t.id === depId)
                ).join(',') : '',
                custom_class: customClass
            };
        });

        try {
            // Create new Gantt chart for this user
            new Gantt(container, ganttTasks, {
                view_mode: this.ganttViewMode,
                date_format: 'YYYY-MM-DD',
                custom_popup_html: (task) => {
                    const taskData = this.tasks.find(t => t.id === task.id);
                    const isBlocked = this.isTaskBlocked(taskData);
                    const blockingTasks = this.getBlockingTasks(taskData);
                    const isNextTask = nextTaskIds.includes(task.id);
                    const isCriticalPath = criticalPathIds.includes(task.id);
                    
                    let badges = '';
                    if (isNextTask) badges += '<span class="task-state-badge task-state-ready">次のタスク</span>';
                    if (isCriticalPath) badges += '<span class="task-state-badge task-state-critical">クリティカルパス</span>';
                    if (isBlocked) badges += '<span class="task-state-badge task-state-blocked">ブロック中</span>';
                    
                    let blockingInfo = '';
                    if (isBlocked && blockingTasks.length > 0) {
                        blockingInfo = `
                            <div class="task-blocked-indicator">
                                <div class="task-blocked-title">⚠️ 以下のタスクに依存しています：</div>
                                <ul class="blocking-tasks-list">
                                    ${blockingTasks.map(bt => `<li>• ${this.escapeHtml(bt.title)} (${this.translateStatus(bt.status)})</li>`).join('')}
                                </ul>
                            </div>
                        `;
                    }
                    
                    let dependencyInfo = '';
                    if (taskData.dependencies && taskData.dependencies.length > 0) {
                        const depTasks = taskData.dependencies.map(depId => 
                            this.tasks.find(t => t.id === depId)
                        ).filter(t => t);
                        
                        if (depTasks.length > 0) {
                            dependencyInfo = `
                                <p><strong>依存タスク:</strong></p>
                                <ul style="margin: 5px 0; padding-left: 20px;">
                                    ${depTasks.map(dt => `<li>${this.escapeHtml(dt.title)} (${this.translateStatus(dt.status)})</li>`).join('')}
                                </ul>
                            `;
                        }
                    }
                    
                    return `
                        <div class="gantt-popup">
                            <h3>${task.name} ${badges}</h3>
                            ${taskData.userName ? `<p><strong>ユーザー:</strong> ${taskData.userName}</p>` : ''}
                            ${taskData.assignee ? `<p><strong>担当者:</strong> ${taskData.assignee}</p>` : ''}
                            <p><strong>状態:</strong> ${this.translateStatus(taskData.status)}</p>
                            <p><strong>期間:</strong> ${task.start} - ${task.end}</p>
                            ${dependencyInfo}
                            ${taskData.description ? `<p><strong>説明:</strong> ${taskData.description}</p>` : ''}
                            ${blockingInfo}
                        </div>
                    `;
                },
                on_click: (task) => {
                    // Optional: handle task click
                },
                on_date_change: async (task, start, end) => {
                    // Update task dates in Firestore
                    try {
                        const newStartDate = start.toISOString().split('T')[0];
                        const newEndDate = end.toISOString().split('T')[0];
                        
                        await db.collection('tasks').doc(task.id).update({
                            startDate: newStartDate,
                            endDate: newEndDate,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        // Show affected downstream tasks
                        this.showScheduleImpact(task.id);
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

    showScheduleImpact(taskId) {
        const affectedTaskIds = this.getAffectedDownstreamTasks(taskId);
        
        if (affectedTaskIds.length === 0) {
            return;
        }
        
        const affectedTasks = affectedTaskIds.map(id => this.tasks.find(t => t.id === id)).filter(t => t);
        
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'schedule-impact-warning';
        notification.innerHTML = `
            <div class="schedule-impact-title">⚠️ スケジュール変更の影響</div>
            <p>以下のタスクが影響を受ける可能性があります：</p>
            <ul class="affected-tasks-list">
                ${affectedTasks.map(t => `<li>• ${this.escapeHtml(t.title)}</li>`).join('')}
            </ul>
        `;
        
        const container = document.getElementById('gantt-container');
        container.insertBefore(notification, container.firstChild);
        
        // Remove notification after 10 seconds
        setTimeout(() => {
            notification.remove();
        }, 10000);
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

        // Use cached calculations
        const nextTaskIds = this.getNextTaskIds();
        const criticalPathIds = this.getCriticalPathIds();

        container.innerHTML = this.tasks.map(task => {
            const isNextTask = nextTaskIds.includes(task.id);
            const isCriticalPath = criticalPathIds.includes(task.id);
            const isBlocked = this.isTaskBlocked(task);
            const isReady = this.isTaskReady(task);
            
            let badges = '';
            if (isNextTask) badges += '<span class="task-state-badge task-state-ready">次のタスク</span>';
            if (isCriticalPath) badges += '<span class="task-state-badge task-state-critical">クリティカルパス</span>';
            if (isBlocked) badges += '<span class="task-state-badge task-state-blocked">ブロック中</span>';
            else if (isReady && task.status === 'Not Started') badges += '<span class="task-state-badge task-state-ready">準備完了</span>';
            
            let dependenciesInfo = '';
            if (task.dependencies && task.dependencies.length > 0) {
                const depTasks = task.dependencies.map(depId => 
                    this.tasks.find(t => t.id === depId)
                ).filter(t => t);
                
                if (depTasks.length > 0) {
                    const depTags = depTasks.map(dt => {
                        const isCompleted = dt.status === 'Completed';
                        const tagClass = isCompleted ? 'completed' : 'pending';
                        return `<span class="task-dependency-tag ${tagClass}">${this.escapeHtml(dt.title)} (${this.translateStatus(dt.status)})</span>`;
                    }).join('');
                    
                    dependenciesInfo = `
                        <div class="task-dependencies-info">
                            <strong>依存タスク:</strong>
                            <div>${depTags}</div>
                        </div>
                    `;
                }
            }
            
            return `
                <div class="task-item">
                    <div class="task-item-header">
                        <div>
                            <div class="task-item-title">${this.escapeHtml(task.title)}${badges}</div>
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
                        ${dependenciesInfo}
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
}

// Initialize the app
const app = new TaskManager();

(function () {
    // --- DOM elements ---
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addTaskBtn');
    const tasksList = document.getElementById('tasksList');
    const taskCounterSpan = document.getElementById('taskCounter');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Tab buttons
    const tabAll = document.getElementById('tabAll');
    const tabActive = document.getElementById('tabActive');
    const tabCompleted = document.getElementById('tabCompleted');

    // --- Local storage key ---
    const STORAGE_KEY = 'dailySmoothTasksAdvanced';

    // --- App state ---
    let tasks = [];               // each task: { id, text, completed }
    let currentFilter = 'all';     // 'all', 'active', 'completed'

    // --- Load from localStorage ---
    function loadTasksFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                tasks = JSON.parse(stored);
                if (!Array.isArray(tasks)) tasks = [];
            } catch (e) {
                tasks = [];
            }
        }
        // ensure each task has completed property (for old storage)
        tasks = tasks.map(t => ({ ...t, completed: t.completed || false }));
        renderTasks();
    }

    // --- Save to localStorage ---
    function persistTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // --- Generate unique ID ---
    function generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 8);
    }

    // --- Add new task (default active = not completed) ---
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            taskInput.style.backgroundColor = '#fff2f0';
            setTimeout(() => taskInput.style.backgroundColor = '', 150);
            return;
        }

        const newTask = {
            id: generateId(),
            text: text,
            completed: false
        };
        tasks.unshift(newTask);
        persistTasks();
        renderTasks();

        taskInput.value = '';
        taskInput.focus();
    }

    // --- Toggle task completion ---
    function toggleTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            persistTasks();
            renderTasks();
        }
    }

    // --- Delete task ---
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        persistTasks();
        renderTasks();
    }

    // --- Clear all tasks ---
    function clearAllTasks() {
        if (tasks.length === 0) return;
        if (confirm('Delete all tasks permanently?')) {
            tasks = [];
            persistTasks();
            renderTasks();
        }
    }

    // --- Set active filter and re-render ---
    function setFilter(filter) {
        currentFilter = filter;
        // update active tab UI
        [tabAll, tabActive, tabCompleted].forEach(tab => tab.classList.remove('active'));
        if (filter === 'all') tabAll.classList.add('active');
        else if (filter === 'active') tabActive.classList.add('active');
        else if (filter === 'completed') tabCompleted.classList.add('active');

        renderTasks();
    }

    // --- Get filtered tasks based on currentFilter ---
    function getFilteredTasks() {
        if (currentFilter === 'active') {
            return tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            return tasks.filter(task => task.completed);
        }
        return tasks; // 'all'
    }

    // --- Render list and counter ---
    function renderTasks() {
        const filtered = getFilteredTasks();
        const totalCount = tasks.length;
        const activeCount = tasks.filter(t => !t.completed).length;
        const completedCount = tasks.filter(t => t.completed).length;

        // Update counter text based on filter
        if (currentFilter === 'active') {
            taskCounterSpan.textContent = `${activeCount} active`;
        } else if (currentFilter === 'completed') {
            taskCounterSpan.textContent = `${completedCount} completed`;
        } else {
            taskCounterSpan.textContent = `${totalCount} task${totalCount !== 1 ? 's' : ''}`;
        }

        tasksList.innerHTML = '';

        if (filtered.length === 0) {
            // empty state with friendly message
            const emptyLi = document.createElement('li');
            emptyLi.className = 'empty-state';
            let message = 'No tasks';
            if (currentFilter === 'active') message = 'No active tasks ✨';
            else if (currentFilter === 'completed') message = 'No completed tasks yet';
            else message = 'Your task list is empty';

            emptyLi.innerHTML = `
                        <i class="far fa-smile-wink"></i>
                        <p>${message}<br><span style="font-size:0.9rem;">add one above</span></p>
                    `;
            tasksList.appendChild(emptyLi);
        } else {
            filtered.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                taskItem.setAttribute('data-id', task.id);

                // checkbox circle
                const checkDiv = document.createElement('div');
                checkDiv.className = `task-check ${task.completed ? 'completed' : ''}`;
                checkDiv.innerHTML = task.completed ? '<i class="fas fa-check"></i>' : '';
                checkDiv.setAttribute('aria-label', 'toggle completion');

                // toggle event
                checkDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                });

                // task text
                const textSpan = document.createElement('span');
                textSpan.className = `task-text ${task.completed ? 'completed-text' : ''}`;
                textSpan.textContent = task.text;

                // delete button
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-btn';
                delBtn.setAttribute('aria-label', 'delete task');
                delBtn.innerHTML = '<i class="fas fa-times"></i>';
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                });

                taskItem.appendChild(checkDiv);
                taskItem.appendChild(textSpan);
                taskItem.appendChild(delBtn);
                tasksList.appendChild(taskItem);
            });
        }
    }

    // --- Event listeners ---
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });

    clearAllBtn.addEventListener('click', clearAllTasks);

    // Tab listeners
    tabAll.addEventListener('click', () => setFilter('all'));
    tabActive.addEventListener('click', () => setFilter('active'));
    tabCompleted.addEventListener('click', () => setFilter('completed'));

    // Initialize
    loadTasksFromStorage();
})();
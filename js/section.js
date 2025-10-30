
        let currentView = 'myDay'; 
        let currentAllTasksFilter = 'All'; 
        let isAuthReady = false;

        const TODAY = new Date(2025, 9, 29); 

        let tasks = [];

        const LOCAL_STORAGE_KEY = 'myDayTasks';

        function loadTasks() {
            try {
                const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (storedTasks) {
                    tasks = JSON.parse(storedTasks);
                    console.log('Tasks loaded successfully from localStorage.');
                } else {
                    tasks = [];
                    console.log('No tasks found in localStorage. Starting with an empty list.');
                }
            } catch (error) {
                console.error("Error loading tasks from localStorage:", error);
                tasks = []; 
            }
        }

        function saveTasks() {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
                console.log('Tasks saved to localStorage.');
            } catch (error) {
                console.error("Error saving tasks to localStorage:", error);
                
            }
        }


        function parseDate(dateStr) {
            if (!dateStr) return null;
            const parts = dateStr.split('-');

            return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        }

        function formatDate(dateStr) {
            const date = parseDate(dateStr);
            if (!date) return 'No Due Date';
            
            const oneDay = 24 * 60 * 60 * 1000;
            const today = new Date(Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()));
            
            const diffDays = Math.round((date.getTime() - today.getTime()) / oneDay);
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            if (diffDays < 0) {
                 const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                 return monthNames[date.getUTCMonth()] + ' ' + date.getUTCDate(); 
            }
            
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return monthNames[date.getUTCMonth()] + ' ' + date.getUTCDate();
        }

        function getDueDateGroup(dateStr) {
            const date = parseDate(dateStr);
            if (!date) return 'Later';

            const oneDay = 24 * 60 * 60 * 1000;
            const today = new Date(Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()));

            const diffDays = Math.round((date.getTime() - today.getTime()) / oneDay);

            if (diffDays < 0) return 'Overdue';
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            if (diffDays <= 7) return 'This Week'; 
            return 'Later';
        }


        function showMessage(message, bgColor = '#2563eb') {
            const msgBox = document.getElementById('message-box');
            msgBox.textContent = message;
            msgBox.style.backgroundColor = bgColor;
            
            
            msgBox.classList.add('show');

            setTimeout(() => {
                msgBox.classList.remove('show');
            }, 2500);
        }

        window.toggleTaskCompletion = function(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.isCompleted = !task.isCompleted;
                saveTasks(); 
                renderApp();
            }
        }

        window.toggleTaskImportance = function(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.isImportant = !task.isImportant;
                saveTasks(); 
                renderApp();
            }
        }
        
        function renderProgress(taskList) {
            const total = taskList.length;
            const completed = taskList.filter(t => t.isCompleted).length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            const progressColor = percentage === 100 ? '#059669' : '#2563eb'; // Green or Blue
            
            return `
                <div class="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h3 class="text-sm font-medium" style="color: #4b5563; margin-bottom: 0.5rem;">
                        ${currentView === 'myDay' ? "Today's Progress" : "Progress"}
                    </h3>
                    <div class="flex items-center space-x-4">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${percentage}%; background-color: ${progressColor};"></div>
                        </div>
                        <p class="text-sm font-semibold whitespace-nowrap" style="color: #1f2937;">
                            ${completed} of ${total} completed
                        </p>
                    </div>
                </div>
            `;
        }
        
        function renderTaskItem(task) {
            const isCompletedClass = task.isCompleted ? 'opacity-50 line-through' : '';
            const dueDateText = formatDate(task.dueDate);
            const isOverdue = getDueDateGroup(task.dueDate) === 'Overdue' && !task.isCompleted;
            const dueDateColor = isOverdue ? 'color: #ef4444; font-weight: bold;' : 'color: #9ca3af;';

            let priorityTag = '';
            if (task.priority !== 'Low') {
                const priorityClass = `priority-${task.priority}`;
                priorityTag = `<span class="task-priority-tag ${priorityClass}">${task.priority}</span>`;
            }

            return `
                <div id="task-${task.id}" class="task-item">
                    <!-- Left side: Checkbox and Text -->
                    <div class="flex items-center flex-grow">
                        <input type="checkbox" id="check-${task.id}" class="task-checkbox" ${task.isCompleted ? 'checked' : ''} 
                            onchange="toggleTaskCompletion(${task.id})" onclick="event.stopPropagation()">
                        
                        <div class="task-content ${isCompletedClass}">
                            <div style="color: #1f2937; font-size: 1.125rem; font-weight: 500;" class="truncate">${task.title}</div>
                            <div class="task-details">
                                <span style="color: #6b7280;">${task.category}</span>
                                <span style="font-weight: bold; color: #9ca3af;">&middot;</span>
                                <span style="${dueDateColor}">${dueDateText}</span>
                                ${priorityTag}
                            </div>
                        </div>
                    </div>

                    <!-- Right side: Important Star -->
                    <div class="flex-shrink-0" style="margin-left: 1rem;">
                        <button onclick="toggleTaskImportance(${task.id})" style="padding: 0.25rem; background: none; border: none; cursor: pointer; border-radius: 9999px; transition: background-color 0.15s;" 
                            onmouseover="this.style.backgroundColor='#fef3c7'" onmouseout="this.style.backgroundColor='transparent'" aria-label="Toggle importance">
                            <!-- Star Icon -->
                            <svg class="w-5 h-5" style="fill: ${task.isImportant ? '#f59e0b' : 'none'}; color: ${task.isImportant ? '#f59e0b' : '#d1d5db'};" 
                                stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M11.049 2.222a.5.5 0 01.902 0l1.3 2.62a.5.5 0 00.373.272l2.91.423a.5.5 0 01.277.853l-2.106 2.053a.5.5 0 00-.144.444l.498 2.895a.5.5 0 01-.724.526l-2.597-1.365a.5.5 0 00-.466 0l-2.597 1.365a.5.5 0 01-.724-.526l.498-2.895a.5.5 0 00-.144-.444L3.63 6.39a.5.5 0 01.277-.853l2.91-.423a.5.5 0 00.373-.272l1.3-2.62z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        function renderTaskGroup(heading, count, groupTasks) {
            if (groupTasks.length === 0) return '';
            
            const taskItems = groupTasks.map(renderTaskItem).join('');
            
            return `
                <h3 class="text-lg font-semibold" style="color: #374151; margin-top: 1.5rem; margin-bottom: 0.5rem;">${heading} 
                    <span class="text-sm font-normal" style="color: #6b7280; margin-left: 0.25rem;">${count}</span>
                </h3>
                <div class="space-y-3">
                    ${taskItems}
                </div>
            `;
        }
        
        function renderMyDay() {
            const todayTasks = tasks.filter(t => !t.isCompleted && getDueDateGroup(t.dueDate) === 'Today');
            const completedToday = tasks.filter(t => t.isCompleted && getDueDateGroup(t.dueDate) === 'Today');

            const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
            const todayStr = TODAY.toLocaleDateString('en-US', dateOptions);
            const totalTasks = [...todayTasks, ...completedToday];

            let html = `
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-bold" style="color: #1f2937; display: flex; align-items: center; margin-bottom: 0.25rem;">
                            <span class="p-2 rounded-md" style="margin-right: 0.5rem; background-color: #dbeafe; color: #2563eb;">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </span>
                            My Day
                        </h2>
                        <p class="text-sm" style="color: #6b7280; margin-left: 2.5rem;">${todayStr}</p>
                    </div>
                    <button onclick="openModal()" style="display: flex; align-items: center; padding: 0.5rem 1rem; background-color: #10b981; color: white; font-weight: 500; border-radius: 0.5rem; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: background-color 0.15s;" 
                            onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
                        <svg class="w-5 h-5" style="margin-right: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Task
                    </button>
                </div>
                ${renderProgress(totalTasks)}
                <div class="space-y-3">
                    ${todayTasks.sort((a, b) => (b.isImportant - a.isImportant)).map(renderTaskItem).join('')}
                    ${completedToday.map(renderTaskItem).join('')}
                    ${totalTasks.length === 0 ? '<p class="text-center" style="color: #6b7280; margin-top: 2.5rem;">You are all caught up for today! Add a new task to get started.</p>' : ''}
                </div>
            `;
            document.getElementById('main-content').innerHTML = html;
        }

        function renderImportant() {
            const importantTasks = tasks.filter(t => t.isImportant).sort((a, b) => a.isCompleted - b.isCompleted);
            
            const pendingTasks = importantTasks.filter(t => !t.isCompleted);
            const completedTasks = importantTasks.filter(t => t.isCompleted);
            
            let html = `
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-bold" style="color: #1f2937; display: flex; align-items: center; margin-bottom: 0.25rem;">
                            <span class="p-2 rounded-md" style="margin-right: 0.5rem; background-color: #fef3c7; color: #d97706;">
                                <svg class="w-6 h-6" style="fill: currentColor;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.222a.5.5 0 01.902 0l1.3 2.62a.5.5 0 00.373.272l2.91.423a.5.5 0 01.277.853l-2.106 2.053a.5.5 0 00-.144.444l.498 2.895a.5.5 0 01-.724.526l-2.597-1.365a.5.5 0 00-.466 0l-2.597 1.365a.5.5 0 01-.724-.526l.498-2.895a.5.5 0 00-.144-.444L3.63 6.39a.5.5 0 01.277-.853l2.91-.423a.5.5 0 00.373-.272l1.3-2.62z"></path></svg>
                            </span>
                            Important
                        </h2>
                        <p class="text-sm" style="color: #6b7280; margin-left: 2.5rem;">${importantTasks.length} tasks starred</p>
                    </div>
                    <button onclick="openModal()" style="display: flex; align-items: center; padding: 0.5rem 1rem; background-color: #10b981; color: white; font-weight: 500; border-radius: 0.5rem; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: background-color 0.15s;" 
                            onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
                        <svg class="w-5 h-5" style="margin-right: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Task
                    </button>
                </div>
                ${renderProgress(importantTasks)}
                <div class="space-y-3">
                    ${pendingTasks.map(renderTaskItem).join('')}
                    ${completedTasks.length > 0 ? `<h3 class="text-lg font-semibold" style="color: #374151; margin-top: 1.5rem; margin-bottom: 0.5rem;">Completed <span class="text-sm font-normal" style="color: #6b7280; margin-left: 0.25rem;">${completedTasks.length}</span></h3>${completedTasks.map(renderTaskItem).join('')}` : ''}
                    ${importantTasks.length === 0 ? '<p class="text-center" style="color: #6b7280; margin-top: 2.5rem;">No tasks marked as important. Star a task to see it here.</p>' : ''}
                </div>
            `;
            document.getElementById('main-content').innerHTML = html;
        }

        function renderPlanned() {
            const nonCompletedTasks = tasks.filter(t => !t.isCompleted);
            const groupedTasks = nonCompletedTasks.reduce((acc, task) => {
                const group = getDueDateGroup(task.dueDate);
                if (!acc[group]) acc[group] = [];
                acc[group].push(task);
                return acc;
            }, {});

            const groupOrder = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later'];

            let taskHtml = groupOrder.map(group => {
                const groupTasks = groupedTasks[group] || [];

                groupTasks.sort((a, b) => {
                    const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return priorityMap[b.priority] - priorityMap[a.priority];
                });
                return renderTaskGroup(group, groupTasks.length, groupTasks);
            }).join('');
            
            const totalTasks = nonCompletedTasks.length;

            let html = `
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-bold" style="color: #1f2937; display: flex; align-items: center; margin-bottom: 0.25rem;">
                            <span class="p-2 rounded-md" style="margin-right: 0.5rem; background-color: #f3e8ff; color: #9333ea;">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </span>
                            Planned
                        </h2>
                        <p class="text-sm" style="color: #6b7280; margin-left: 2.5rem;">${totalTasks} tasks scheduled</p>
                    </div>
                    <button onclick="openModal()" style="display: flex; align-items: center; padding: 0.5rem 1rem; background-color: #10b981; color: white; font-weight: 500; border-radius: 0.5rem; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: background-color 0.15s;" 
                            onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
                        <svg class="w-5 h-5" style="margin-right: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Task
                    </button>
                </div>
                <div class="space-y-3">
                    ${taskHtml}
                    ${totalTasks === 0 ? '<p class="text-center" style="color: #6b7280; margin-top: 2.5rem;">You have no tasks scheduled. Add a task with a due date to see it here.</p>' : ''}
                </div>
            `;
            document.getElementById('main-content').innerHTML = html;
        }

        function renderAllTasks() {
            let filteredTasks = tasks;
            if (currentAllTasksFilter !== 'All') {
                filteredTasks = tasks.filter(t => t.category === currentAllTasksFilter);
            }

            filteredTasks.sort((a, b) => {
                if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
                const dateA = parseDate(a.dueDate) || new Date(8640000000000000); 
                const dateB = parseDate(b.dueDate) || new Date(8640000000000000); 
                return dateA.getTime() - dateB.getTime();
            });

            const totalTasks = tasks.length;
            const completedCount = tasks.filter(t => t.isCompleted).length;

            let taskHtml = filteredTasks.map(renderTaskItem).join('');

            let html = `
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-bold" style="color: #1f2937; display: flex; align-items: center; margin-bottom: 0.25rem;">
                            <span class="p-2 rounded-md" style="margin-right: 0.5rem; background-color: #ccfbf1; color: #0d9488;">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 16h.01"></path></svg>
                            </span>
                            All Tasks
                        </h2>
                        <p class="text-sm" style="color: #6b7280; margin-left: 2.5rem;">${totalTasks} total &middot; ${completedCount} completed</p>
                    </div>
                    <button onclick="openModal()" style="display: flex; align-items: center; padding: 0.5rem 1rem; background-color: #10b981; color: white; font-weight: 500; border-radius: 0.5rem; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: background-color 0.15s;" 
                            onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
                        <svg class="w-5 h-5" style="margin-right: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Task
                    </button>
                </div>

                <!-- Category Filters -->
                <div class="flex" style="gap: 0.5rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem;">
                    ${['All', 'Work', 'Personal'].map(filter => `
                        <button onclick="setAllTasksFilter('${filter}')" 
                                style="padding-bottom: 0.75rem; font-size: 0.875rem; font-weight: 500; border: none; background: none; cursor: pointer; transition: color 0.15s;"
                                class="${currentAllTasksFilter === filter ? 'filter-active' : 'filter-inactive'}">
                            ${filter}
                        </button>
                    `).join('')}
                </div>
                <style>
                    .filter-inactive { color: #6b7280; }
                    .filter-inactive:hover { color: #374151; }
                    .filter-active { color: #2563eb; border-bottom: 2px solid #2563eb; font-weight: 600; }
                </style>

                <div class="space-y-3">
                    ${taskHtml}
                    ${totalTasks === 0 ? `<p class="text-center" style="color: #6b7280; margin-top: 2.5rem;">You have no tasks yet. Click 'Add Task' to create your first item.</p>` : ''}
                </div>
            `;
            document.getElementById('main-content').innerHTML = html;
        }

        window.setAllTasksFilter = function(filter) {
            currentAllTasksFilter = filter;
            renderAllTasks();
        }

        function updateSidebar() {
            const navItems = [
                { id: 'myDay', label: 'My Day', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`, color: '#2563eb' },
                { id: 'important', label: 'Important', icon: `<svg class="w-5 h-5 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.222a.5.5 0 01.902 0l1.3 2.62a.5.5 0 00.373.272l2.91.423a.5.5 0 01.277.853l-2.106 2.053a.5.5 0 00-.144.444l.498 2.895a.5.5 0 01-.724.526l-2.597-1.365a.5.5 0 00-.466 0l-2.597 1.365a.5.5 0 01-.724-.526l.498-2.895a.5.5 0 00-.144-.444L3.63 6.39a.5.5 0 01.277-.853l2.91-.423a.5.5 0 00.373-.272l1.3-2.62z"></path></svg>`, color: '#d97706' },
                { id: 'planned', label: 'Planned', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`, color: '#9333ea' },
                { id: 'allTasks', label: 'All Tasks', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 16h.01"></path></svg>`, color: '#0d9488' },
            ];

            const navHtml = navItems.map(item => {
                const isActive = item.id === currentView;
                const activeClass = isActive ? 'nav-item-active' : 'nav-item-default';
                return `
                    <a href="#" onclick="changeView('${item.id}')" class="nav-item ${activeClass}">
                        <span style="color: ${item.color};">${item.icon}</span>
                        ${item.label}
                    </a>
                `;
            }).join('');
            document.getElementById('nav-list').innerHTML = navHtml;
        }

        function renderApp() {
            updateSidebar();
            
            const sidebar = document.getElementById('sidebar');
            if (sidebar.classList.contains('open')) {
                toggleSidebar();
            }

            switch (currentView) {
                case 'myDay':
                    renderMyDay();
                    break;
                case 'important':
                    renderImportant();
                    break;
                case 'planned':
                    renderPlanned();
                    break;
                case 'allTasks':
                    renderAllTasks();
                    break;
                default:
                    renderMyDay();
            }
        }

        window.changeView = function(view) {
            if (currentView !== view) {
                currentView = view;
                currentAllTasksFilter = 'All'; 
                renderApp();
            }
        }

        window.openModal = function() {
            const modal = document.getElementById('task-modal');
            document.getElementById('add-task-form').reset();
            document.getElementById('task-priority').value = 'Medium';
            
            document.querySelectorAll('.priority-btn').forEach(btn => {
                btn.classList.remove('selected-low', 'selected-medium', 'selected-high');
            });
            document.querySelector('#priority-options [data-priority="Medium"]').classList.add('selected-medium');

            document.getElementById('task-tags-display').innerHTML = ''; 
            
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('open');
            }, 10);
        }

        window.closeModal = function() {
            const modal = document.getElementById('task-modal');
            modal.classList.remove('open');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        window.setDueDate = function(period) {
            const dateInput = document.getElementById('task-due-date');
            const date = new Date(TODAY); 
            
            if (period === 'tomorrow') {
                date.setDate(date.getDate() + 1);
            }
            
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }

        document.getElementById('priority-options').addEventListener('click', (e) => {
            const target = e.target.closest('.priority-btn');
            if (target) {
                document.querySelectorAll('.priority-btn').forEach(btn => {
                    btn.classList.remove('selected-low', 'selected-medium', 'selected-high');
                });

                const priority = target.getAttribute('data-priority');
                document.getElementById('task-priority').value = priority;
                
                target.classList.add(`selected-${priority.toLowerCase()}`);
            }
        });

        document.getElementById('add-task-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('task-title').value.trim();
            if (!title) {
                showMessage("Task title is required.", '#ef4444');
                return;
            }

            const description = document.getElementById('task-description').value.trim();
            const dueDate = document.getElementById('task-due-date').value;
            const priority = document.getElementById('task-priority').value;
            const category = document.getElementById('task-category').value;
            
            const tagsInput = document.getElementById('task-tags-input').value;
            const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '').slice(0, 6);

            const newTask = {
                id: Date.now(), 
                title: title,
                description: description,
                category: category,
                dueDate: dueDate,
                priority: priority,
                tags: tags,
                isImportant: false, 
                isCompleted: false, 
            };

            tasks.push(newTask);
            saveTasks(); 
            
            showMessage(`Task "${title}" added successfully!`);
            
            const submitButton = e.submitter;
            const isShiftEnter = e.shiftKey; 
            if (isShiftEnter) {
                e.target.reset(); 
                document.querySelectorAll('.priority-btn').forEach(btn => {
                    btn.classList.remove('selected-low', 'selected-medium', 'selected-high');
                });
                document.querySelector('#priority-options [data-priority="Medium"]').classList.add('selected-medium');
                document.getElementById('task-tags-display').innerHTML = ''; // Clear tags
            } else {
                closeModal();
            }

            renderApp();
        });

        window.toggleSidebar = function() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');

            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            } else {
                sidebar.classList.add('open');
                overlay.classList.add('active');
            }
        }

        
        function initializeApp() {
            
            loadTasks();

            document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
            document.getElementById('sidebar-overlay').addEventListener('click', toggleSidebar);

            renderApp();
        }

        window.onload = initializeApp;
document.addEventListener('DOMContentLoaded', function () {
    const tasks = document.querySelectorAll('.task');
    const weeklyTimer = document.getElementById('weekly-timer');
    const dailyTimer = document.getElementById('daily-timer');
    const bloodwoodTimer = document.getElementById('bloodwood-timer');
  
    function getArizonaTime() {
        return new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' });
    }
  
    function updateTimer() {
        const now = new Date(getArizonaTime());
    
        // Update weekly and daily timers
        weeklyTimer.textContent = formatTime(getNextWeeklyReset(17, 0) - now);
        dailyTimer.textContent = formatTime(getNextReset(17, 0) - now);
    
        // Update Bloodwood tree timer
        const nextBloodwoodEvent = getNextBloodwoodEvent();
        const timeRemaining = nextBloodwoodEvent - now;
    
        // Format the next event time for display (e.g., "7:00 AM")
        const options = { hour: 'numeric', minute: '2-digit', timeZone: 'America/Phoenix' };
        const nextEventTimeString = nextBloodwoodEvent.toLocaleTimeString('en-US', options);
    
        bloodwoodTimer.textContent = `${formatTime(timeRemaining)} (Next: ${nextEventTimeString})`;
    }
    
    function getNextBloodwoodEvent() {
        const now = new Date(getArizonaTime());
    
        // Base start time for Bloodwood events: 7:00 AM today
        const baseEventTime = new Date(now);
        baseEventTime.setHours(7, 0, 0, 0);
    
        // Interval duration: 14 hours (in milliseconds)
        const interval = 14 * 60 * 60 * 1000;
    
        // If the current time is before 7:00 AM, the next event is the base time
        if (now.getTime() < baseEventTime.getTime()) {
            return baseEventTime; // Next event is 7:00 AM today
        }
    
        // Calculate how many intervals have passed since the base time
        const timeSinceBase = now.getTime() - baseEventTime.getTime();
        const intervalsPassed = Math.floor(timeSinceBase / interval);
    
        // Calculate the next event time
        return new Date(baseEventTime.getTime() + (intervalsPassed + 1) * interval);
    }
  
    function getNextReset(hour, minute) {
        const now = new Date(getArizonaTime());
        const nextReset = new Date(now);
        nextReset.setHours(hour, minute, 0, 0);
        if (nextReset < now) nextReset.setDate(nextReset.getDate() + 1);
        return nextReset;
    }
  
    function getNextWeeklyReset(hour, minute) {
        const now = new Date(getArizonaTime());
        const daysUntilTuesday = (2 - now.getDay() + 7) % 7;
        const nextReset = new Date(now);
        nextReset.setDate(now.getDate() + daysUntilTuesday);
        nextReset.setHours(hour, minute, 0, 0);
        if (daysUntilTuesday === 0 && nextReset < now) nextReset.setDate(nextReset.getDate() + 7);
        return nextReset;
    }
  
    function formatTime(timeLeft) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
  
    const taskStorage = {
        saveTaskState(taskId, state) {
            localStorage.setItem(taskId, state);
        },
        getTaskState(taskId) {
            return localStorage.getItem(taskId);
        },
        saveHiddenTasks(hiddenTasks) {
            localStorage.setItem('hiddenTasks', JSON.stringify(hiddenTasks));
        },
        getHiddenTasks() {
            return JSON.parse(localStorage.getItem('hiddenTasks')) || [];
        }
    };
  

    
    tasks.forEach(task => {
        task.addEventListener('click', () => {
            if (!task.classList.contains('hidden')) {
                task.classList.toggle('completed');
                const taskId = task.getAttribute('data-task');
                taskStorage.saveTaskState(taskId, task.classList.contains('completed'));
                updateCheckMark(task);
            }
        });
  
        const checkMark = document.createElement('span');
        checkMark.className = 'check-mark';
        checkMark.textContent = '✔';
        checkMark.style.display = 'none';
        task.appendChild(checkMark);
        updateCheckMark(task);
  
        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-btn';
        toggleButton.textContent = 'Hide';
        task.appendChild(toggleButton);
  
        toggleButton.addEventListener('click', () => {
            task.classList.add('hidden');
            task.style.display = 'none';
            saveHiddenTasks();
        });
    });
  
    function updateCheckMark(task) {
        const checkMark = task.querySelector('.check-mark');
        checkMark.style.display = task.classList.contains('completed') ? 'block' : 'none';
    }
  
    function loadTaskState() {
        tasks.forEach(task => {
            const taskId = task.getAttribute('data-task');
            if (taskStorage.getTaskState(taskId) === 'true') {
                task.classList.add('completed');
            }
            updateCheckMark(task);
        });
        loadHiddenTasks();
    }
  
    function saveHiddenTasks() {
        const hiddenTasks = Array.from(tasks)
            .filter((task) => task.classList.contains('hidden'))
            .map((task) => task.getAttribute('data-task'));
        taskStorage.saveHiddenTasks(hiddenTasks);
    }
  
    function loadHiddenTasks() {
        const hiddenTasks = taskStorage.getHiddenTasks();
        tasks.forEach((task) => {
            const taskId = task.getAttribute('data-task');
            if (hiddenTasks.includes(taskId)) {
                task.classList.add('hidden');
                task.style.display = 'none';
            }
        });
    }
  
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
  
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.getAttribute('data-tab')).classList.add('active');
        });
    });
  
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset All Tasks';
    resetButton.classList.add('reset-btn-style');
    document.body.appendChild(resetButton);
    
    resetButton.addEventListener('click', () => {
        tasks.forEach(task => {
            task.classList.remove('completed');
            taskStorage.saveTaskState(task.getAttribute('data-task'), false);
            updateCheckMark(task);
        });
        saveHiddenTasks();
    
        // Add animation feedback
        resetButton.classList.add('clicked');
        setTimeout(() => {
            resetButton.classList.remove('clicked');
        }, 300); // Duration of the animation
    });
  
    const showHiddenButton = document.createElement('button');
    showHiddenButton.textContent = 'Show Hidden Tasks';
    showHiddenButton.classList.add('show-hidden-btn-style');
    document.body.prepend(showHiddenButton);
  
    showHiddenButton.addEventListener('click', () => {
        tasks.forEach((task) => {
            if (task.classList.contains('hidden')) {
                task.classList.remove('hidden');
                task.style.display = 'inline-block';
            }
        });
        saveHiddenTasks();
    });
  
    loadTaskState();
    updateTimer();
    setInterval(updateTimer, 1000);
  
    // Update task button style to look like small boxes
    tasks.forEach(task => {
        task.style.width = '100px';
        task.style.height = '100px';
        task.style.display = 'inline-block';
        task.style.margin = '10px';
        task.style.border = '1px solid #444';
        task.style.borderRadius = '10px';
        task.style.textAlign = 'center';
        task.style.verticalAlign = 'top';
        task.style.padding = '10px';
        task.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    });
  });
  



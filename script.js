document.addEventListener('DOMContentLoaded', function () {
    const tasks = document.querySelectorAll('.task');
    const weeklyTimer = document.getElementById('weekly-timer');
    const dailyTimer = document.getElementById('daily-timer');
    const bloodwoodTimer = document.getElementById('bloodwood-timer');

    function getArizonaTime() {
        return new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' });
    }

    function getNextBloodwoodEvent() {
        const now = new Date(getArizonaTime());
    
        // Define the next event as 09:00 AM today
        let nextEvent = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
    
        // If the current time is after 7:00 PM today, set the next event to 9:00 AM tomorrow
        if (now.getHours() >= 19) { // 7:00 PM is hour 19
            nextEvent = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0, 0);
        } else if (now >= nextEvent) {
            // If the current time is after 09:00 AM but before 7:00 PM, calculate next based on 14-hour intervals
            nextEvent = new Date(nextEvent.getTime() + 14 * 60 * 60 * 1000);
        }
    
        return nextEvent;
    }
    
    function updateTimer() {
        const now = new Date(getArizonaTime());
    
        // Update weekly and daily timers
        weeklyTimer.textContent = formatTime(getNextWeeklyReset(17, 0) - now);
        dailyTimer.textContent = formatTime(getNextReset(17, 0) - now);
    
        // Update Bloodwood tree timer with new event times
        const nextBloodwoodEvent = getNextBloodwoodEvent();
        const timeRemaining = nextBloodwoodEvent - now;
    
        // Format the next event time for display (e.g., "9:00 AM")
        const options = { hour: 'numeric', minute: '2-digit', timeZone: 'America/Phoenix' };
        const nextEventTimeString = nextBloodwoodEvent.toLocaleTimeString('en-US', options);
    
        bloodwoodTimer.textContent = `${formatTime(timeRemaining)} (Next: ${nextEventTimeString})`;
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

    // Task storage and state management
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

    // Event listeners for tasks
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

    // Tab management
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

    // Reset and show hidden buttons
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset All Tasks';
    resetButton.classList.add('reset-btn-style');
    document.body.appendChild(resetButton);

    resetButton.addEventListener('click', () => {
        tasks.forEach(task => {
            task.classList.remove('completed');
            // Assuming taskStorage is already defined for saving task state
            taskStorage.saveTaskState(task.getAttribute('data-task'), false);
            updateCheckMark(task);
        });

        // Add animation feedback to the button
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

    // Load initial task state and start timers
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

    const events = [
        { name: 'Butterfly Swarm', hour: 0, elementId: 'butterfly-swarm-timer' },
        { name: 'King Black Dragon Rampage', hour: 1, elementId: 'kbd-rampage-timer' },
        { name: 'Forgotten Soldiers', hour: 2, elementId: 'forgotten-soldiers-timer' },
        { name: 'Surprising Seedlings', hour: 3, elementId: 'surprising-seedlings-timer' },
        { name: 'Hellhound Pack', hour: 4, elementId: 'hellhound-pack-timer' },
        { name: 'Infernal Star', hour: 5, elementId: 'infernal-star-timer' },
        { name: 'Lost Souls', hour: 6, elementId: 'lost-souls-timer' },
        { name: 'Ramokee Incursion', hour: 7, elementId: 'ramokee-incursion-timer' },
        { name: 'Displaced Energy', hour: 8, elementId: 'displaced-energy-timer' },
        { name: 'Evil Bloodwood Tree', hour: 9, elementId: 'evil-bloodwood-tree-timer' },
        { name: 'Spider Swarm', hour: 10, elementId: 'spider-swarm-timer' },
        { name: 'Unnatural Outcrop', hour: 11, elementId: 'unnatural-outcrop-timer' },
        { name: 'Stryke the Wyrm', hour: 12, elementId: 'stryke-the-wyrm-timer' },
        { name: 'Demon Stragglers', hour: 13, elementId: 'demon-stragglers-timer' },
    ];

    function updateEventTimers() {
        const now = new Date();

        events.forEach(event => {
            const nextEventTime = getNextEventTime(now, event.hour);
            const timeRemaining = nextEventTime - now;
            document.getElementById(event.elementId).textContent = formatCountdown(timeRemaining);
        });
    }

    function getNextEventTime(currentTime, eventHour) {
        let nextEventDate = new Date(currentTime);
        nextEventDate.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to 0

        // If the current hour is less than the event hour, schedule it for today
        if (currentTime.getHours() < eventHour) {
            nextEventDate.setHours(eventHour);
        } else if (currentTime.getHours() === eventHour && currentTime.getMinutes() === 0 && currentTime.getSeconds() === 0) {
            nextEventDate.setHours(eventHour);
        } else {
            // If we have already passed the event time today, set it for 14 hours later
            nextEventDate.setHours(currentTime.getHours() + 14);
        }

        return nextEventDate;
    }

    function formatCountdown(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    // Start the event countdown timers
    setInterval(updateEventTimers, 1000);
    updateEventTimers();
});



document.addEventListener('DOMContentLoaded', function () { 
    const tasks = document.querySelectorAll('.task');
    const weeklyTimer = document.getElementById('weekly-timer');
    const dailyTimer = document.getElementById('daily-timer');
    const bloodwoodTimer = document.getElementById('bloodwood-timer');

    function getArizonaTime() {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' }));
    }

    const events = [
        { name: 'Forgotten Soldiers', elementId: 'forgotten-soldiers-timer', offsetMinutes: 360 },
        { name: 'Surprising Seedlings', elementId: 'surprising-seedlings-timer', offsetMinutes: 420 },
        { name: 'Hellhound Pack', elementId: 'hellhound-pack-timer', offsetMinutes: 480 },
        { name: 'Infernal Star', elementId: 'infernal-star-timer', offsetMinutes: 540 },
        { name: 'Lost Souls', elementId: 'lost-souls-timer', offsetMinutes: 600 },
        { name: 'Ramokee Incursion', elementId: 'ramokee-incursion-timer', offsetMinutes: 660 },
        { name: 'Displaced Energy', elementId: 'displaced-energy-timer', offsetMinutes: 720 },
        { name: 'Evil Bloodwood Tree', elementId: 'evil-bloodwood-tree-timer', offsetMinutes: 780 },
        { name: 'Spider Swarm', elementId: 'spider-swarm-timer', offsetMinutes: 840 },
        { name: 'Unnatural Outcrop', elementId: 'unnatural-outcrop-timer', offsetMinutes: 900 },
        { name: 'Stryke the Wyrm', elementId: 'stryke-the-wyrm-timer', offsetMinutes: 960 },
        { name: 'Demon Stragglers', elementId: 'demon-stragglers-timer', offsetMinutes: 1020 },
        { name: 'Butterfly Swarm', elementId: 'butterfly-swarm-timer', offsetMinutes: 1080 },
        { name: 'King Black Dragon Rampage', elementId: 'kbd-rampage-timer', offsetMinutes: 1140 }
    ];
    

    function calculateNextEventTime(offsetMinutes) {
        const now = getArizonaTime();
        const todayMidnight = new Date(now);
        todayMidnight.setHours(0, 0, 0, 0);
    
        // Calculate the next occurrence based on offset
        let nextEventTime = new Date(todayMidnight.getTime() + offsetMinutes * 60 * 1000);
    
        // If the calculated event time is already in the past, move to the next occurrence (add 14 hours until it's in the future)
        while (nextEventTime <= now) {
            nextEventTime = new Date(nextEventTime.getTime() + 14 * 60 * 60 * 1000);
        }
    
        return nextEventTime;
    }
     

    function updateEventTimers() {
        const now = getArizonaTime();
    
        events.forEach(event => {
            const eventTimerElement = document.getElementById(event.elementId);
            let nextEventTime = calculateNextEventTime(event.offsetMinutes);
            let timeRemaining = nextEventTime - now;
    
            // Update the event timer display
            if (eventTimerElement) {
                eventTimerElement.textContent = formatCountdown(timeRemaining);
            }
        });
    }
    
    function highlightNextEvent() {
        const now = getArizonaTime();
        let nextEvent = null;
        let minTimeDifference = Infinity;
    
        // Determine the next event
        events.forEach(event => {
            const nextEventTime = calculateNextEventTime(event.offsetMinutes);
            let timeDifference = nextEventTime - now;
    
            // Select the event with the smallest positive time difference
            if (timeDifference > 0 && timeDifference < minTimeDifference) {
                minTimeDifference = timeDifference;
                nextEvent = event;
            }
        });
    
        // Remove highlight from all events
        document.querySelectorAll('.event').forEach(eventElement => {
            eventElement.classList.remove('highlight');
        });
    
        // Highlight the next event
        if (nextEvent) {
            const nextEventElement = document.getElementById(nextEvent.elementId);
            if (nextEventElement) {
                const eventContainer = nextEventElement.closest('.event');
                if (eventContainer) {
                    eventContainer.classList.add('highlight');
                    // Update next event display
                    const nextEventDisplay = document.getElementById('next-event-display');
                    if (nextEventDisplay) {
                        nextEventDisplay.textContent = `Next Wilderness event in ${formatCountdown(minTimeDifference)}: ${nextEvent.name}`;
                    }
                }
            }
        }
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

    function getNextBloodwoodEvent() {
        const now = getArizonaTime();
        let nextEvent = new Date(now);
        nextEvent.setHours(13, 0, 0, 0);  // Set the initial event time to 09:00 AM
    
        // If it's already past 9:00 AM, set the next event time to 14 hours from now
        if (now >= nextEvent) {
            nextEvent = new Date(nextEvent.getTime() + 14 * 60 * 60 * 1000);
        }
    
        return nextEvent;
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

     // Create container to hold both buttons together
     const buttonContainer = document.createElement('div');
     buttonContainer.classList.add('button-container'); // Add a class for styling
     document.body.prepend(buttonContainer); // Add container to the top of the body

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

    function formatTime(timeLeft) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    function formatCountdown(ms) {
        if (ms < 0) ms = 0; // Prevent negative countdown
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    
    function startTimers() {
        setInterval(() => {
            updateTimer();
            updateEventTimers();
            highlightNextEvent();
        }, 1000);
    }
    
    startTimers();
});

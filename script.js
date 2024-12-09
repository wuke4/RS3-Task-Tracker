document.addEventListener('DOMContentLoaded', function () { 
    const tasks = document.querySelectorAll('.task');
    const weeklyTimer = document.getElementById('weekly-timer');
    const dailyTimer = document.getElementById('daily-timer');
    const bloodwoodTimer = document.getElementById('bloodwood-timer');

    function getArizonaTime() {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' }));
    }

    const events = [
        { name: 'Spider Swarm', elementId: 'spider-swarm-timer', offsetMinutes: 0 },
        { name: 'Unnatural Outcrop', elementId: 'unnatural-outcrop-timer', offsetMinutes: 60 },
        { name: 'Stryke the Wyrm', elementId: 'stryke-the-wyrm-timer', offsetMinutes: 120 },
        { name: 'Demon Stragglers', elementId: 'demon-stragglers-timer', offsetMinutes: 180 },
        { name: 'Butterfly Swarm', elementId: 'butterfly-swarm-timer', offsetMinutes: 240 },
        { name: 'King Black Dragon Rampage', elementId: 'kbd-rampage-timer', offsetMinutes: 300 },
        { name: 'Forgotten Soldiers', elementId: 'forgotten-soldiers-timer', offsetMinutes: 360 },
        { name: 'Surprising Seedlings', elementId: 'surprising-seedlings-timer', offsetMinutes: 420 },
        { name: 'Hellhound Pack', elementId: 'hellhound-pack-timer', offsetMinutes: 480 },
        { name: 'Infernal Star', elementId: 'infernal-star-timer', offsetMinutes: 540 },
        { name: 'Lost Souls', elementId: 'lost-souls-timer', offsetMinutes: 600 },
        { name: 'Ramokee Incursion', elementId: 'ramokee-incursion-timer', offsetMinutes: 660 },
        { name: 'Displaced Energy', elementId: 'displaced-energy-timer', offsetMinutes: 720 },
        { name: 'Evil Bloodwood Tree', elementId: 'evil-bloodwood-tree-timer', offsetMinutes: 780 }
    ];    
    
    function calculateNextEventTime(offsetMinutes) {
        const now = new Date();
        const todayMidnight = new Date(now);
        todayMidnight.setHours(0, 0, 0, 0); // Reference point is midnight
    
        // Calculate initial event time from today's midnight + offset
        let nextEventTime = new Date(todayMidnight.getTime() + offsetMinutes * 60 * 1000);
    
        // If this event has already passed in this cycle, shift to the next occurrence
        while (nextEventTime <= now) {
            nextEventTime = new Date(nextEventTime.getTime() + 14 * 60 * 60 * 1000); // Add 14 hours
        }
    
        return nextEventTime;
    }
     
    function updateEventTimers() {
        const now = new Date();
    
        events.forEach(event => {
            const eventTimerElement = document.getElementById(event.elementId);
            const nextEventTime = calculateNextEventTime(event.offsetMinutes);
            const timeRemaining = nextEventTime - now;
    
            // Update the timer display
            if (eventTimerElement) {
                eventTimerElement.textContent = formatCountdown(timeRemaining);
            }
        });
    }    
    
    function highlightNextEvent() {
        const now = new Date();
        let nextEvent = null;
        let minTimeDifference = Infinity;
    
        events.forEach(event => {
            const nextEventTime = calculateNextEventTime(event.offsetMinutes);
            const timeDifference = nextEventTime - now;
    
            // Check for the closest upcoming event
            if (timeDifference > 0 && timeDifference < minTimeDifference) {
                minTimeDifference = timeDifference;
                nextEvent = event;
            }
        });
    
        // Remove highlights from all events
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
    
                    // Update the next event display
                    const nextEventDisplay = document.getElementById('next-event-display');
                    if (nextEventDisplay) {
                        nextEventDisplay.textContent = `Next Wilderness event in ${formatCountdown(minTimeDifference)}: ${nextEvent.name}`;
                    }
                }
            }
        }
    }       
    

    function updateTimer() {
        const now = new Date();
    
        // Update daily and weekly reset timers
        const dailyReset = getNextReset(17, 0); // Daily reset at 5:00 PM
        const weeklyReset = getNextWeeklyReset(17, 0); // Weekly reset at 5:00 PM on Tuesday
        dailyTimer.textContent = formatCountdown(dailyReset - now);
        weeklyTimer.textContent = formatCountdown(weeklyReset - now);
    
        // Align Tree Timer with the Evil Bloodwood Tree event
        const bloodwoodEvent = events.find(event => event.name === "Evil Bloodwood Tree");
        if (bloodwoodEvent) {
            const nextBloodwoodEvent = calculateNextEventTime(bloodwoodEvent.offsetMinutes);
            bloodwoodTimer.textContent = formatCountdown(nextBloodwoodEvent - now);
        }
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
        nextEvent.setHours(3, 0, 0, 0);  // Set the initial event time to 1:00 PM
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

    function scrollTasks(direction) {
        const container = document.querySelector('.task-content ul');
        const scrollAmount = 200; // Pixels to scroll
      
        if (direction === 'left') {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (direction === 'right') {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
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

    document.querySelectorAll('.task-btn').forEach(button => {
        button.addEventListener('mouseover', event => {
          // Create tooltip element
          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip tooltip-glow'; // Add tooltip classes
          tooltip.textContent = button.getAttribute('data-info'); // Get data-info content
          document.body.appendChild(tooltip);
      
          // Calculate position considering scroll offsets
          const rect = button.getBoundingClientRect();
          const scrollX = window.scrollX || document.documentElement.scrollLeft;
          const scrollY = window.scrollY || document.documentElement.scrollTop;
      
          tooltip.style.left = `${rect.left + scrollX + rect.width / 2 - tooltip.offsetWidth / 2}px`;
          tooltip.style.top = `${rect.top + scrollY - tooltip.offsetHeight - 10}px`;
      
          // Fade in the tooltip
          requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0) scale(1)';
          });
      
          // Remove the tooltip on mouse leave
          button.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0'; // Fade out
            setTimeout(() => tooltip.remove(), 300); // Remove after animation
          });
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
        task.style.display = 'inline-block';
        task.style.margin = '10px';
        task.style.border = '1px solid #444';
        task.style.borderRadius = '10px';
        task.style.textAlign = 'center';
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

    events.forEach(event => {
        const calculatedTime = calculateNextEventTime(event.offsetMinutes);
        console.log(`Event: ${event.name}, Next Time: ${calculatedTime}`);
    });    

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
        }, 1000); // Update every second
    }
    
    startTimers();
});

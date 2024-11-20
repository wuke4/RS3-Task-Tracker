  // Reset all tasks
  function resetTasks() {
    tasks.forEach(task => {
      task.classList.remove('completed');
      const taskId = task.getAttribute('data-task');
      localStorage.removeItem(taskId);
    });
  }

  // Check if the timer has passed
  function checkResetTimers() {
    const now = new Date();
    const dailyReset = getNextReset(17, 0); // 5:00 PM daily reset (Arizona Time)
    const weeklyReset = getNextWeeklyReset(17, 0); // 5:00 PM Tuesday weekly reset (Arizona Time)

    // Compare the current time with the last reset time stored in localStorage
    const lastDailyReset = new Date(localStorage.getItem('lastDailyReset'));
    const lastWeeklyReset = new Date(localStorage.getItem('lastWeeklyReset'));

    // Reset tasks if the daily reset has passed
    if (now >= dailyReset && (!lastDailyReset || now > lastDailyReset)) {
      resetTasks();
      localStorage.setItem('lastDailyReset', dailyReset);
    }

    // Reset weekly tasks if the weekly reset has passed
    if (now >= weeklyReset && (!lastWeeklyReset || now > lastWeeklyReset)) {
      resetTasks();
      localStorage.setItem('lastWeeklyReset', weeklyReset);
    }
  }

  // Run the reset check every minute
  setInterval(checkResetTimers, 60000);

  // Helper functions for reset times
  function getNextReset(hour, minute) {
    const now = new Date();
    let nextReset = new Date(now);
    nextReset.setHours(hour, minute, 0, 0);
    if (nextReset < now) {
      nextReset.setDate(nextReset.getDate() + 1);
    }
    return nextReset;
  }

  function getNextWeeklyReset(hour, minute) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilTuesday = (2 - dayOfWeek + 7) % 7; // Days until next Tuesday
    let nextReset = new Date(now);
    nextReset.setDate(now.getDate() + daysUntilTuesday);
    nextReset.setHours(hour, minute, 0, 0);
    if (nextReset < now) {
      nextReset.setDate(nextReset.getDate() + 7);
    }
    return nextReset;
  }

  // Initialize tasks on load
  checkResetTimers();

document.addEventListener('DOMContentLoaded', function () {
  const tasks = document.querySelectorAll('.task');
  const weeklyTimer = document.getElementById('weekly-timer');
  const dailyTimer = document.getElementById('daily-timer');
  const bloodwoodTimer = document.getElementById('bloodwood-timer');
  const bloodwoodStaticTime = document.createElement('span');
  bloodwoodStaticTime.id = 'bloodwood-static-time';
  bloodwoodTimer.parentNode.appendChild(bloodwoodStaticTime);

  // Load task state from localStorage
  function loadTaskState() {
      tasks.forEach(task => {
          const taskId = task.getAttribute('data-task');
          const isCompleted = localStorage.getItem(taskId) === 'true';

          if (isCompleted) {
              task.classList.add('completed');
          }
      });
  }

  // Save task state to localStorage
  function saveTaskState(taskId, isCompleted) {
      localStorage.setItem(taskId, isCompleted);
  }

  // Update timers
  function updateTimer() {
    const now = new Date();
  
    const weeklyReset = getNextWeeklyReset(17, 0); // 5:00 PM Tuesday (Arizona Time)
    const dailyReset = getNextReset(17, 0); // 5:00 PM every day (Arizona Time)
    const nextBloodwoodEvent = getNextBloodwoodEvent();
  
    weeklyTimer.textContent = formatTime(weeklyReset - now);
    dailyTimer.textContent = formatTime(dailyReset - now);
    bloodwoodTimer.textContent = formatTime(nextBloodwoodEvent - now);
  
    // Display the exact time of the next Evil Bloodwood Tree event
    bloodwoodStaticTime.textContent = ` (Next event at: ${formatStaticTime(nextBloodwoodEvent)})`;
  }
  

  function getNextReset(hour, minute) {
      const now = new Date();
      let nextReset = new Date(now);

      nextReset.setHours(hour);
      nextReset.setMinutes(minute);
      nextReset.setSeconds(0);

      if (nextReset < now) {
          nextReset.setDate(nextReset.getDate() + 1); // Reset to the next day
      }

      return nextReset;
  }

  function getNextWeeklyReset(hour, minute) {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysUntilTuesday = (2 - dayOfWeek + 7) % 7; // Days until next Tuesday

      let nextReset = new Date(now);
      nextReset.setDate(now.getDate() + daysUntilTuesday);
      nextReset.setHours(hour);
      nextReset.setMinutes(minute);
      nextReset.setSeconds(0);

      if (daysUntilTuesday === 0 && nextReset < now) {
          nextReset.setDate(nextReset.getDate() + 7);
      }

      return nextReset;
  }

  function getNextBloodwoodEvent() {
    const now = new Date();
    
    // Current time in milliseconds
    const currentTime = now.getTime();
  
    // Start with the known next event (5:42 PM Arizona time, adjusted for the next event in 13h 17m)
    const initialEventTime = new Date(now);
    initialEventTime.setHours(17, 43, 0, 0); // Set initial known event time (5:42 PM AZ time)
    
    // Add 13 hours and 17 minutes for the next event after the current
    const eventInterval = 14 * 60 * 60 * 1000; // 14 hours in milliseconds
    
    // Adjust to find the first future event
    let nextEventTime = initialEventTime.getTime() + 13 * 60 * 60 * 1000 + 17 * 60 * 1000;
  
    while (nextEventTime < currentTime) {
      nextEventTime += eventInterval;
    }
  
    return new Date(nextEventTime); // Return the next event time as a Date object
  }
  



  function formatTime(timeLeft) {
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  function formatStaticTime(date) {
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour time

      return `${formattedHours}:${minutes} ${period}`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  // Toggle task completion
  tasks.forEach(task => {
      const button = task.querySelector('.task-btn');
      button.addEventListener('click', () => {
          task.classList.toggle('completed');
          const taskId = task.getAttribute('data-task');
          const isCompleted = task.classList.contains('completed');
          saveTaskState(taskId, isCompleted);
      });

      const infoButton = task.querySelector('.info-btn');
      const taskInfo = task.querySelector('.task-info');
      infoButton.addEventListener('click', () => {
          taskInfo.classList.toggle('show');
      });
  });

  // Reset All Tasks Button
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset All Tasks';
  resetButton.style = 'margin: 20px; padding: 10px; background: red; color: white; border: none; border-radius: 5px; cursor: pointer;';
  document.body.appendChild(resetButton);

  resetButton.addEventListener('click', () => {
      tasks.forEach(task => {
          task.classList.remove('completed');
          const taskId = task.getAttribute('data-task');
          localStorage.removeItem(taskId);
      });
  });

  // Tab Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Remove 'active' class from all buttons and contents
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          // Add 'active' class to the clicked button and corresponding content
          button.classList.add('active');
          const tabId = button.getAttribute('data-tab');
          document.getElementById(tabId).classList.add('active');
      });
  });

  // Load task completion state on page load
  loadTaskState();

  // Update timers every second
  updateTimer();
  setInterval(updateTimer, 1000);

    
 // Load hidden tasks from localStorage
 function loadHiddenTasks() {
    const hiddenTasks = JSON.parse(localStorage.getItem('hiddenTasks')) || [];
    tasks.forEach((task) => {
      const taskId = task.getAttribute('data-task');
      if (hiddenTasks.includes(taskId)) {
        task.classList.add('hidden');
      }
    });
  }

  // Save hidden tasks to localStorage
  function saveHiddenTasks() {
    const hiddenTasks = Array.from(tasks)
      .filter((task) => task.classList.contains('hidden'))
      .map((task) => task.getAttribute('data-task'));
    localStorage.setItem('hiddenTasks', JSON.stringify(hiddenTasks));
  }

  // Update the toggle button text based on task visibility
  function updateToggleButton(task) {
    const toggleButton = task.querySelector('.toggle-btn');
    const isHidden = task.classList.contains('hidden');
    toggleButton.textContent = isHidden ? 'Show' : 'Hide';
  }

  // Initialize tasks with toggle buttons
  tasks.forEach((task) => {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-btn';
    toggleButton.style.marginLeft = '10px';
    toggleButton.style.backgroundColor = '#444';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.borderRadius = '4px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '14px';

    task.appendChild(toggleButton);

    // Set the initial text based on the task state
    updateToggleButton(task);

    // Add event listener to toggle visibility
    toggleButton.addEventListener('click', () => {
      task.classList.toggle('hidden');
      updateToggleButton(task); // Update button text dynamically
      saveHiddenTasks(); // Save the updated state
    });
  });

  // Add "Show Hidden Tasks" button
  const showHiddenButton = document.createElement('button');
  showHiddenButton.textContent = 'Show Hidden Tasks';
  showHiddenButton.style.margin = '20px';
  showHiddenButton.style.backgroundColor = '#007bff';
  showHiddenButton.style.color = 'white';
  showHiddenButton.style.border = 'none';
  showHiddenButton.style.padding = '10px 20px';
  showHiddenButton.style.borderRadius = '5px';
  showHiddenButton.style.cursor = 'pointer';
  showHiddenButton.style.fontSize = '16px';
  document.body.prepend(showHiddenButton);

  showHiddenButton.addEventListener('click', () => {
    tasks.forEach((task) => {
      if (task.classList.contains('hidden')) {
        task.classList.remove('hidden'); // Temporarily show hidden tasks
        updateToggleButton(task);
      }
    });
    saveHiddenTasks(); // Update the state
  });

  // Load hidden task states on page load
  loadHiddenTasks();
});

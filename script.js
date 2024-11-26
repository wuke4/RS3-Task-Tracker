document.addEventListener('DOMContentLoaded', function () {
  const tasks = document.querySelectorAll('.task');
  const weeklyTimer = document.getElementById('weekly-timer');
  const dailyTimer = document.getElementById('daily-timer');
  const bloodwoodTimer = document.getElementById('bloodwood-timer');
  const bloodwoodStaticTime = document.createElement('span');
  bloodwoodStaticTime.id = 'bloodwood-static-time';
  bloodwoodTimer.parentNode.appendChild(bloodwoodStaticTime);

  // Helper function to create Arizona Time Date Object
  function getArizonaTime() {
      const now = new Date();
      // Create an offset date for MST (UTC-7 or UTC-8 depending on daylight savings, but Arizona does not observe DST)
      const arizonaOffset = -7; // UTC offset for MST (Arizona doesn't use daylight savings)
      return new Date(now.getTime() + ((now.getTimezoneOffset() / 60 + arizonaOffset) * 60 * 60 * 1000));
  }

  // Update timers
  function updateTimer() {
      const now = getArizonaTime();

      const weeklyReset = getNextWeeklyReset(17, 0); // 5:00 PM Tuesday (Arizona Time)
      const dailyReset = getNextReset(17, 0); // 5:00 PM every day (Arizona Time)
      const nextBloodwoodEvent = getNextBloodwoodEvent();

      weeklyTimer.textContent = formatTime(weeklyReset - now);
      dailyTimer.textContent = formatTime(dailyReset - now);
      bloodwoodTimer.textContent = formatTime(nextBloodwoodEvent - now);

      // Display the exact time of the next Evil Bloodwood Tree event
      bloodwoodStaticTime.textContent = ` (Next event at: ${formatStaticTime(nextBloodwoodEvent)})`;
  }

  // Bloodwood Tree timer calculation
  function getNextBloodwoodEvent() {
      const now = getArizonaTime();
      const currentTime = now.getTime();

      // Set the base event time to 3:00 AM Arizona time (MST)
      const baseEventTime = new Date(now);
      baseEventTime.setHours(3, 0, 0, 0); // 3:00 AM Arizona time

      // Add 14-hour intervals to find the next event time
      const interval = 14 * 60 * 60 * 1000; // 14 hours in milliseconds
      let nextEventTime = baseEventTime.getTime();

      while (nextEventTime < currentTime) {
          nextEventTime += interval;
      }

      return new Date(nextEventTime);
  }

  // General reset timer calculation function
  function getNextReset(hour, minute) {
      const now = getArizonaTime();
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
      const now = getArizonaTime();
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
      if (infoButton && taskInfo) {
          infoButton.addEventListener('click', () => {
              taskInfo.classList.toggle('show');
          });
      }

      // Add hide/unhide button to each task
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
      updateToggleButton(task, toggleButton);
      task.appendChild(toggleButton);

      // Add event listener to toggle visibility
      toggleButton.addEventListener('click', () => {
          task.classList.toggle('hidden');
          updateToggleButton(task, toggleButton); // Update button text dynamically
          saveHiddenTasks(); // Save the updated state
      });
  });

  // Load task state from localStorage
  function loadTaskState() {
      tasks.forEach(task => {
          const taskId = task.getAttribute('data-task');
          const isCompleted = localStorage.getItem(taskId) === 'true';

          if (isCompleted) {
              task.classList.add('completed');
          }
      });

      loadHiddenTasks();
  }

  // Save task state to localStorage
  function saveTaskState(taskId, isCompleted) {
      localStorage.setItem(taskId, isCompleted);
  }

  // Save hidden tasks to localStorage
  function saveHiddenTasks() {
      const hiddenTasks = Array.from(tasks)
          .filter((task) => task.classList.contains('hidden'))
          .map((task) => task.getAttribute('data-task'));
      localStorage.setItem('hiddenTasks', JSON.stringify(hiddenTasks));
  }

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

  // Update the toggle button text based on task visibility
  function updateToggleButton(task, toggleButton) {
      const isHidden = task.classList.contains('hidden');
      toggleButton.textContent = isHidden ? 'Show' : 'Hide';
  }

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
      saveHiddenTasks(); // Reset hidden tasks as well
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
              updateToggleButton(task, task.querySelector('.toggle-btn'));
          }
      });
      saveHiddenTasks(); // Update the state
  });

  // Load task completion state on page load
  loadTaskState();

  updateTimer();
  setInterval(updateTimer, 1000);
});

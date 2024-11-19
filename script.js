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

    // Create a new date for the next event, explicitly setting it to 3 AM Arizona time (UTC-7)
    const nextEvent = new Date(now);

    // Adjust to Arizona time by subtracting the UTC offset
    const arizonaOffset = -7; // Arizona is UTC-7 year-round
    const utcHours = now.getUTCHours();
    const utcDate = now.getUTCDate();

    nextEvent.setUTCDate(utcDate); // Set the current date
    nextEvent.setUTCHours(3 - arizonaOffset, 0, 0, 0); // 3 AM MST

    // If the calculated time is in the past, add 14 hours to get the next occurrence
    while (nextEvent < now) {
        nextEvent.setTime(nextEvent.getTime() + 14 * 60 * 60 * 1000);
    }

    return nextEvent;
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
});




  


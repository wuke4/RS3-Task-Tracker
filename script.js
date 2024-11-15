document.addEventListener('DOMContentLoaded', function () {
  const tasks = document.querySelectorAll('.task');
  const weeklyTimer = document.getElementById('weekly-timer');
  const dailyTimer = document.getElementById('daily-timer');

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

    const weeklyReset = getNextWeeklyReset(17, 0); // 5:00pm Tuesday (Arizona Time)
    const dailyReset = getNextReset(17, 0); // 5:00pm every day (Arizona Time)

    weeklyTimer.textContent = formatTime(weeklyReset - now);
    dailyTimer.textContent = formatTime(dailyReset - now);
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

    // If today is Tuesday and the reset time has passed, set to next Tuesday
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

  // Load task completion state on page load
  loadTaskState();

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
    function updateBloodwoodTimer() {
      const eventIntervalHours = 14; // Interval in hours for the event to repeat
    
      // Get current time and set today’s 3 PM Arizona time (MST)
      const now = new Date();
      const arizonaOffset = -7; // Arizona is UTC-7 year-round (no DST)
      const currentUTCHours = now.getUTCHours();
      const currentArizonaHours = currentUTCHours + arizonaOffset;
      let eventTime = new Date();
      
      eventTime.setUTCHours((currentArizonaHours >= 15 ? 15 + eventIntervalHours : 15) - arizonaOffset, 0, 0, 0); // set to next 3 PM or 14 hours later
      
      // Calculate difference between current time and event time
      const timeDiff = eventTime - now;
      
      // Reset event time by 14 hours if it's already past the event time
      if (timeDiff <= 0) {
        eventTime.setHours(eventTime.getHours() + eventIntervalHours);
      }
    
      // Function to calculate and format the time remaining
      function formatTimeRemaining(diff) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
      }
    
      // Update timer display every second
      setInterval(() => {
        const now = new Date();
        let remainingTime = eventTime - now;
    
        // If time runs out, reset eventTime for the next interval
        if (remainingTime <= 0) {
          eventTime.setHours(eventTime.getHours() + eventIntervalHours);
          remainingTime = eventTime - now;
        }
    
        document.getElementById('bloodwood-timer').textContent = formatTimeRemaining(remainingTime);
      }, 1000);
    }
    
    // Call the function to start the Bloodwood Tree timer
    updateBloodwoodTimer();
    
  });
  


  


document.addEventListener('DOMContentLoaded', function () {
  const tasks = document.querySelectorAll('.task');
  const weeklyTimer = document.getElementById('weekly-timer');
  const dailyTimer = document.getElementById('daily-timer');

  // Add a new element for the Evil Tree timer
  const evilTreeTimerElement = document.createElement('p');
  evilTreeTimerElement.innerHTML = 'Evil Tree Reset: <span id="evil-tree-timer"></span>';
  document.getElementById('timers').appendChild(evilTreeTimerElement);
  const evilTreeTimer = document.getElementById('evil-tree-timer');

  function loadTaskState() {
    tasks.forEach(task => {
      const taskId = task.getAttribute('data-task');
      const isCompleted = localStorage.getItem(taskId) === 'true';
      if (isCompleted) {
        task.classList.add('completed');
      }
    });
  }

  function saveTaskState(taskId, isCompleted) {
    localStorage.setItem(taskId, isCompleted);
  }

  function updateTimer() {
    const now = new Date();

    const weeklyReset = getNextWeeklyReset(17, 0);
    const dailyReset = getNextReset(17, 0);
    const evilTreeReset = getNextEvilTreeReset(14); // 14-hour interval

    weeklyTimer.textContent = formatTime(weeklyReset - now);
    dailyTimer.textContent = formatTime(dailyReset - now);
    evilTreeTimer.textContent = formatTime(evilTreeReset - now);
  }

  function getNextReset(hour, minute) {
    const now = new Date();
    let nextReset = new Date(now);

    nextReset.setHours(hour);
    nextReset.setMinutes(minute);
    nextReset.setSeconds(0);

    if (nextReset < now) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    return nextReset;
  }

  function getNextWeeklyReset(hour, minute) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilTuesday = (2 - dayOfWeek + 7) % 7;

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

  function getNextEvilTreeReset(intervalHours) {
    const now = new Date();
    let nextReset = new Date(now);

    // Set the next reset time to the start of the next interval
    nextReset.setMinutes(0);
    nextReset.setSeconds(0);
    nextReset.setMilliseconds(0);

    const hoursSinceLastReset = now.getHours() % intervalHours;
    if (hoursSinceLastReset === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
      // If it's exactly at the reset time, no adjustment needed
      return nextReset;
    }

    // Otherwise, adjust forward by the remaining hours in the interval
    const hoursToNextReset = intervalHours - hoursSinceLastReset;
    nextReset.setHours(now.getHours() + hoursToNextReset);

    return nextReset;
  }

  function formatTime(timeLeft) {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  function showFeedbackMessage(message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: green; color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000;';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000);
  }

  tasks.forEach(task => {
    const button = task.querySelector('.task-btn');
    button.addEventListener('click', () => {
      task.classList.toggle('completed');
      const taskId = task.getAttribute('data-task');
      const isCompleted = task.classList.contains('completed');
      saveTaskState(taskId, isCompleted);
      showFeedbackMessage(isCompleted ? "Task marked as completed!" : "Task marked as incomplete!");
    });

    const infoButton = task.querySelector('.info-btn');
    const taskInfo = task.querySelector('.task-info');
    infoButton.addEventListener('click', () => {
      taskInfo.classList.toggle('show');
    });
  });

  document.getElementById('task-search').addEventListener('input', function (event) {
    const query = event.target.value.toLowerCase();
    tasks.forEach(task => {
      const taskName = task.querySelector('.task-btn').textContent.toLowerCase();
      task.style.display = taskName.includes(query) ? 'block' : 'none';
    });
  });

  loadTaskState();
  updateTimer();
  setInterval(updateTimer, 1000);
});



  


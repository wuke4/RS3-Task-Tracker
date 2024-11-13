document.addEventListener('DOMContentLoaded', function () {
  const tasks = document.querySelectorAll('.task');
  const weeklyTimer = document.getElementById('weekly-timer');
  const dailyTimer = document.getElementById('daily-timer');

  // Update timers
  function updateTimer() {
    const now = new Date();

    const weeklyReset = getNextReset(17, 0); // 5:00pm Tuesday (Arizona Time)
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

  function formatTime(timeLeft) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  // Toggle task completion
  tasks.forEach(task => {
    const button = task.querySelector('.task-btn');
    button.addEventListener('click', () => {
      task.classList.toggle('completed');
    });

    const infoButton = task.querySelector('.info-btn');
    const taskInfo = task.querySelector('.task-info');
    infoButton.addEventListener('click', () => {
      taskInfo.classList.toggle('show');
    });
  });
});

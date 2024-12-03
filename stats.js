async function fetchStats() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Please enter a username');
        return;
    }

    const apiUrl = `https://api.runescape.com/user-profile?username=${encodeURIComponent(username)}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Player not found or an error occurred');
        }

        const data = await response.json();
        displayStats(data);
    } catch (error) {
        alert('Error fetching stats. Please try again later.');
        console.error('Error:', error);
    }
}

function displayStats(data) {
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = '<h2>Stats:</h2>';

    // Example: Assuming data is a list of stats in key-value pairs
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            statsDiv.innerHTML += `<p>${key}: ${data[key]}</p>`;
        }
    }
}

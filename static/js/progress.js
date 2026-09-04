async function loadProgress() {
    const response = await fetch("/api/progress");
    const data = await response.json();

    document.getElementById("gamesPlayed").textContent = data.games_played;
    document.getElementById("averageAccuracy").textContent =
        `${data.average_accuracy}%`;

    const list = document.getElementById("progressList");

    if (!data.results.length) {
        list.innerHTML = `
            <div class="loading">
                Play your first game and your progress will appear here.
            </div>
        `;
        return;
    }

    list.innerHTML = data.results.map(result => `
        <article class="reminder-item">
            <div>
                <span class="difficulty-label">
                    ${result.difficulty}
                </span>
                <h3>${result.game_name}</h3>
                <p>Score: ${result.score}%</p>
            </div>
            <div class="reminder-time">
                ${result.accuracy}%
            </div>
        </article>
    `).join("");
}

loadProgress();

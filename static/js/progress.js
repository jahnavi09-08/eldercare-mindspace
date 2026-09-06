async function loadProgress() {

    const list = document.getElementById("progressList");

    try {

        const response = await fetch("/api/progress");

        if (!response.ok) {
            throw new Error("Failed to load progress");
        }

        const data = await response.json();


        // =================================================
        // TOP SUMMARY CARDS
        // =================================================

        const gamesPlayed =
            document.getElementById("gamesPlayed");

        const averageAccuracy =
            document.getElementById("averageAccuracy");


        if (gamesPlayed) {

            gamesPlayed.textContent =
                data.games_played;

        }


        if (averageAccuracy) {

            averageAccuracy.textContent =
                `${data.average_accuracy}%`;

        }


        // =================================================
        // AI ADAPTIVE GAMING CARD
        // =================================================

        const aiDifficulty =
            document.getElementById("aiDifficulty");

        const aiMessage =
            document.getElementById("aiMessage");

        const aiAccuracy =
            document.getElementById("aiAccuracy");

        const aiScore =
            document.getElementById("aiScore");

        const aiTime =
            document.getElementById("aiTime");


        if (aiDifficulty) {

            const difficulty =
                data.recommended_difficulty || "easy";


            aiDifficulty.textContent =
                difficulty.charAt(0).toUpperCase()
                + difficulty.slice(1);


            // Remove previous difficulty classes

            aiDifficulty.classList.remove(
                "easy",
                "medium",
                "hard"
            );


            // Add current difficulty class

            aiDifficulty.classList.add(
                difficulty
            );

        }


        if (aiMessage) {

            aiMessage.textContent =
                data.recommendation_message
                || "Play more games to receive a personalized recommendation.";

        }


        if (aiAccuracy) {

            aiAccuracy.textContent =
                `${data.average_accuracy}%`;

        }


        if (aiScore) {

            aiScore.textContent =
                `${data.average_score}%`;

        }


        if (aiTime) {

            const time =
                data.average_time || 0;

            aiTime.textContent =
                time > 0
                    ? `${time}s`
                    : "--";

        }


        // =================================================
        // IF NO GAMES HAVE BEEN PLAYED
        // =================================================

        if (!data.results || data.results.length === 0) {

            list.innerHTML = `

                <div class="loading">

                    <h3>No games played yet</h3>

                    <p>
                        Play your first memory game and your
                        progress will appear here.
                    </p>

                </div>

            `;

            return;

        }


        // =================================================
        // DIFFICULTY HELPERS
        // =================================================

        function difficultyClass(difficulty) {

            if (difficulty === "easy") return "easy";

            if (difficulty === "medium") return "medium";

            if (difficulty === "hard") return "hard";

            return "";

        }


        function difficultyLabel(difficulty) {

            if (!difficulty) return "Easy";

            return difficulty.charAt(0).toUpperCase()
                + difficulty.slice(1);

        }


        // =================================================
        // RECENT RESULTS
        // =================================================

        const recentResults = data.results.map(result => `

            <article class="reminder-item">

                <div>

                    <span class="difficulty-label
                        ${difficultyClass(result.difficulty)}">

                        ${difficultyLabel(result.difficulty)}

                    </span>


                    <h3>
                        ${result.game_name}
                    </h3>


                    <p>

                        Score:
                        <strong>
                            ${result.score}%
                        </strong>

                        &nbsp; • &nbsp;

                        Time:
                        ${result.time_taken}s

                    </p>


                    <small>
                        ${result.played_at}
                    </small>

                </div>


                <div class="reminder-time">

                    ${result.accuracy}%

                    <small>
                        accuracy
                    </small>

                </div>

            </article>

        `).join("");


        // =================================================
        // GAME PERFORMANCE
        // =================================================

        const gamePerformance =
            (data.game_stats || []).map(game => `

                <div class="progress-game-card">

                    <div class="progress-game-header">

                        <h3>
                            ${game.game_name}
                        </h3>

                        <span>
                            ${game.accuracy}%
                        </span>

                    </div>


                    <div class="progress-bar">

                        <div
                            class="progress-fill"

                            style="
                                width:
                                ${Math.max(
                                    0,
                                    Math.min(
                                        100,
                                        game.accuracy
                                    )
                                )}%
                            ">
                        </div>

                    </div>


                    <div class="progress-game-details">

                        <span>
                            Played: ${game.played}
                        </span>


                        <span>
                            Best: ${game.best_score}%
                        </span>


                        <span>
                            Avg time:
                            ${game.average_time}s
                        </span>

                    </div>

                </div>

            `).join("");


        // =================================================
        // DIFFICULTY PERFORMANCE
        // =================================================

        const difficultyPerformance =
            (data.difficulty_stats || []).map(level => `

                <div class="difficulty-card">

                    <div>

                        <span class="difficulty-label
                            ${difficultyClass(level.difficulty)}">

                            ${difficultyLabel(level.difficulty)}

                        </span>


                        <p>

                            ${level.played}
                            game${level.played === 1 ? "" : "s"}

                        </p>

                    </div>


                    <div class="difficulty-score">

                        ${level.accuracy}%

                    </div>

                </div>

            `).join("");


        // =================================================
        // MAIN PROGRESS PAGE
        // =================================================

        list.innerHTML = `


            <!-- OVERALL SUMMARY -->

            <section class="progress-section">

                <h2>
                    Overall Progress
                </h2>


                <div class="progress-summary-grid">


                    <div class="progress-stat-card">

                        <span class="progress-stat-icon">
                            🎮
                        </span>

                        <div>

                            <p>
                                Games Played
                            </p>

                            <strong>
                                ${data.games_played}
                            </strong>

                        </div>

                    </div>


                    <div class="progress-stat-card">

                        <span class="progress-stat-icon">
                            🎯
                        </span>

                        <div>

                            <p>
                                Average Accuracy
                            </p>

                            <strong>
                                ${data.average_accuracy}%
                            </strong>

                        </div>

                    </div>


                    <div class="progress-stat-card">

                        <span class="progress-stat-icon">
                            🏆
                        </span>

                        <div>

                            <p>
                                Best Score
                            </p>

                            <strong>
                                ${data.best_score}%
                            </strong>

                        </div>

                    </div>


                    <div class="progress-stat-card">

                        <span class="progress-stat-icon">
                            📊
                        </span>

                        <div>

                            <p>
                                Average Score
                            </p>

                            <strong>
                                ${data.average_score}%
                            </strong>

                        </div>

                    </div>


                </div>

            </section>


            <!-- AI RECOMMENDATION -->

            <section class="progress-section">

                <div class="recommendation-card">

                    <div class="recommendation-icon">
                        🤖
                    </div>


                    <div>

                        <h2>
                            ${data.recommendation}
                        </h2>


                        <p>
                            ${data.recommendation_message}
                        </p>

                    </div>

                </div>

            </section>


            <!-- TREND -->

            <section class="progress-section">

                <div class="trend-card">


                    <div class="trend-icon">

                        ${
                            data.trend === "improving"

                                ? "📈"

                                : data.trend === "needs_practice"

                                ? "💪"

                                : data.trend === "starting"

                                ? "🌱"

                                : "➡️"
                        }

                    </div>


                    <div>

                        <h2>

                            ${
                                data.trend === "improving"

                                    ? "You're improving!"

                                    : data.trend === "needs_practice"

                                    ? "Keep practicing"

                                    : data.trend === "starting"

                                    ? "Great start!"

                                    : "Keep going!"
                            }

                        </h2>


                        <p>
                            ${data.trend_message}
                        </p>

                    </div>

                </div>

            </section>


            <!-- GAME PERFORMANCE -->

            <section class="progress-section">

                <h2>
                    Performance by Game
                </h2>


                <div class="game-performance-list">

                    ${gamePerformance}

                </div>

            </section>


            <!-- DIFFICULTY PERFORMANCE -->

            <section class="progress-section">

                <h2>
                    Performance by Difficulty
                </h2>


                <div class="difficulty-performance-grid">

                    ${difficultyPerformance}

                </div>

            </section>


            <!-- RECENT GAMES -->

            <section class="progress-section">

                <h2>
                    Recent Games
                </h2>


                <div class="recent-results">

                    ${recentResults}

                </div>

            </section>

        `;


    } catch (error) {

        console.error(
            "Progress loading error:",
            error
        );


        if (list) {

            list.innerHTML = `

                <div class="loading">

                    <h3>
                        Unable to load progress
                    </h3>

                    <p>
                        Please refresh the page and try again.
                    </p>

                </div>

            `;

        }

    }

}


// =================================================
// LOAD PROGRESS
// =================================================

loadProgress();
/* =========================================================
   MINDSPACE - PROGRESS
   MULTI-LANGUAGE SUPPORT
   ========================================================= */


/* =========================================================
   GET CURRENT LANGUAGE
   ========================================================= */

function getCurrentLanguage() {

    return localStorage.getItem(
        "mindspaceLanguage"
    ) || "en";

}


/* =========================================================
   GET TRANSLATED TEXT
   ========================================================= */

function t(key, fallback = "") {

    const language =
        getCurrentLanguage();

    if (
        typeof translations !== "undefined" &&
        translations[language] &&
        translations[language][key]
    ) {

        return translations[language][key];

    }


    if (
        typeof translations !== "undefined" &&
        translations.en &&
        translations.en[key]
    ) {

        return translations.en[key];

    }


    return fallback;

}


/* =========================================================
   TRANSLATE DIFFICULTY
   ========================================================= */

function difficultyLabel(difficulty) {

    const level =
        String(difficulty || "easy").toLowerCase();


    if (level === "easy") {

        return t("easy", "Easy");

    }


    if (level === "medium") {

        return t("medium", "Medium");

    }


    if (level === "hard") {

        return t("hard", "Hard");

    }


    return t("easy", "Easy");

}


/* =========================================================
   DIFFICULTY CSS CLASS
   ========================================================= */

function difficultyClass(difficulty) {

    const level =
        String(difficulty || "")
            .toLowerCase();


    if (level === "easy") return "easy";

    if (level === "medium") return "medium";

    if (level === "hard") return "hard";

    return "";

}


/* =========================================================
   TREND TITLE
   ========================================================= */

function getTrendTitle(trend) {

    if (trend === "improving") {

        return t(
            "youAreImproving",
            "You're improving!"
        );

    }


    if (trend === "needs_practice") {

        return t(
            "keepPracticing",
            "Keep practicing"
        );

    }


    if (trend === "starting") {

        return t(
            "greatStart",
            "Great start!"
        );

    }


    return t(
        "keepGoing",
        "Keep going!"
    );

}


/* =========================================================
   TREND ICON
   ========================================================= */

function getTrendIcon(trend) {

    if (trend === "improving") {

        return "📈";

    }


    if (trend === "needs_practice") {

        return "💪";

    }


    if (trend === "starting") {

        return "🌱";

    }


    return "➡️";

}


/* =========================================================
   LOAD PROGRESS
   ========================================================= */

async function loadProgress() {

    const list =
        document.getElementById(
            "progressList"
        );


    if (!list) {

        return;

    }


    try {

        const response =
            await fetch("/api/progress");


        if (!response.ok) {

            throw new Error(
                "Failed to load progress"
            );

        }


        const data =
            await response.json();


        /* =============================================
           TOP SUMMARY CARDS
           ============================================= */

        const gamesPlayed =
            document.getElementById(
                "gamesPlayed"
            );


        const averageAccuracy =
            document.getElementById(
                "averageAccuracy"
            );


        if (gamesPlayed) {

            gamesPlayed.textContent =
                data.games_played || 0;

        }


        if (averageAccuracy) {

            averageAccuracy.textContent =
                `${data.average_accuracy || 0}%`;

        }


        /* =============================================
           AI ADAPTIVE GAMING CARD
           ============================================= */

        const aiDifficulty =
            document.getElementById(
                "aiDifficulty"
            );


        const aiMessage =
            document.getElementById(
                "aiMessage"
            );


        const aiAccuracy =
            document.getElementById(
                "aiAccuracy"
            );


        const aiScore =
            document.getElementById(
                "aiScore"
            );


        const aiTime =
            document.getElementById(
                "aiTime"
            );


        if (aiDifficulty) {

            const difficulty =
                data.recommended_difficulty ||
                "easy";


            aiDifficulty.textContent =
                difficultyLabel(
                    difficulty
                );


            aiDifficulty.classList.remove(
                "easy",
                "medium",
                "hard"
            );


            aiDifficulty.classList.add(
                difficultyClass(
                    difficulty
                )
            );

        }


        if (aiMessage) {

            aiMessage.textContent =
                data.recommendation_message ||
                t(
                    "playMoreGames",
                    "Play more games to receive a personalized recommendation."
                );

        }


        if (aiAccuracy) {

            aiAccuracy.textContent =
                `${data.average_accuracy || 0}%`;

        }


        if (aiScore) {

            aiScore.textContent =
                `${data.average_score || 0}%`;

        }


        if (aiTime) {

            const time =
                data.average_time || 0;


            aiTime.textContent =
                time > 0
                    ? `${time}s`
                    : "--";

        }


        /* =============================================
           NO GAMES
           ============================================= */

        if (
            !data.results ||
            data.results.length === 0
        ) {

            list.innerHTML = `

                <div class="loading">

                    <h3>
                        ${t(
                            "noGamesPlayed",
                            "No games played yet"
                        )}
                    </h3>

                    <p>
                        ${t(
                            "noGamesPlayedText",
                            "Play your first memory game and your progress will appear here."
                        )}
                    </p>

                </div>

            `;


            return;

        }


        /* =============================================
           RECENT RESULTS
           ============================================= */

        const recentResults =
            data.results.map(result => `

                <article class="reminder-item">

                    <div>

                        <span
                            class="difficulty-label
                            ${difficultyClass(
                                result.difficulty
                            )}"
                        >

                            ${difficultyLabel(
                                result.difficulty
                            )}

                        </span>


                        <h3>

                            ${result.game_name}

                        </h3>


                        <p>

                            ${t("score", "Score")}:

                            <strong>

                                ${result.score}%

                            </strong>

                            &nbsp; • &nbsp;

                            ${t("time", "Time")}:

                            ${result.time_taken}s

                        </p>


                        <small>

                            ${result.played_at}

                        </small>

                    </div>


                    <div class="reminder-time">

                        ${result.accuracy}%

                        <small>

                            ${t(
                                "accuracy",
                                "accuracy"
                            )}

                        </small>

                    </div>

                </article>

            `).join("");


        /* =============================================
           GAME PERFORMANCE
           ============================================= */

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
                            "
                        >
                        </div>

                    </div>


                    <div class="progress-game-details">

                        <span>

                            ${t(
                                "played",
                                "Played"
                            )}:

                            ${game.played}

                        </span>


                        <span>

                            ${t(
                                "bestScore",
                                "Best"
                            )}:

                            ${game.best_score}%

                        </span>


                        <span>

                            ${t(
                                "averageTime",
                                "Avg time"
                            )}:

                            ${game.average_time}s

                        </span>

                    </div>

                </div>

            `).join("");


        /* =============================================
           DIFFICULTY PERFORMANCE
           ============================================= */

        const difficultyPerformance =
            (data.difficulty_stats || []).map(level => `

                <div class="difficulty-card">

                    <div>

                        <span
                            class="difficulty-label
                            ${difficultyClass(
                                level.difficulty
                            )}"
                        >

                            ${difficultyLabel(
                                level.difficulty
                            )}

                        </span>


                        <p>

                            ${level.played}

                            ${t(
                                "games",
                                level.played === 1
                                    ? "game"
                                    : "games"
                            )}

                        </p>

                    </div>


                    <div class="difficulty-score">

                        ${level.accuracy}%

                    </div>

                </div>

            `).join("");


        /* =============================================
           MAIN PROGRESS CONTENT
           ============================================= */

        list.innerHTML = `


            <!-- OVERALL SUMMARY -->

            <section class="progress-section">

                <h2>

                    ${t(
                        "overallProgress",
                        "Overall Progress"
                    )}

                </h2>


                <div class="progress-summary-grid">


                    <div class="progress-stat-card">

                        <span class="progress-stat-icon">

                            🎮

                        </span>


                        <div>

                            <p>

                                ${t(
                                    "gamesPlayed",
                                    "Games Played"
                                )}

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

                                ${t(
                                    "averageAccuracy",
                                    "Average Accuracy"
                                )}

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

                                ${t(
                                    "bestScore",
                                    "Best Score"
                                )}

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

                                ${t(
                                    "averageScore",
                                    "Average Score"
                                )}

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

                        ${getTrendIcon(
                            data.trend
                        )}

                    </div>


                    <div>

                        <h2>

                            ${getTrendTitle(
                                data.trend
                            )}

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

                    ${t(
                        "performanceByGame",
                        "Performance by Game"
                    )}

                </h2>


                <div class="game-performance-list">

                    ${gamePerformance}

                </div>

            </section>


            <!-- DIFFICULTY PERFORMANCE -->

            <section class="progress-section">

                <h2>

                    ${t(
                        "performanceByDifficulty",
                        "Performance by Difficulty"
                    )}

                </h2>


                <div class="difficulty-performance-grid">

                    ${difficultyPerformance}

                </div>

            </section>


            <!-- RECENT GAMES -->

            <section class="progress-section">

                <h2>

                    ${t(
                        "recentGames",
                        "Recent Games"
                    )}

                </h2>


                <div class="recent-results">

                    ${recentResults}

                </div>

            </section>

        `;


    }
    catch (error) {

        console.error(
            "Progress loading error:",
            error
        );


        list.innerHTML = `

            <div class="loading">

                <h3>

                    ${t(
                        "unableToLoadProgress",
                        "Unable to load progress"
                    )}

                </h3>

                <p>

                    ${t(
                        "refreshAndTry",
                        "Please refresh the page and try again."
                    )}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   LOAD WHEN PAGE OPENS
   ========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadProgress();

    }

);


/* =========================================================
   RELOAD WHEN LANGUAGE CHANGES
   ========================================================= */

document.addEventListener(

    "mindspaceLanguageChanged",

    () => {

        loadProgress();

    }

);
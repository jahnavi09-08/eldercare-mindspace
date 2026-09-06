let recommendedDifficulty = "easy";


async function loadGamesAIRecommendation() {

    const difficultyElement =
        document.getElementById("gamesAiDifficulty");

    const messageElement =
        document.getElementById("gamesAiMessage");

    if (!difficultyElement || !messageElement) {
        return;
    }

    try {

        const response =
            await fetch("/api/progress");

        if (!response.ok) {
            throw new Error(
                "Could not load AI recommendation"
            );
        }

        const data = await response.json();


        // Get AI recommended difficulty
        recommendedDifficulty =
            data.recommended_difficulty || "easy";


        // Save recommendation in browser
        localStorage.setItem(
            "mindspaceRecommendedDifficulty",
            recommendedDifficulty
        );


        // Display difficulty
        difficultyElement.textContent =
            recommendedDifficulty.charAt(0).toUpperCase()
            + recommendedDifficulty.slice(1);


        // Add difficulty styling
        difficultyElement.classList.remove(
            "easy",
            "medium",
            "hard"
        );

        difficultyElement.classList.add(
            recommendedDifficulty.toLowerCase()
        );


        // Display AI explanation
        messageElement.textContent =
            data.recommendation_message ||
            "MindSpace has selected a difficulty level based on your recent performance.";

    }
    catch (error) {

        console.error(
            "AI recommendation error:",
            error
        );


        // Default recommendation
        recommendedDifficulty = "easy";


        localStorage.setItem(
            "mindspaceRecommendedDifficulty",
            "easy"
        );


        difficultyElement.textContent =
            "Easy";

        difficultyElement.classList.remove(
            "medium",
            "hard"
        );

        difficultyElement.classList.add(
            "easy"
        );


        messageElement.textContent =
            "Start with an easy level. MindSpace will adapt as you play.";

    }

}


document.addEventListener(
    "DOMContentLoaded",
    loadGamesAIRecommendation
);
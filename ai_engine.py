# =========================================================
# MINDSPACE AI ADAPTIVE GAMING ENGINE
# =========================================================


def get_ai_recommendation(
    average_accuracy,
    average_score,
    average_time
):
    """
    Adaptive intelligence engine.

    It analyzes the user's cognitive game performance
    and recommends the most suitable difficulty level.
    """

    accuracy = float(average_accuracy or 0)
    score = float(average_score or 0)
    time_taken = float(average_time or 0)


    # =====================================================
    # PERFORMANCE ANALYSIS
    # =====================================================

    performance_score = 0


    # Accuracy analysis
    if accuracy >= 85:
        performance_score += 3

    elif accuracy >= 65:
        performance_score += 2

    else:
        performance_score += 1


    # Score analysis
    if score >= 80:
        performance_score += 3

    elif score >= 50:
        performance_score += 2

    else:
        performance_score += 1


    # Time analysis
    # Faster completion generally indicates greater comfort
    # with the current challenge.
    if time_taken > 0:

        if time_taken <= 30:
            performance_score += 3

        elif time_taken <= 60:
            performance_score += 2

        else:
            performance_score += 1


    # =====================================================
    # ADAPTIVE DIFFICULTY DECISION
    # =====================================================

    if performance_score >= 7:

        difficulty = "hard"

        message = (
            "Excellent performance! Based on your accuracy, "
            "score, and completion time, MindSpace recommends "
            "trying Hard difficulty."
        )

    elif performance_score >= 4:

        difficulty = "medium"

        message = (
            "You are showing steady performance. MindSpace "
            "recommends Medium difficulty for a balanced challenge."
        )

    else:

        difficulty = "easy"

        message = (
            "MindSpace recommends Easy difficulty so you can "
            "practice comfortably and build confidence."
        )


    return {

        "difficulty": difficulty,

        "message": message,

        "performance_score": performance_score

    }
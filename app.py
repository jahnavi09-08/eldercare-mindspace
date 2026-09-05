from flask import Flask, render_template, request, jsonify
from database import init_db, get_db

app = Flask(__name__)

# Create the SQLite database/tables when the server starts.
init_db()


# =========================================================
# PAGE ROUTES
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/games")
def games():
    return render_template("games.html")


@app.route("/game/<game_name>")
def game(game_name):
    return render_template("game.html", game_name=game_name)


@app.route("/reminders")
def reminders():
    return render_template("reminders.html")


@app.route("/progress")
def progress():
    return render_template("progress.html")


@app.route("/activities")
def activities():
    return render_template("activities.html")


@app.route("/profile")
def profile():
    return render_template("profile.html")


# =========================================================
# GAMES API
# =========================================================

@app.get("/api/games")
def api_games():

    games = [
        {
            "id": "sequence",
            "name": "Sequence Memory",
            "icon": "🔢"
        },
        {
            "id": "picture",
            "name": "Remember the Picture",
            "icon": "🖼️"
        },
        {
            "id": "objects",
            "name": "Object Matching",
            "icon": "🧩"
        },
        {
            "id": "routine",
            "name": "Daily Routine Recall",
            "icon": "📅"
        },
        {
            "id": "words",
            "name": "Word Recall",
            "icon": "🔤"
        }
    ]

    return jsonify(games)


# =========================================================
# SAVE GAME RESULT
# =========================================================

@app.post("/api/game-result")
def api_game_result():

    data = request.get_json(silent=True) or {}

    game_name = str(
        data.get("game_name", "Unknown Game")
    ).strip()

    difficulty = str(
        data.get("difficulty", "easy")
    ).strip().lower()

    try:
        score = float(data.get("score", 0))
    except (TypeError, ValueError):
        score = 0

    try:
        accuracy = float(data.get("accuracy", 0))
    except (TypeError, ValueError):
        accuracy = 0

    try:
        time_taken = int(float(data.get("time_taken", 0)))
    except (TypeError, ValueError):
        time_taken = 0

    # Keep values within sensible limits.
    score = max(0, min(100, score))
    accuracy = max(0, min(100, accuracy))
    time_taken = max(0, time_taken)

    if difficulty not in ["easy", "medium", "hard"]:
        difficulty = "easy"

    db = get_db()

    db.execute(
        """
        INSERT INTO game_results
        (user_id, game_name, difficulty, score, accuracy, time_taken)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            1,
            game_name,
            difficulty,
            score,
            accuracy,
            time_taken
        )
    )

    db.commit()
    db.close()

    return jsonify({
        "success": True,
        "message": "Game result saved."
    })


# =========================================================
# PROGRESS API
# =========================================================

@app.get("/api/progress")
def api_progress():

    db = get_db()

    # -----------------------------------------------------
    # Recent game results
    # -----------------------------------------------------

    results = db.execute(
        """
        SELECT
            game_name,
            difficulty,
            score,
            accuracy,
            time_taken,
            played_at
        FROM game_results
        WHERE user_id = 1
        ORDER BY id DESC
        LIMIT 20
        """
    ).fetchall()

    # -----------------------------------------------------
    # Overall statistics
    # -----------------------------------------------------

    summary = db.execute(
        """
        SELECT
            COUNT(*) AS games_played,
            COALESCE(AVG(accuracy), 0) AS average_accuracy,
            COALESCE(MAX(score), 0) AS best_score,
            COALESCE(AVG(score), 0) AS average_score
        FROM game_results
        WHERE user_id = 1
        """
    ).fetchone()

    # -----------------------------------------------------
    # Performance by game
    # -----------------------------------------------------

    game_stats = db.execute(
        """
        SELECT
            game_name,
            COUNT(*) AS played,
            COALESCE(AVG(accuracy), 0) AS accuracy,
            COALESCE(MAX(score), 0) AS best_score,
            COALESCE(AVG(time_taken), 0) AS average_time
        FROM game_results
        WHERE user_id = 1
        GROUP BY game_name
        ORDER BY played DESC
        """
    ).fetchall()

    # -----------------------------------------------------
    # Performance by difficulty
    # -----------------------------------------------------

    difficulty_stats = db.execute(
        """
        SELECT
            difficulty,
            COUNT(*) AS played,
            COALESCE(AVG(accuracy), 0) AS accuracy,
            COALESCE(MAX(score), 0) AS best_score
        FROM game_results
        WHERE user_id = 1
        GROUP BY difficulty
        ORDER BY
            CASE difficulty
                WHEN 'easy' THEN 1
                WHEN 'medium' THEN 2
                WHEN 'hard' THEN 3
                ELSE 4
            END
        """
    ).fetchall()

    # -----------------------------------------------------
    # Recent trend
    # -----------------------------------------------------

    trend_rows = db.execute(
        """
        SELECT accuracy
        FROM game_results
        WHERE user_id = 1
        ORDER BY id DESC
        LIMIT 10
        """
    ).fetchall()

    db.close()

    # -----------------------------------------------------
    # Convert database rows
    # -----------------------------------------------------

    result_list = [dict(row) for row in results]

    game_stats_list = []

    for row in game_stats:
        game_stats_list.append({
            "game_name": row["game_name"],
            "played": row["played"],
            "accuracy": round(float(row["accuracy"]), 1),
            "best_score": round(float(row["best_score"]), 1),
            "average_time": round(float(row["average_time"]), 1)
        })

    difficulty_stats_list = []

    for row in difficulty_stats:
        difficulty_stats_list.append({
            "difficulty": row["difficulty"],
            "played": row["played"],
            "accuracy": round(float(row["accuracy"]), 1),
            "best_score": round(float(row["best_score"]), 1)
        })

    # -----------------------------------------------------
    # Calculate trend
    # -----------------------------------------------------

    trend = "starting"
    trend_message = "Start playing games to see your memory progress."

    trend_values = [
        float(row["accuracy"])
        for row in trend_rows
    ]

    if len(trend_values) >= 4:

        recent_values = trend_values[:5]

        previous_values = trend_values[5:10]

        recent_average = (
            sum(recent_values) / len(recent_values)
        )

        if previous_values:
            previous_average = (
                sum(previous_values) / len(previous_values)
            )

            difference = recent_average - previous_average

            if difference >= 5:
                trend = "improving"
                trend_message = (
                    "Your recent performance is improving. "
                    "Keep up the good work!"
                )

            elif difference <= -5:
                trend = "needs_practice"
                trend_message = (
                    "A little more practice may help "
                    "strengthen your memory."
                )

            else:
                trend = "steady"
                trend_message = (
                    "Your performance is staying steady. "
                    "Keep practicing regularly."
                )

    # -----------------------------------------------------
    # Overall values
    # -----------------------------------------------------

    games_played = int(
        summary["games_played"]
    )

    average_accuracy = round(
        float(summary["average_accuracy"]),
        1
    )

    best_score = round(
        float(summary["best_score"]),
        1
    )

    average_score = round(
        float(summary["average_score"]),
        1
    )

    # -----------------------------------------------------
    # Adaptive difficulty recommendation
    # -----------------------------------------------------

    if games_played == 0:

        recommended_difficulty = "easy"

        recommendation = "Start with Easy"

        recommendation_message = (
            "Begin with Easy games and take your time "
            "to become comfortable with the activities."
        )

    elif average_accuracy >= 85:

        recommended_difficulty = "hard"

        recommendation = "Ready for Hard"

        recommendation_message = (
            "Excellent work! You are performing very well. "
            "You can try Hard games for a greater challenge."
        )

    elif average_accuracy >= 70:

        recommended_difficulty = "medium"

        recommendation = "Ready for Medium"

        recommendation_message = (
            "Good progress! Try Medium games while "
            "continuing to focus on accuracy."
        )

    else:

        recommended_difficulty = "easy"

        recommendation = "Keep practicing Easy"

        recommendation_message = (
            "Keep practicing at Easy and focus on "
            "accuracy rather than speed."
        )

    return jsonify({

        # Overall
        "games_played": games_played,
        "average_accuracy": average_accuracy,
        "best_score": best_score,
        "average_score": average_score,

        # Recommendation
        "recommended_difficulty": recommended_difficulty,
        "recommendation": recommendation,
        "recommendation_message": recommendation_message,

        # Trend
        "trend": trend,
        "trend_message": trend_message,

        # Detailed statistics
        "game_stats": game_stats_list,
        "difficulty_stats": difficulty_stats_list,

        # Recent games
        "results": result_list
    })


# =========================================================
# REMINDERS API
# =========================================================

@app.get("/api/reminders")
def api_get_reminders():

    db = get_db()

    rows = db.execute(
        """
        SELECT
            id,
            title,
            description,
            reminder_time,
            type,
            completed
        FROM reminders
        WHERE user_id = 1
        ORDER BY reminder_time
        """
    ).fetchall()

    db.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


@app.post("/api/reminders")
def api_add_reminder():

    data = request.get_json(silent=True) or {}

    title = str(
        data.get("title", "")
    ).strip()

    description = str(
        data.get("description", "")
    ).strip()

    reminder_time = str(
        data.get("reminder_time", "")
    ).strip()

    reminder_type = str(
        data.get("type", "Wellness")
    ).strip()

    if not title or not reminder_time:

        return jsonify({
            "success": False,
            "message": "Title and time are required."
        }), 400

    db = get_db()

    db.execute(
        """
        INSERT INTO reminders
        (
            user_id,
            title,
            description,
            reminder_time,
            type,
            completed
        )
        VALUES (?, ?, ?, ?, ?, 0)
        """,
        (
            1,
            title,
            description,
            reminder_time,
            reminder_type
        )
    )

    db.commit()
    db.close()

    return jsonify({
        "success": True,
        "message": "Reminder added successfully."
    })


@app.post("/api/reminders/<int:reminder_id>/complete")
def api_complete_reminder(reminder_id):

    db = get_db()

    db.execute(
        """
        UPDATE reminders
        SET completed = 1
        WHERE id = ?
        AND user_id = 1
        """,
        (reminder_id,)
    )

    db.commit()
    db.close()

    return jsonify({
        "success": True,
        "message": "Reminder completed."
    })


# =========================================================
# ACTIVITIES API
# =========================================================

@app.get("/api/activities")
def api_get_activities():

    db = get_db()

    rows = db.execute(
        """
        SELECT
            id,
            activity_name,
            duration,
            scheduled_time,
            completed
        FROM activities
        WHERE user_id = 1
        ORDER BY scheduled_time
        """
    ).fetchall()

    db.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


@app.post("/api/activities")
def api_add_activity():

    data = request.get_json(silent=True) or {}

    activity_name = str(
        data.get("activity_name", "")
    ).strip()

    duration = str(
        data.get("duration", "")
    ).strip()

    scheduled_time = str(
        data.get("scheduled_time", "")
    ).strip()

    # Activity name and time are required.
    if not activity_name or not scheduled_time:

        return jsonify({
            "success": False,
            "message": "Activity name and time are required."
        }), 400

    db = get_db()

    db.execute(
        """
        INSERT INTO activities
        (
            user_id,
            activity_name,
            duration,
            scheduled_time,
            completed
        )
        VALUES (?, ?, ?, ?, 0)
        """,
        (
            1,
            activity_name,
            duration,
            scheduled_time
        )
    )

    db.commit()
    db.close()

    return jsonify({
        "success": True,
        "message": "Activity added successfully."
    })


@app.post("/api/activities/<int:activity_id>/complete")
def api_complete_activity(activity_id):

    db = get_db()

    db.execute(
        """
        UPDATE activities
        SET completed = 1
        WHERE id = ?
        AND user_id = 1
        """,
        (activity_id,)
    )

    db.commit()
    db.close()

    return jsonify({
        "success": True,
        "message": "Activity completed."
    })


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":
    app.run(debug=True)
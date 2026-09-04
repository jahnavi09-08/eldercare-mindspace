from flask import Flask, render_template, request, jsonify
from database import init_db, get_db

app = Flask(__name__)

# Create the SQLite database/tables when the server starts.
init_db()


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


# ---------- API ----------

@app.get("/api/games")
def api_games():
    games = [
        {"id": "sequence", "name": "Sequence Memory", "icon": "🔢"},
        {"id": "picture", "name": "Remember the Picture", "icon": "🖼️"},
        {"id": "objects", "name": "Object Matching", "icon": "🧩"},
        {"id": "routine", "name": "Daily Routine Recall", "icon": "📅"},
        {"id": "words", "name": "Word Recall", "icon": "🔤"},
    ]
    return jsonify(games)


@app.post("/api/game-result")
def api_game_result():
    data = request.get_json(silent=True) or {}

    game_name = data.get("game_name", "Unknown Game")
    difficulty = data.get("difficulty", "easy")
    score = int(data.get("score", 0))
    accuracy = float(data.get("accuracy", 0))
    time_taken = int(data.get("time_taken", 0))

    db = get_db()
    db.execute(
        """
        INSERT INTO game_results
        (user_id, game_name, difficulty, score, accuracy, time_taken)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (1, game_name, difficulty, score, accuracy, time_taken),
    )
    db.commit()
    db.close()

    return jsonify({"success": True, "message": "Game result saved."})


@app.get("/api/progress")
def api_progress():
    db = get_db()

    results = db.execute(
        """
        SELECT game_name, difficulty, score, accuracy, time_taken, played_at
        FROM game_results
        WHERE user_id = 1
        ORDER BY id DESC
        LIMIT 20
        """
    ).fetchall()

    summary = db.execute(
        """
        SELECT
            COUNT(*) AS games_played,
            COALESCE(AVG(accuracy), 0) AS average_accuracy
        FROM game_results
        WHERE user_id = 1
        """
    ).fetchone()

    db.close()

    return jsonify({
        "games_played": summary["games_played"],
        "average_accuracy": round(summary["average_accuracy"], 1),
        "results": [dict(row) for row in results],
    })


@app.get("/api/reminders")
def api_get_reminders():
    db = get_db()
    rows = db.execute(
        """
        SELECT id, title, description, reminder_time, type, completed
        FROM reminders
        WHERE user_id = 1
        ORDER BY reminder_time
        """
    ).fetchall()
    db.close()

    return jsonify([dict(row) for row in rows])


@app.post("/api/reminders")
def api_add_reminder():
    data = request.get_json(silent=True) or {}

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    reminder_time = data.get("reminder_time", "")
    reminder_type = data.get("type", "Wellness")

    if not title or not reminder_time:
        return jsonify({"success": False, "message": "Title and time are required."}), 400

    db = get_db()
    db.execute(
        """
        INSERT INTO reminders
        (user_id, title, description, reminder_time, type, completed)
        VALUES (?, ?, ?, ?, ?, 0)
        """,
        (1, title, description, reminder_time, reminder_type),
    )
    db.commit()
    db.close()

    return jsonify({"success": True})


@app.post("/api/reminders/<int:reminder_id>/complete")
def api_complete_reminder(reminder_id):
    db = get_db()
    db.execute(
        "UPDATE reminders SET completed = 1 WHERE id = ? AND user_id = 1",
        (reminder_id,),
    )
    db.commit()
    db.close()

    return jsonify({"success": True})


@app.get("/api/activities")
def api_get_activities():
    db = get_db()
    rows = db.execute(
        """
        SELECT id, activity_name, duration, scheduled_time, completed
        FROM activities
        WHERE user_id = 1
        ORDER BY scheduled_time
        """
    ).fetchall()
    db.close()

    return jsonify([dict(row) for row in rows])


@app.post("/api/activities/<int:activity_id>/complete")
def api_complete_activity(activity_id):
    db = get_db()
    db.execute(
        "UPDATE activities SET completed = 1 WHERE id = ? AND user_id = 1",
        (activity_id,),
    )
    db.commit()
    db.close()

    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)

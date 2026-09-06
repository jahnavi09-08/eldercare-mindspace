from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    session,
    redirect,
    url_for
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from functools import wraps
import os

from database import init_db, get_db


# =========================================================
# APP CONFIGURATION
# =========================================================

app = Flask(__name__)

app.secret_key = os.environ.get(
    "SECRET_KEY",
    "eldercare-mindspace-sih-2026-secret"
)

# Create database/tables when server starts.
init_db()


# =========================================================
# DATABASE MIGRATION
# =========================================================
# If your existing users table was created before the login
# feature, add the new login columns without deleting data.
# =========================================================

def prepare_users_table():

    db = get_db()

    columns = db.execute(
        "PRAGMA table_info(users)"
    ).fetchall()

    column_names = [
        row["name"]
        for row in columns
    ]

    if "username" not in column_names:

        db.execute(
            "ALTER TABLE users ADD COLUMN username TEXT"
        )

    if "password_hash" not in column_names:

        db.execute(
            "ALTER TABLE users ADD COLUMN password_hash TEXT"
        )

    db.commit()

    # Give the existing demo user a login username/password.
    ravi = db.execute(
        "SELECT * FROM users WHERE id = 1"
    ).fetchone()

    if ravi:

        if not ravi["username"]:

            db.execute(
                """
                UPDATE users
                SET username = ?
                WHERE id = 1
                """,
                ("ravi",)
            )

        if not ravi["password_hash"]:

            db.execute(
                """
                UPDATE users
                SET password_hash = ?
                WHERE id = 1
                """,
                (
                    generate_password_hash("ravi123"),
                )
            )

    db.commit()
    db.close()


prepare_users_table()


# =========================================================
# LOGIN HELPERS
# =========================================================

def get_current_user():

    user_id = session.get("user_id")

    if not user_id:
        return None

    db = get_db()

    user = db.execute(
        """
        SELECT id, name, age, username, created_at
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    ).fetchone()

    db.close()

    return user


def login_required(function):

    @wraps(function)
    def decorated_function(*args, **kwargs):

        if "user_id" not in session:

            # API request
            if request.path.startswith("/api/"):

                return jsonify({
                    "success": False,
                    "message": "Please login first."
                }), 401

            return redirect(url_for("login"))

        return function(*args, **kwargs)

    return decorated_function


# =========================================================
# AUTHENTICATION ROUTES
# =========================================================

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = str(
            request.form.get("username", "")
        ).strip().lower()

        password = str(
            request.form.get("password", "")
        )

        if not username or not password:

            return render_template(
                "login.html",
                error="Please enter your username and password."
            )

        db = get_db()

        user = db.execute(
            """
            SELECT *
            FROM users
            WHERE username = ?
            """,
            (username,)
        ).fetchone()

        db.close()

        if not user:

            return render_template(
                "login.html",
                error="Invalid username or password."
            )

        password_hash = user["password_hash"]

        if not password_hash or not check_password_hash(
            password_hash,
            password
        ):

            return render_template(
                "login.html",
                error="Invalid username or password."
            )

        session.clear()

        session["user_id"] = user["id"]

        return redirect(url_for("home"))

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        name = str(
            request.form.get("name", "")
        ).strip()

        username = str(
            request.form.get("username", "")
        ).strip().lower()

        age_text = str(
            request.form.get("age", "")
        ).strip()

        password = str(
            request.form.get("password", "")
        )

        confirm_password = str(
            request.form.get("confirm_password", "")
        )

        if not name or not username or not password:

            return render_template(
                "register.html",
                error="Please fill in all required fields."
            )

        if len(password) < 6:

            return render_template(
                "register.html",
                error="Password must be at least 6 characters."
            )

        if password != confirm_password:

            return render_template(
                "register.html",
                error="Passwords do not match."
            )

        age = None

        if age_text:

            try:
                age = int(age_text)

            except ValueError:

                return render_template(
                    "register.html",
                    error="Please enter a valid age."
                )

        db = get_db()

        existing_user = db.execute(
            """
            SELECT id
            FROM users
            WHERE username = ?
            """,
            (username,)
        ).fetchone()

        if existing_user:

            db.close()

            return render_template(
                "register.html",
                error="That username is already being used."
            )

        password_hash = generate_password_hash(
            password
        )

        cursor = db.execute(
            """
            INSERT INTO users
            (
                name,
                age,
                username,
                password_hash
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                name,
                age,
                username,
                password_hash
            )
        )

        user_id = cursor.lastrowid

        db.commit()
        db.close()

        session.clear()

        session["user_id"] = user_id

        return redirect(url_for("home"))

    return render_template("register.html")


@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("login"))


# =========================================================
# PAGE ROUTES
# =========================================================

@app.route("/")
@login_required
def home():

    # Get currently logged-in user
    user = get_current_user()

    user_id = session["user_id"]

    db = get_db()


    # ==========================================
    # GET NEXT REMINDER
    # ==========================================

    reminder = db.execute(
        """
        SELECT
            title,
            reminder_time
        FROM reminders
        WHERE user_id = ?
        AND completed = 0
        ORDER BY reminder_time ASC
        LIMIT 1
        """,
        (user_id,)
    ).fetchone()


    # ==========================================
    # GET NEXT ACTIVITY
    # ==========================================

    activity = db.execute(
        """
        SELECT
            activity_name,
            duration,
            scheduled_time
        FROM activities
        WHERE user_id = ?
        AND completed = 0
        ORDER BY scheduled_time ASC
        LIMIT 1
        """,
        (user_id,)
    ).fetchone()


    # ==========================================
    # GET GAME PROGRESS
    # ==========================================

    progress_data = db.execute(
        """
        SELECT
            COUNT(*) AS games_played,

            COALESCE(
                AVG(accuracy),
                0
            ) AS average_accuracy

        FROM game_results
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()


    db.close()


    # ==========================================
    # FORMAT REMINDER DATA
    # ==========================================

    next_reminder = None

    if reminder:

        next_reminder = {
            "title": reminder["title"],
            "time": reminder["reminder_time"]
        }


    # ==========================================
    # FORMAT ACTIVITY DATA
    # ==========================================

    next_activity = None

    if activity:

        next_activity = {
            "activity_name": activity["activity_name"],
            "duration": activity["duration"],
            "time": activity["scheduled_time"]
        }


    # ==========================================
    # FORMAT PROGRESS DATA
    # ==========================================

    progress = None

    if progress_data:

        games_played = int(
            progress_data["games_played"]
        )

        average_accuracy = round(
            float(
                progress_data["average_accuracy"]
            ),
            1
        )


        # Only show progress if the user
        # has actually played at least one game
        if games_played > 0:

            progress = {
                "games_played": games_played,
                "average_accuracy": average_accuracy
            }


    # ==========================================
    # SEND DATA TO HOME PAGE
    # ==========================================

    return render_template(
        "index.html",

        user=user,

        next_reminder=next_reminder,

        next_activity=next_activity,

        progress=progress
    )

@app.route("/games")
@login_required
def games():

    return render_template(
        "games.html",
        user=get_current_user()
    )


@app.route("/game/<game_name>")
@login_required
def game(game_name):

    return render_template(
        "game.html",
        game_name=game_name,
        user=get_current_user()
    )


@app.route("/reminders")
@login_required
def reminders():

    return render_template(
        "reminders.html",
        user=get_current_user()
    )


@app.route("/progress")
@login_required
def progress():

    return render_template(
        "progress.html",
        user=get_current_user()
    )


@app.route("/activities")
@login_required
def activities():

    return render_template(
        "activities.html",
        user=get_current_user()
    )


@app.route("/profile")
@login_required
def profile():

    return render_template(
        "profile.html",
        user=get_current_user()
    )


# =========================================================
# GAMES API
# =========================================================

@app.get("/api/games")
@login_required
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
@login_required
def api_game_result():

    user_id = session["user_id"]

    data = request.get_json(
        silent=True
    ) or {}

    game_name = str(
        data.get(
            "game_name",
            "Unknown Game"
        )
    ).strip()

    difficulty = str(
        data.get(
            "difficulty",
            "easy"
        )
    ).strip().lower()

    try:

        score = float(
            data.get("score", 0)
        )

    except (TypeError, ValueError):

        score = 0

    try:

        accuracy = float(
            data.get("accuracy", 0)
        )

    except (TypeError, ValueError):

        accuracy = 0

    try:

        time_taken = int(
            float(
                data.get(
                    "time_taken",
                    0
                )
            )
        )

    except (TypeError, ValueError):

        time_taken = 0

    score = max(
        0,
        min(100, score)
    )

    accuracy = max(
        0,
        min(100, accuracy)
    )

    time_taken = max(
        0,
        time_taken
    )

    if difficulty not in [
        "easy",
        "medium",
        "hard"
    ]:

        difficulty = "easy"

    db = get_db()

    db.execute(
        """
        INSERT INTO game_results
        (
            user_id,
            game_name,
            difficulty,
            score,
            accuracy,
            time_taken
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
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
@login_required
def api_progress():

    user_id = session["user_id"]

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
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 20
        """,
        (user_id,)
    ).fetchall()


    # -----------------------------------------------------
    # Overall statistics
    # -----------------------------------------------------

    summary = db.execute(
        """
        SELECT
            COUNT(*) AS games_played,
            COALESCE(
                AVG(accuracy),
                0
            ) AS average_accuracy,
            COALESCE(
                MAX(score),
                0
            ) AS best_score,
            COALESCE(
                AVG(score),
                0
            ) AS average_score
        FROM game_results
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()


    # -----------------------------------------------------
    # Performance by game
    # -----------------------------------------------------

    game_stats = db.execute(
        """
        SELECT
            game_name,
            COUNT(*) AS played,
            COALESCE(
                AVG(accuracy),
                0
            ) AS accuracy,
            COALESCE(
                MAX(score),
                0
            ) AS best_score,
            COALESCE(
                AVG(time_taken),
                0
            ) AS average_time
        FROM game_results
        WHERE user_id = ?
        GROUP BY game_name
        ORDER BY played DESC
        """,
        (user_id,)
    ).fetchall()


    # -----------------------------------------------------
    # Performance by difficulty
    # -----------------------------------------------------

    difficulty_stats = db.execute(
        """
        SELECT
            difficulty,
            COUNT(*) AS played,
            COALESCE(
                AVG(accuracy),
                0
            ) AS accuracy,
            COALESCE(
                MAX(score),
                0
            ) AS best_score
        FROM game_results
        WHERE user_id = ?
        GROUP BY difficulty
        ORDER BY
            CASE difficulty
                WHEN 'easy' THEN 1
                WHEN 'medium' THEN 2
                WHEN 'hard' THEN 3
                ELSE 4
            END
        """,
        (user_id,)
    ).fetchall()


    # -----------------------------------------------------
    # Recent trend
    # -----------------------------------------------------

    trend_rows = db.execute(
        """
        SELECT accuracy
        FROM game_results
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 10
        """,
        (user_id,)
    ).fetchall()


    db.close()


    # -----------------------------------------------------
    # Convert database rows
    # -----------------------------------------------------

    result_list = [
        dict(row)
        for row in results
    ]


    game_stats_list = []

    for row in game_stats:

        game_stats_list.append({

            "game_name": row["game_name"],

            "played": row["played"],

            "accuracy": round(
                float(row["accuracy"]),
                1
            ),

            "best_score": round(
                float(row["best_score"]),
                1
            ),

            "average_time": round(
                float(row["average_time"]),
                1
            )

        })


    difficulty_stats_list = []

    for row in difficulty_stats:

        difficulty_stats_list.append({

            "difficulty": row["difficulty"],

            "played": row["played"],

            "accuracy": round(
                float(row["accuracy"]),
                1
            ),

            "best_score": round(
                float(row["best_score"]),
                1
            )

        })


    # -----------------------------------------------------
    # Calculate trend
    # -----------------------------------------------------

    trend = "starting"

    trend_message = (
        "Start playing games to see "
        "your memory progress."
    )


    trend_values = [

        float(row["accuracy"])

        for row in trend_rows

    ]


    if len(trend_values) >= 4:

        recent_values = trend_values[:5]

        previous_values = trend_values[5:10]


        recent_average = (
            sum(recent_values)
            / len(recent_values)
        )


        if previous_values:

            previous_average = (
                sum(previous_values)
                / len(previous_values)
            )

            difference = (
                recent_average
                - previous_average
            )


            if difference >= 5:

                trend = "improving"

                trend_message = (
                    "Your recent performance "
                    "is improving. Keep up "
                    "the good work!"
                )


            elif difference <= -5:

                trend = "needs_practice"

                trend_message = (
                    "A little more practice "
                    "may help strengthen "
                    "your memory."
                )


            else:

                trend = "steady"

                trend_message = (
                    "Your performance is "
                    "staying steady. Keep "
                    "practicing regularly."
                )


    # -----------------------------------------------------
    # Overall values
    # -----------------------------------------------------

    games_played = int(
        summary["games_played"]
    )


    average_accuracy = round(
        float(
            summary["average_accuracy"]
        ),
        1
    )


    best_score = round(
        float(
            summary["best_score"]
        ),
        1
    )


    average_score = round(
        float(
            summary["average_score"]
        ),
        1
    )


    # -----------------------------------------------------
    # Adaptive difficulty
    # -----------------------------------------------------

    if games_played == 0:

        recommended_difficulty = "easy"

        recommendation = "Start with Easy"

        recommendation_message = (
            "Begin with Easy games and "
            "take your time to become "
            "comfortable with the activities."
        )


    elif average_accuracy >= 85:

        recommended_difficulty = "hard"

        recommendation = "Ready for Hard"

        recommendation_message = (
            "Excellent work! You are "
            "performing very well. You "
            "can try Hard games for a "
            "greater challenge."
        )


    elif average_accuracy >= 70:

        recommended_difficulty = "medium"

        recommendation = "Ready for Medium"

        recommendation_message = (
            "Good progress! Try Medium "
            "games while continuing to "
            "focus on accuracy."
        )


    else:

        recommended_difficulty = "easy"

        recommendation = "Keep practicing Easy"

        recommendation_message = (
            "Keep practicing at Easy and "
            "focus on accuracy rather "
            "than speed."
        )


    return jsonify({

        "games_played":
            games_played,

        "average_accuracy":
            average_accuracy,

        "best_score":
            best_score,

        "average_score":
            average_score,

        "recommended_difficulty":
            recommended_difficulty,

        "recommendation":
            recommendation,

        "recommendation_message":
            recommendation_message,

        "trend":
            trend,

        "trend_message":
            trend_message,

        "game_stats":
            game_stats_list,

        "difficulty_stats":
            difficulty_stats_list,

        "results":
            result_list

    })


# =========================================================
# REMINDERS API
# =========================================================

@app.get("/api/reminders")
@login_required
def api_get_reminders():

    user_id = session["user_id"]

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
        WHERE user_id = ?
        ORDER BY reminder_time
        """,
        (user_id,)
    ).fetchall()

    db.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


@app.post("/api/reminders")
@login_required
def api_add_reminder():

    user_id = session["user_id"]

    data = request.get_json(
        silent=True
    ) or {}


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
        data.get(
            "type",
            "Wellness"
        )
    ).strip()


    if not title or not reminder_time:

        return jsonify({

            "success": False,

            "message":
                "Title and time are required."

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
            user_id,
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

        "message":
            "Reminder added successfully."

    })


@app.post(
    "/api/reminders/<int:reminder_id>/complete"
)
@login_required
def api_complete_reminder(reminder_id):

    user_id = session["user_id"]

    db = get_db()

    db.execute(
        """
        UPDATE reminders
        SET completed = 1
        WHERE id = ?
        AND user_id = ?
        """,
        (
            reminder_id,
            user_id
        )
    )

    db.commit()

    db.close()


    return jsonify({

        "success": True,

        "message":
            "Reminder completed."

    })


# =========================================================
# ACTIVITIES API
# =========================================================

@app.get("/api/activities")
@login_required
def api_get_activities():

    user_id = session["user_id"]

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
        WHERE user_id = ?
        ORDER BY scheduled_time
        """,
        (user_id,)
    ).fetchall()

    db.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


@app.post("/api/activities")
@login_required
def api_add_activity():

    user_id = session["user_id"]

    data = request.get_json(
        silent=True
    ) or {}


    activity_name = str(
        data.get(
            "activity_name",
            ""
        )
    ).strip()


    duration = str(
        data.get(
            "duration",
            ""
        )
    ).strip()


    scheduled_time = str(
        data.get(
            "scheduled_time",
            ""
        )
    ).strip()


    if not activity_name or not scheduled_time:

        return jsonify({

            "success": False,

            "message":
                "Activity name and time are required."

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
            user_id,
            activity_name,
            duration,
            scheduled_time
        )
    )

    db.commit()

    db.close()


    return jsonify({

        "success": True,

        "message":
            "Activity added successfully."

    })


@app.post(
    "/api/activities/<int:activity_id>/complete"
)
@login_required
def api_complete_activity(activity_id):

    user_id = session["user_id"]

    db = get_db()

    db.execute(
        """
        UPDATE activities
        SET completed = 1
        WHERE id = ?
        AND user_id = ?
        """,
        (
            activity_id,
            user_id
        )
    )

    db.commit()

    db.close()


    return jsonify({

        "success": True,

        "message":
            "Activity completed."

    })


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )
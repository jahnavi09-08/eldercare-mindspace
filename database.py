import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database", "dementia_games.db")


def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    db = get_db()

    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS game_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            game_name TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            accuracy REAL DEFAULT 0,
            time_taken INTEGER DEFAULT 0,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            reminder_time TEXT NOT NULL,
            type TEXT DEFAULT 'Wellness',
            completed INTEGER DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            activity_name TEXT NOT NULL,
            duration INTEGER DEFAULT 5,
            scheduled_time TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        """
    )

    # Demo user
    user = db.execute("SELECT id FROM users WHERE id = 1").fetchone()
    if not user:
        db.execute(
            "INSERT INTO users (id, name, age) VALUES (1, ?, ?)",
            ("Ravi", 72),
        )

    # Demo reminders
    reminder_count = db.execute(
        "SELECT COUNT(*) AS count FROM reminders WHERE user_id = 1"
    ).fetchone()["count"]

    if reminder_count == 0:
        db.executemany(
            """
            INSERT INTO reminders
            (user_id, title, description, reminder_time, type, completed)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            [
                (1, "Take medicine", "Evening medicine", "20:00", "Health", 0),
                (1, "Evening Walk", "A gentle 15 minute walk", "18:00", "Activity", 0),
                (1, "Drink Water", "Have a glass of water", "16:00", "Wellness", 1),
                (1, "Brain Exercise", "Play one memory game", "19:00", "Brain", 0),
            ],
        )

    # Demo activities
    activity_count = db.execute(
        "SELECT COUNT(*) AS count FROM activities WHERE user_id = 1"
    ).fetchone()["count"]

    if activity_count == 0:
        db.executemany(
            """
            INSERT INTO activities
            (user_id, activity_name, duration, scheduled_time, completed)
            VALUES (?, ?, ?, ?, ?)
            """,
            [
                (1, "Morning Walk", 10, "08:00", 1),
                (1, "Gentle Stretching", 5, "11:00", 0),
                (1, "Evening Walk", 15, "18:00", 0),
            ],
        )

    db.commit()
    db.close()

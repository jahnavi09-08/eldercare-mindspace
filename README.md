# ElderCare MindSpace

A senior-friendly cognitive games, reminders, activities, and progress-tracking MVP for the Smart India Hackathon.

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python + Flask
- Database: SQLite
- No external API or ML model is required for the first MVP.

## Run the project

### 1. Open a terminal in this folder

```bash
cd eldercare-mindspace
```

### 2. Install Flask

```bash
pip install -r requirements.txt
```

### 3. Start the server

```bash
python app.py
```

### 4. Open in the browser

http://127.0.0.1:5000

The SQLite database is created automatically inside `database/dementia_games.db`.

## Current MVP

- Home dashboard
- Games page
- Five game types
- Easy / Medium / Hard controls
- Reminders page
- Activities page
- Progress page
- Profile page
- Flask REST APIs
- SQLite storage

Next step: implement the complete game logic and adaptive difficulty.

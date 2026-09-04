const GAME_CONFIG = {
    sequence: {
        title: "Sequence Memory",
        description: "Remember the highlighted blocks and repeat the same sequence.",
    },
    picture: {
        title: "Remember the Picture",
        description: "Look carefully, remember the objects, then choose what you saw.",
    },
    objects: {
        title: "Object Matching",
        description: "Match everyday objects that naturally belong together.",
    },
    routine: {
        title: "Daily Routine Recall",
        description: "Remember a simple daily routine and answer a question about it.",
    },
    words: {
        title: "Word Recall",
        description: "Remember familiar words and identify them after they disappear.",
    }
};

const DIFFICULTY = {
    easy: { items: 4, displayTime: 5000 },
    medium: { items: 8, displayTime: 4000 },
    hard: { items: 20, displayTime: 3000 }
};

let currentDifficulty = "easy";

const gameTitle = document.getElementById("gameTitle");
const gameDescription = document.getElementById("gameDescription");
const gameArea = document.getElementById("gameArea");
const gameMessage = document.getElementById("gameMessage");
const startButton = document.getElementById("startGameButton");

const config = GAME_CONFIG[window.CURRENT_GAME] || GAME_CONFIG.sequence;

gameTitle.textContent = config.title;
gameDescription.textContent = config.description;

document.querySelectorAll(".difficulty-button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".difficulty-button").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        currentDifficulty = button.dataset.difficulty;

        resetGame();
    });
});

startButton.addEventListener("click", startGame);

function resetGame() {
    gameMessage.textContent = "";
    gameArea.innerHTML = `
        <div class="start-card">
            <div class="big-game-icon">🧠</div>
            <h2>Ready?</h2>
            <p>${capitalize(currentDifficulty)} difficulty selected.</p>
            <button id="startGameButton" class="primary-button">Start Game</button>
        </div>
    `;

    document.getElementById("startGameButton").addEventListener("click", startGame);
}

function startGame() {
    gameMessage.textContent = "";
    const handlers = {
        sequence: playSequenceGame,
        picture: playPictureGame,
        objects: playObjectGame,
        routine: playRoutineGame,
        words: playWordGame
    };

    handlers[window.CURRENT_GAME]();
}

function randomItems(items, count) {
    return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ---------- Sequence Memory ---------- */

function playSequenceGame() {
    const count = DIFFICULTY[currentDifficulty].items;
    const length = currentDifficulty === "hard" ? 20 : count;
    const colors = ["blue", "green", "yellow", "red"];
    const sequence = Array.from({ length }, () =>
        Math.floor(Math.random() * colors.length)
    );

    gameArea.innerHTML = `
        <div style="width:100%;text-align:center">
            <h2 id="instruction">Watch carefully 👀</h2>
            <div id="sequenceBoard" class="sequence-board"></div>
        </div>
    `;

    const board = document.getElementById("sequenceBoard");

    for (let i = 0; i < 4; i++) {
        const block = document.createElement("button");
        block.className = `memory-block block-${i}`;
        block.dataset.index = i;
        board.appendChild(block);
    }

    let position = 0;

    const showNext = () => {
        if (position >= sequence.length) {
            document.getElementById("instruction").textContent =
                "Now repeat the sequence";
            enableSequenceInput(sequence, colors);
            return;
        }

        const block = board.children[sequence[position]];
        block.classList.add("lit");

        setTimeout(() => {
            block.classList.remove("lit");
            position++;
            setTimeout(showNext, 250);
        }, currentDifficulty === "hard" ? 350 : 550);
    };

    setTimeout(showNext, 700);
}

function enableSequenceInput(sequence, colors) {
    const board = document.getElementById("sequenceBoard");
    let userSequence = [];
    const startTime = Date.now();

    [...board.children].forEach(block => {
        block.addEventListener("click", () => {
            const index = Number(block.dataset.index);
            userSequence.push(index);

            block.classList.add("lit");
            setTimeout(() => block.classList.remove("lit"), 150);

            const position = userSequence.length - 1;

            if (userSequence[position] !== sequence[position]) {
                finishGame(
                    "Not quite — that's okay! 🌿",
                    0,
                    sequence.length,
                    Date.now() - startTime
                );
                return;
            }

            if (userSequence.length === sequence.length) {
                finishGame(
                    "Wonderful! You remembered the sequence. 🎉",
                    100,
                    sequence.length,
                    Date.now() - startTime
                );
            }
        });
    });
}

/* ---------- Picture Recall ---------- */

function playPictureGame() {
    const objects = ["🚲", "🍎", "🌸", "☕", "📖", "👓", "🔑", "🍌", "🌳", "🧢"];
    const count = currentDifficulty === "easy" ? 4 :
        currentDifficulty === "medium" ? 6 : 8;

    const selected = randomItems(objects, count);

    gameArea.innerHTML = `
        <div style="width:100%;text-align:center">
            <h2 id="pictureInstruction">Look carefully 👀</h2>
            <div class="picture-grid" id="pictureGrid">
                ${selected.map(item => `<div class="picture-item">${item}</div>`).join("")}
            </div>
        </div>
    `;

    setTimeout(() => {
        gameArea.innerHTML = `
            <div style="width:100%;text-align:center">
                <h2>Which objects did you see?</h2>
                <div class="choice-grid">
                    ${randomItems([...objects], Math.min(objects.length, count + 4))
                        .map(item => `<button class="choice-button" data-value="${item}">${item}</button>`)
                        .join("")}
                </div>
                <button id="submitChoices" class="primary-button" style="margin-top:20px">
                    Check Answer
                </button>
            </div>
        `;

        const selectedSet = new Set(selected);

        document.querySelectorAll(".choice-button").forEach(button => {
            button.addEventListener("click", () => {
                button.classList.toggle("selected");
            });
        });

        document.getElementById("submitChoices").addEventListener("click", () => {
            const choices = [...document.querySelectorAll(".choice-button.selected")]
                .map(button => button.dataset.value);

            const correct = choices.filter(item => selectedSet.has(item)).length;
            const wrong = choices.filter(item => !selectedSet.has(item)).length;
            const accuracy = Math.max(
                0,
                Math.round((correct - wrong * 0.5) / count * 100)
            );

            finishGame(
                `You remembered ${correct} of ${count}. 🌸`,
                accuracy,
                count,
                0
            );
        });
    }, DIFFICULTY[currentDifficulty].displayTime);
}

/* ---------- Object Matching ---------- */

function playObjectGame() {
    const pairs = [
        ["☕", "🍵"],
        ["🪥", "🦷"],
        ["🔑", "🚪"],
        ["🍽️", "🥄"],
        ["👟", "🧦"],
        ["📖", "👓"],
        ["✉️", "📮"],
        ["🛏️", "🛌"]
    ];

    const pair = pairs[Math.floor(Math.random() * pairs.length)];

    gameArea.innerHTML = `
        <div style="width:100%;text-align:center">
            <p class="eyebrow">FIND THE MATCH</p>
            <div class="match-target">${pair[0]}</div>
            <h2>Which item belongs with it?</h2>
            <div class="choice-grid">
                ${randomItems([pair[1], "🚲", "🌳", "🍎"], 4)
                    .map(item => `<button class="choice-button">${item}</button>`)
                    .join("")}
            </div>
        </div>
    `;

    document.querySelectorAll(".choice-button").forEach(button => {
        button.addEventListener("click", () => {
            const correct = button.textContent === pair[1];
            finishGame(
                correct ? "Excellent match! 🎉" : "Good try! Let's keep practicing. 🌿",
                correct ? 100 : 0,
                1,
                0
            );
        });
    });
}

/* ---------- Routine Recall ---------- */

function playRoutineGame() {
    const routines = [
        ["7:00 AM — Wake up", "7:30 AM — Breakfast", "8:00 AM — Take medicine", "9:00 AM — Morning walk"],
        ["8:00 AM — Breakfast", "10:00 AM — Read a book", "12:30 PM — Lunch", "2:00 PM — Rest"],
        ["6:30 AM — Wake up", "7:00 AM — Tea", "8:00 AM — Breakfast", "9:30 AM — Garden walk"]
    ];

    const routine = routines[Math.floor(Math.random() * routines.length)];

    gameArea.innerHTML = `
        <div style="width:100%;text-align:center">
            <h2>Remember this routine</h2>
            <div class="routine-list">
                ${routine.map(item => `<div>${item}</div>`).join("")}
            </div>
        </div>
    `;

    setTimeout(() => {
        const targetIndex = Math.min(2, routine.length - 1);
        const correct = routine[targetIndex].split("—")[1].trim();

        const choices = randomItems([
            correct,
            "Go to sleep",
            "Have dinner",
            "Watch television"
        ], 4);

        gameArea.innerHTML = `
            <div style="width:100%;text-align:center">
                <p class="eyebrow">MEMORY CHECK</p>
                <h2>What happened at ${routine[targetIndex].split("—")[0].trim()}?</h2>
                <div class="choice-grid">
                    ${choices.map(item => `<button class="choice-button">${item}</button>`).join("")}
                </div>
            </div>
        `;

        document.querySelectorAll(".choice-button").forEach(button => {
            button.addEventListener("click", () => {
                const isCorrect = button.textContent === correct;
                finishGame(
                    isCorrect ? "Great memory! 🌟" : "Nice try. Keep going! 🌿",
                    isCorrect ? 100 : 0,
                    1,
                    0
                );
            });
        });
    }, DIFFICULTY[currentDifficulty].displayTime);
}

/* ---------- Word Recall ---------- */

function playWordGame() {
    const words = [
        "APPLE", "CHAIR", "FLOWER", "BOOK",
        "GARDEN", "TEA", "BREAD", "SHOES",
        "CLOCK", "HOUSE", "RIVER", "MANGO"
    ];

    const count = currentDifficulty === "easy" ? 4 :
        currentDifficulty === "medium" ? 6 : 8;

    const selected = randomItems(words, count);

    gameArea.innerHTML = `
        <div style="width:100%;text-align:center">
            <h2>Remember these words</h2>
            <div class="word-grid">
                ${selected.map(word => `<div class="word-item">${word}</div>`).join("")}
            </div>
        </div>
    `;

    setTimeout(() => {
        const choices = randomItems([...new Set([
            ...selected,
            ...randomItems(words.filter(word => !selected.includes(word)), 4)
        ])], count + 4);

        gameArea.innerHTML = `
            <div style="width:100%;text-align:center">
                <h2>Which words did you remember?</h2>
                <div class="choice-grid word-choice-grid">
                    ${choices.map(word => `<button class="choice-button">${word}</button>`).join("")}
                </div>
                <button id="submitWords" class="primary-button" style="margin-top:20px">
                    Check Answer
                </button>
            </div>
        `;

        document.querySelectorAll(".choice-button").forEach(button => {
            button.addEventListener("click", () => {
                button.classList.toggle("selected");
            });
        });

        document.getElementById("submitWords").addEventListener("click", () => {
            const answers = [...document.querySelectorAll(".choice-button.selected")]
                .map(button => button.textContent);

            const correct = answers.filter(word => selected.includes(word)).length;
            const wrong = answers.filter(word => !selected.includes(word)).length;
            const accuracy = Math.max(
                0,
                Math.round((correct - wrong * 0.5) / count * 100)
            );

            finishGame(
                `You remembered ${correct} of ${count} words. 🧠`,
                accuracy,
                count,
                0
            );
        });
    }, DIFFICULTY[currentDifficulty].displayTime);
}

/* ---------- Save result ---------- */

async function finishGame(message, accuracy, total, timeTaken) {
    gameMessage.textContent = message;

    const score = Math.round(accuracy);

    await fetch("/api/game-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            game_name: config.title,
            difficulty: currentDifficulty,
            score,
            accuracy,
            time_taken: timeTaken
        })
    });

    gameArea.innerHTML = `
        <div class="start-card">
            <div class="big-game-icon">🌟</div>
            <h2>Well done!</h2>
            <p>Accuracy: <strong>${accuracy}%</strong></p>
            <button id="playAgain" class="primary-button">Play Again</button>
        </div>
    `;

    document.getElementById("playAgain").addEventListener("click", startGame);
}

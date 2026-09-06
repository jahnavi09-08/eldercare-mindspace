/* =========================================================
   MINDSPACE - DEMENTIA MEMORY GAMES
   Complete Game Engine
   ========================================================= */

const GAME_CONFIG = {
    sequence: {
        title: "Sequence Memory",
        description: "Remember the highlighted blocks and repeat the same sequence."
    },

    picture: {
        title: "Remember the Picture",
        description: "Look carefully, remember the objects, then choose what you saw."
    },

    objects: {
        title: "Object Matching",
        description: "Match everyday objects that naturally belong together."
    },

    routine: {
        title: "Daily Routine Recall",
        description: "Remember a simple daily routine and answer questions about it."
    },

    words: {
        title: "Word Recall",
        description: "Remember familiar words and identify them after they disappear."
    }
};


/* =========================================================
   DIFFICULTY
   ========================================================= */

const DIFFICULTY = {
    easy: {
        items: 4,
        displayTime: 6000
    },

    medium: {
        items: 6,
        displayTime: 5000
    },

    hard: {
        items: 8,
        displayTime: 4000
    }
};

/* =========================================================
   AI ADAPTIVE DIFFICULTY
   ========================================================= */

let currentDifficulty =
    localStorage.getItem(
        "mindspaceRecommendedDifficulty"
    ) || "easy";


/* Make sure the value is valid */

if (
    !["easy", "medium", "hard"].includes(
        currentDifficulty
    )
) {
    currentDifficulty = "easy";
}


/* =========================================================
   COMMON ELEMENTS
   ========================================================= */

const gameTitle = document.getElementById("gameTitle");
const gameDescription = document.getElementById("gameDescription");
const gameArea = document.getElementById("gameArea");
const gameMessage = document.getElementById("gameMessage");

const config =
    GAME_CONFIG[window.CURRENT_GAME] ||
    GAME_CONFIG.sequence;


/* =========================================================
   INITIALIZE
   ========================================================= */

if (gameTitle) {
    gameTitle.textContent = config.title;
}

if (gameDescription) {
    gameDescription.textContent = config.description;
}


/* =========================================================
   HELPERS
   ========================================================= */

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}


function randomItems(items, count) {
    return [...items]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}


function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   DIFFICULTY BUTTONS
   ========================================================= */

/* =========================================================
   DIFFICULTY BUTTONS + AI DEFAULT
   ========================================================= */

const difficultyButtons =
    document.querySelectorAll(".difficulty-button");


difficultyButtons.forEach(button => {

    // Automatically highlight AI recommendation
    if (
        button.dataset.difficulty ===
        currentDifficulty
    ) {
        button.classList.add("active");
    }

    button.addEventListener("click", () => {

        difficultyButtons.forEach(item =>
            item.classList.remove("active")
        );

        button.classList.add("active");

        currentDifficulty =
            button.dataset.difficulty;

        resetGame();
    });

});


/* =========================================================
   RESET
   ========================================================= */

function resetGame() {

    if (gameMessage) {
        gameMessage.textContent = "";
    }

    gameArea.innerHTML = `
        <div class="start-card">

            <div class="big-game-icon">
                🧠
            </div>

            <h2>Ready?</h2>

            <p>
                ${capitalize(currentDifficulty)}
                difficulty selected.
            </p>

            <button
                id="startGameButton"
                class="primary-button">
                Start Game
            </button>

        </div>
    `;

    document
        .getElementById("startGameButton")
        .addEventListener("click", startGame);
}


/* =========================================================
   START GAME
   ========================================================= */

const originalStartButton =
    document.getElementById("startGameButton");

if (originalStartButton) {
    originalStartButton.addEventListener("click", startGame);
}


function startGame() {

    if (gameMessage) {
        gameMessage.textContent = "";
    }

    const handlers = {
        sequence: playSequenceGame,
        picture: playPictureGame,
        objects: playObjectGame,
        routine: playRoutineGame,
        words: playWordGame
    };

    const selectedGame =
        handlers[window.CURRENT_GAME];

    if (selectedGame) {
        selectedGame();
    } else {
        console.error(
            "Unknown game:",
            window.CURRENT_GAME
        );
    }
}


/* =========================================================
   GAME 1
   SEQUENCE MEMORY
   ========================================================= */

function playSequenceGame() {

    /*
       IMPORTANT:
       These are actual colors, not CSS class names.
       This fixes the Medium/Hard invisible block problem.
    */

    const blockColors = [
        "#D9EBDD",
        "#CFE4D4",
        "#E5E0C8",
        "#DCE8E1",
        "#D8E1EE",
        "#E8D9D9",
        "#E2E0D5",
        "#D5E5E0"
    ];

    const settings = {

        easy: {
            blocks: 4,
            sequenceLength: 4,
            flashTime: 700,
            gapTime: 300
        },

        medium: {
            blocks: 8,
            sequenceLength: 8,
            flashTime: 550,
            gapTime: 250
        },

        hard: {
            blocks: 12,
            sequenceLength: 12,
            flashTime: 450,
            gapTime: 220
        }

    };

    const level =
        settings[currentDifficulty];


    /* -----------------------------------------------------
       Generate sequence
       ----------------------------------------------------- */

    const sequence = [];

    for (
        let i = 0;
        i < level.sequenceLength;
        i++
    ) {

        let next;

        do {
            next = Math.floor(
                Math.random() * level.blocks
            );
        }
        while (
            i > 0 &&
            next === sequence[i - 1]
        );

        sequence.push(next);
    }


    /* -----------------------------------------------------
       Create board
       ----------------------------------------------------- */

    gameArea.innerHTML = `

        <div
            style="
                width:100%;
                text-align:center;
            "
        >

            <p class="eyebrow">
                MEMORY CHALLENGE
            </p>

            <h2 id="instruction">
                Get ready 👀
            </h2>

            <p id="sequenceProgress">
                Watch carefully...
            </p>

            <div
                id="sequenceBoard"
                class="sequence-board"
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            ${level.blocks <= 4 ? 2 : 4},
                            minmax(0, 1fr)
                        );
                    gap:14px;
                    width:100%;
                    max-width:520px;
                    margin:25px auto;
                "
            >
            </div>

        </div>
    `;


    const board =
        document.getElementById("sequenceBoard");

    const instruction =
        document.getElementById("instruction");

    const progress =
        document.getElementById("sequenceProgress");


    /* -----------------------------------------------------
       Create visible blocks
       ----------------------------------------------------- */

    for (
        let i = 0;
        i < level.blocks;
        i++
    ) {

        const block =
            document.createElement("button");

        block.type = "button";

        block.className =
            "memory-block";

        block.dataset.index = i;

        block.setAttribute(
            "aria-label",
            `Memory block ${i + 1}`
        );


        /*
           Explicit styling.
           This makes sure blocks are visible even if
           game-extra.css has conflicting styles.
        */

        block.style.display = "block";
        block.style.width = "100%";
        block.style.height = "78px";
        block.style.minHeight = "78px";

        block.style.padding = "0";

        block.style.boxSizing = "border-box";

        block.style.border =
            "3px solid #B8C9BE";

        block.style.borderRadius =
            "16px";

        block.style.backgroundColor =
            blockColors[
                i % blockColors.length
            ];

        block.style.cursor = "pointer";

        block.style.appearance = "none";
        block.style.webkitAppearance = "none";

        block.style.transition =
            "background-color .18s ease, transform .18s ease, border-color .18s ease";


        board.appendChild(block);
    }


    /* -----------------------------------------------------
       Show sequence
       ----------------------------------------------------- */

    let position = 0;


    function showNext() {

        if (
            position >=
            sequence.length
        ) {

            instruction.textContent =
                "Now repeat the sequence 🧠";

            progress.textContent =
                `Tap ${sequence.length} blocks in the same order.`;

            enableSequenceInput(
                sequence,
                blockColors
            );

            return;
        }


        progress.textContent =
            `Remember ${position + 1} of ${sequence.length}`;


        const block =
            board.children[
                sequence[position]
            ];


        /* Flash */

        block.style.backgroundColor =
            "#4D765D";

        block.style.borderColor =
            "#385842";

        block.style.transform =
            "scale(1.04)";


        setTimeout(() => {

            block.style.backgroundColor =
                blockColors[
                    sequence[position] %
                    blockColors.length
                ];

            block.style.borderColor =
                "#B8C9BE";

            block.style.transform =
                "scale(1)";


            position++;

            setTimeout(
                showNext,
                level.gapTime
            );

        }, level.flashTime);
    }


    setTimeout(
        showNext,
        1000
    );
}


/* =========================================================
   SEQUENCE INPUT
   ========================================================= */

function enableSequenceInput(
    sequence,
    blockColors
) {

    const board =
        document.getElementById(
            "sequenceBoard"
        );

    const instruction =
        document.getElementById(
            "instruction"
        );

    const progress =
        document.getElementById(
            "sequenceProgress"
        );


    let userSequence = [];

    let finished = false;

    const startTime =
        Date.now();


    [...board.children].forEach(
        block => {

            block.addEventListener(
                "click",
                () => {

                    if (finished) {
                        return;
                    }


                    const index =
                        Number(
                            block.dataset.index
                        );


                    userSequence.push(
                        index
                    );


                    /* Small tap flash */

                    block.style.backgroundColor =
                        "#4D765D";

                    block.style.borderColor =
                        "#385842";

                    block.style.transform =
                        "scale(1.04)";


                    setTimeout(() => {

                        block.style.backgroundColor =
                            blockColors[
                                index %
                                blockColors.length
                            ];

                        block.style.borderColor =
                            "#B8C9BE";

                        block.style.transform =
                            "scale(1)";

                    }, 180);


                    const position =
                        userSequence.length - 1;


                    progress.textContent =
                        `${userSequence.length} of ${sequence.length}`;


                    /* -------------------------------------------------
                       Wrong answer
                       ------------------------------------------------- */

                    if (
                        userSequence[position] !==
                        sequence[position]
                    ) {

                        finished = true;

                        const correctSteps =
                            userSequence.length - 1;

                        const accuracy =
                            Math.max(
                                0,
                                Math.round(
                                    (
                                        correctSteps /
                                        sequence.length
                                    ) * 100
                                )
                            );


                        finishGame(
                            `You remembered ${correctSteps} of ${sequence.length}. 🌿`,
                            accuracy,
                            sequence.length,
                            Date.now() - startTime
                        );

                        return;
                    }


                    /* -------------------------------------------------
                       Complete
                       ------------------------------------------------- */

                    if (
                        userSequence.length ===
                        sequence.length
                    ) {

                        finished = true;

                        finishGame(
                            "Wonderful! You remembered the whole sequence! 🎉",
                            100,
                            sequence.length,
                            Date.now() - startTime
                        );
                    }

                }
            );

        }
    );


    instruction.textContent =
        "Your turn — remember the order!";
}


/* =========================================================
   GAME 2
   REMEMBER THE PICTURE
   ========================================================= */

function playPictureGame() {

    const objects = [
        "🚲",
        "🍎",
        "🌸",
        "☕",
        "📖",
        "👓",
        "🔑",
        "🍌",
        "🌳",
        "🧢",
        "🍞",
        "⏰",
        "🏠",
        "🌷",
        "🪴",
        "🧴",
        "🎩",
        "🍊",
        "🧺",
        "🕯️"
    ];


    const count =
        currentDifficulty === "easy"
            ? 4
            : currentDifficulty === "medium"
                ? 6
                : 8;


    const displayTime =
        currentDifficulty === "easy"
            ? 6000
            : currentDifficulty === "medium"
                ? 5000
                : 4000;


    const selected =
        randomItems(
            objects,
            count
        );


    const selectedSet =
        new Set(selected);


    /* -----------------------------------------------------
       Display
       ----------------------------------------------------- */

    gameArea.innerHTML = `

        <div
            style="
                width:100%;
                text-align:center;
            "
        >

            <p class="eyebrow">
                MEMORY CHALLENGE
            </p>

            <h2>
                Look carefully 👀
            </h2>

            <p>
                Remember these objects.
                Take your time.
            </p>

            <div
                class="picture-grid"
                id="pictureGrid"
            >

                ${selected.map(item => `

                    <div
                        class="picture-item"
                        aria-label="Object ${escapeHTML(item)}"
                    >
                        ${item}
                    </div>

                `).join("")}

            </div>

            <p
                id="pictureCountdown"
                style="
                    margin-top:20px;
                    font-weight:bold;
                "
            >
                Remember ${count} objects
            </p>

        </div>
    `;


    let secondsLeft =
        Math.ceil(
            displayTime / 1000
        );


    const countdown =
        document.getElementById(
            "pictureCountdown"
        );


    const timer =
        setInterval(() => {

            secondsLeft--;

            if (secondsLeft > 0) {

                countdown.textContent =
                    `Remember... ${secondsLeft}`;
            }

        }, 1000);


    setTimeout(() => {

        clearInterval(timer);


        const distractors =
            randomItems(
                objects.filter(
                    item =>
                        !selectedSet.has(item)
                ),
                6
            );


        const choices =
            randomItems(
                [
                    ...selected,
                    ...distractors
                ],
                count + 4
            );


        gameArea.innerHTML = `

            <div
                style="
                    width:100%;
                    text-align:center;
                "
            >

                <p class="eyebrow">
                    MEMORY CHECK
                </p>

                <h2>
                    Which objects did you see?
                </h2>

                <p id="selectionCount">
                    0 selected
                </p>

                <div
                    class="choice-grid"
                    id="pictureChoices"
                >

                    ${choices.map(item => `

                        <button
                            type="button"
                            class="choice-button"
                            data-value="${escapeHTML(item)}"
                        >
                            ${item}
                        </button>

                    `).join("")}

                </div>

                <button
                    id="submitPicture"
                    class="primary-button"
                    style="margin-top:20px"
                >
                    Check Answer
                </button>

            </div>
        `;


        const selectionCount =
            document.getElementById(
                "selectionCount"
            );


        document
            .querySelectorAll(".choice-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        button.classList.toggle(
                            "selected"
                        );


                        const total =
                            document.querySelectorAll(
                                ".choice-button.selected"
                            ).length;


                        selectionCount.textContent =
                            `${total} selected`;
                    }
                );

            });


        document
            .getElementById("submitPicture")
            .addEventListener(
                "click",
                () => {

                    const answers =
                        [
                            ...document.querySelectorAll(
                                ".choice-button.selected"
                            )
                        ].map(
                            button =>
                                button.dataset.value
                        );


                    const correct =
                        answers.filter(
                            item =>
                                selectedSet.has(item)
                        ).length;


                    const wrong =
                        answers.filter(
                            item =>
                                !selectedSet.has(item)
                        ).length;


                    const accuracy =
                        Math.max(
                            0,
                            Math.round(
                                (
                                    correct -
                                    wrong * 0.5
                                ) /
                                count *
                                100
                            )
                        );


                    finishGame(
                        `You remembered ${correct} of ${count}. 🌸`,
                        accuracy,
                        count,
                        displayTime
                    );
                }
            );

    }, displayTime);
}


/* =========================================================
   GAME 3
   OBJECT MATCHING
   ========================================================= */

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


    const pair =
        pairs[
            Math.floor(
                Math.random() *
                pairs.length
            )
        ];


    const choices =
        randomItems(
            [
                pair[1],
                "🚲",
                "🌳",
                "🍎",
                "🏠",
                "🌸"
            ],
            4
        );


    gameArea.innerHTML = `

        <div
            style="
                width:100%;
                text-align:center;
            "
        >

            <p class="eyebrow">
                FIND THE MATCH
            </p>

            <div
                class="match-target"
                style="
                    font-size:80px;
                    margin:20px;
                "
            >
                ${pair[0]}
            </div>

            <h2>
                Which item belongs with it?
            </h2>

            <div class="choice-grid">

                ${choices.map(item => `

                    <button
                        type="button"
                        class="choice-button"
                    >
                        ${item}
                    </button>

                `).join("")}

            </div>

        </div>
    `;


    document
        .querySelectorAll(".choice-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const correct =
                        button.textContent.trim() ===
                        pair[1];


                    finishGame(

                        correct
                            ? "Excellent match! 🎉"
                            : "Good try! Let's keep practicing. 🌿",

                        correct ? 100 : 0,

                        1,

                        0
                    );
                }
            );

        });
}


/* =========================================================
   GAME 4
   DAILY ROUTINE RECALL
   ========================================================= */

function playRoutineGame() {

    const routines = [

        [
            "7:00 AM — Wake up",
            "7:30 AM — Breakfast",
            "8:00 AM — Take medicine",
            "9:00 AM — Morning walk"
        ],

        [
            "8:00 AM — Breakfast",
            "10:00 AM — Read a book",
            "12:30 PM — Lunch",
            "2:00 PM — Rest"
        ],

        [
            "6:30 AM — Wake up",
            "7:00 AM — Tea",
            "8:00 AM — Breakfast",
            "9:30 AM — Garden walk"
        ]

    ];


    const routine =
        routines[
            Math.floor(
                Math.random() *
                routines.length
            )
        ];


    gameArea.innerHTML = `

        <div
            style="
                width:100%;
                text-align:center;
            "
        >

            <p class="eyebrow">
                DAILY ROUTINE
            </p>

            <h2>
                Remember this routine 🕒
            </h2>

            <div
                class="routine-list"
                style="
                    max-width:600px;
                    margin:20px auto;
                "
            >

                ${routine.map(item => `

                    <div
                        style="
                            padding:15px;
                            margin:8px;
                            border-radius:14px;
                            background:#E8F0E9;
                            font-size:20px;
                            font-weight:700;
                        "
                    >
                        ${escapeHTML(item)}
                    </div>

                `).join("")}

            </div>

            <p id="routineCountdown">
                Remember...
            </p>

        </div>
    `;


    const displayTime =
        currentDifficulty === "easy"
            ? 6000
            : currentDifficulty === "medium"
                ? 5000
                : 4000;


    setTimeout(() => {

        const targetIndex =
            Math.min(
                2,
                routine.length - 1
            );


        const correct =
            routine[targetIndex]
                .split("—")[1]
                .trim();


        const choices =
            randomItems(
                [
                    correct,
                    "Go to sleep",
                    "Have dinner",
                    "Watch television",
                    "Go shopping"
                ],
                4
            );


        gameArea.innerHTML = `

            <div
                style="
                    width:100%;
                    text-align:center;
                "
            >

                <p class="eyebrow">
                    MEMORY CHECK
                </p>

                <h2>
                    What happened at
                    ${escapeHTML(
                        routine[targetIndex]
                            .split("—")[0]
                            .trim()
                    )}?
                </h2>

                <div class="choice-grid">

                    ${choices.map(item => `

                        <button
                            type="button"
                            class="choice-button"
                        >
                            ${escapeHTML(item)}
                        </button>

                    `).join("")}

                </div>

            </div>
        `;


        document
            .querySelectorAll(".choice-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const isCorrect =
                            button.textContent.trim() ===
                            correct;


                        finishGame(

                            isCorrect
                                ? "Great memory! 🌟"
                                : "Nice try. Keep going! 🌿",

                            isCorrect ? 100 : 0,

                            1,

                            displayTime
                        );

                    }
                );

            });

    }, displayTime);
}


/* =========================================================
   GAME 5
   WORD RECALL
   ========================================================= */

function playWordGame() {

    const words = [

        "APPLE",
        "CHAIR",
        "FLOWER",
        "BOOK",
        "GARDEN",
        "TEA",
        "BREAD",
        "SHOES",
        "CLOCK",
        "HOUSE",
        "RIVER",
        "MANGO",
        "TABLE",
        "FAMILY",
        "SUN",
        "BIRD"

    ];


    const count =
        currentDifficulty === "easy"
            ? 4
            : currentDifficulty === "medium"
                ? 6
                : 8;


    const displayTime =
        currentDifficulty === "easy"
            ? 6000
            : currentDifficulty === "medium"
                ? 5000
                : 4000;


    const selected =
        randomItems(
            words,
            count
        );


    gameArea.innerHTML = `

        <div
            style="
                width:100%;
                text-align:center;
            "
        >

            <p class="eyebrow">
                WORD MEMORY
            </p>

            <h2>
                Remember these words 🧠
            </h2>

            <div class="word-grid">

                ${selected.map(word => `

                    <div class="word-item">
                        ${word}
                    </div>

                `).join("")}

            </div>

            <p>
                Remember ${count} words...
            </p>

        </div>
    `;


    setTimeout(() => {

        const extraWords =
            words.filter(
                word =>
                    !selected.includes(word)
            );


        const choices =
            randomItems(
                [
                    ...selected,
                    ...randomItems(
                        extraWords,
                        4
                    )
                ],
                count + 4
            );


        gameArea.innerHTML = `

            <div
                style="
                    width:100%;
                    text-align:center;
                "
            >

                <p class="eyebrow">
                    MEMORY CHECK
                </p>

                <h2>
                    Which words did you remember?
                </h2>

                <p id="wordSelectionCount">
                    0 selected
                </p>

                <div
                    class="choice-grid word-choice-grid"
                >

                    ${choices.map(word => `

                        <button
                            type="button"
                            class="choice-button"
                            data-word="${escapeHTML(word)}"
                        >
                            ${escapeHTML(word)}
                        </button>

                    `).join("")}

                </div>

                <button
                    id="submitWords"
                    class="primary-button"
                    style="margin-top:20px"
                >
                    Check Answer
                </button>

            </div>
        `;


        const counter =
            document.getElementById(
                "wordSelectionCount"
            );


        document
            .querySelectorAll(".choice-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        button.classList.toggle(
                            "selected"
                        );


                        const total =
                            document.querySelectorAll(
                                ".choice-button.selected"
                            ).length;


                        counter.textContent =
                            `${total} selected`;
                    }
                );

            });


        document
            .getElementById("submitWords")
            .addEventListener(
                "click",
                () => {

                    const answers =
                        [
                            ...document.querySelectorAll(
                                ".choice-button.selected"
                            )
                        ].map(
                            button =>
                                button.dataset.word
                        );


                    const correct =
                        answers.filter(
                            word =>
                                selected.includes(word)
                        ).length;


                    const wrong =
                        answers.filter(
                            word =>
                                !selected.includes(word)
                        ).length;


                    const accuracy =
                        Math.max(
                            0,
                            Math.round(
                                (
                                    correct -
                                    wrong * 0.5
                                ) /
                                count *
                                100
                            )
                        );


                    finishGame(

                        `You remembered ${correct} of ${count} words. 🧠`,

                        accuracy,

                        count,

                        displayTime
                    );

                }
            );

    }, displayTime);
}


/* =========================================================
   SAVE GAME RESULT
   ========================================================= */

async function finishGame(
    message,
    accuracy,
    total,
    timeTaken
) {

    if (gameMessage) {
        gameMessage.textContent =
            message;
    }


    accuracy =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(accuracy)
            )
        );


    const score = accuracy;


    /* -----------------------------------------------------
       Save to Flask + SQLite
       ----------------------------------------------------- */

    try {

        const response =
            await fetch(
                "/api/game-result",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        game_name:
                            config.title,

                        difficulty:
                            currentDifficulty,

                        score:
                            score,

                        accuracy:
                            accuracy,

                        time_taken:
                            Math.round(
                                timeTaken / 1000
                            )

                    })
                }
            );


        if (!response.ok) {
            console.error(
                "Could not save game result."
            );
        }

    }
    catch (error) {

        console.error(
            "Game result error:",
            error
        );

    }


    /* -----------------------------------------------------
       Result screen
       ----------------------------------------------------- */

    gameArea.innerHTML = `

        <div class="start-card">

            <div class="big-game-icon">
                🌟
            </div>

            <h2>
                Well done!
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <p>
                Accuracy:
                <strong>
                    ${accuracy}%
                </strong>
            </p>

            <button
                id="playAgain"
                class="primary-button"
            >
                Play Again
            </button>

        </div>
    `;


    document
        .getElementById("playAgain")
        .addEventListener(
            "click",
            startGame
        );
}
/* =========================================================
   MINDSPACE - DEMENTIA MEMORY GAMES
   Complete Game Engine
   ========================================================= */


/* =========================================================
   GAME CONFIGURATION
   ========================================================= */

const GAME_CONFIG = {

    sequence: {
        title: "Sequence Memory",
        description:
            "Remember the highlighted blocks and repeat the same sequence."
    },

    picture: {
        title: "Remember the Picture",
        description:
            "Look carefully, remember the objects, then choose what you saw."
    },

    objects: {
        title: "Object Matching",
        description:
            "Match everyday objects that naturally belong together."
    },

    routine: {
        title: "Daily Routine Recall",
        description:
            "Remember a simple daily routine and answer questions about it."
    },

    words: {
        title: "Word Recall",
        description:
            "Remember familiar words and identify them after they disappear."
    }

};


/* =========================================================
   GENERAL DIFFICULTY SETTINGS
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


let currentDifficulty = "easy";


/* =========================================================
   COMMON ELEMENTS
   ========================================================= */

const gameTitle =
    document.getElementById("gameTitle");

const gameDescription =
    document.getElementById("gameDescription");

const gameArea =
    document.getElementById("gameArea");

const gameMessage =
    document.getElementById("gameMessage");

const startButton =
    document.getElementById("startGameButton");


const config =
    GAME_CONFIG[window.CURRENT_GAME] ||
    GAME_CONFIG.sequence;


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

if (gameTitle) {
    gameTitle.textContent = config.title;
}

if (gameDescription) {
    gameDescription.textContent =
        config.description;
}


/* =========================================================
   DIFFICULTY BUTTONS
   ========================================================= */

document
    .querySelectorAll(".difficulty-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".difficulty-button"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                button.classList.add("active");


                currentDifficulty =
                    button.dataset.difficulty;


                resetGame();

            }
        );

    });


/* =========================================================
   INITIAL START BUTTON
   ========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startGame
    );

}


/* =========================================================
   RESET GAME
   ========================================================= */

function resetGame() {

    gameMessage.textContent = "";


    gameArea.innerHTML = `

        <div class="start-card">

            <div class="big-game-icon">
                🧠
            </div>

            <h2>
                Ready?
            </h2>

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
        .addEventListener(
            "click",
            startGame
        );

}


/* =========================================================
   START GAME
   ========================================================= */

function startGame() {

    gameMessage.textContent = "";


    const handlers = {

        sequence:
            playSequenceGame,

        picture:
            playPictureGame,

        objects:
            playObjectGame,

        routine:
            playRoutineGame,

        words:
            playWordGame

    };


    const selectedGame =
        handlers[window.CURRENT_GAME];


    if (selectedGame) {

        selectedGame();

    }

}


/* =========================================================
   RANDOM ITEMS
   ========================================================= */

function randomItems(items, count) {

    return [...items]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

}


/* =========================================================
   RANDOM ITEM
   ========================================================= */

function randomItem(items) {

    return items[
        Math.floor(
            Math.random() * items.length
        )
    ];

}


/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   SAFE HTML TEXT
   ========================================================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GAME 1
   SEQUENCE MEMORY
   ========================================================= */

function playSequenceGame() {


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

            flashTime: 500,

            gapTime: 220

        },

        hard: {

            blocks: 20,

            sequenceLength: 20,

            flashTime: 350,

            gapTime: 150

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

            next =
                Math.floor(
                    Math.random() *
                    level.blocks
                );

        } while (

            i > 0 &&
            next === sequence[i - 1]

        );


        sequence.push(next);

    }


    /* -----------------------------------------------------
       Game screen
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
                        1fr
                    );

                    gap:12px;

                    max-width:520px;

                    margin:25px auto;
                "
            >
            </div>

        </div>

    `;


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


    /* -----------------------------------------------------
       Create blocks
       ----------------------------------------------------- */

    for (
        let i = 0;
        i < level.blocks;
        i++
    ) {

        const block =
            document.createElement("button");


        block.className =
            `memory-block block-${i}`;


        block.dataset.index =
            i;


        block.setAttribute(
            "aria-label",
            `Memory block ${i + 1}`
        );


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
                sequence
            );


            return;

        }


        progress.textContent =
            `Remember ${position + 1} of ${sequence.length}`;


        const block =
            board.children[
                sequence[position]
            ];


        block.classList.add("lit");


        setTimeout(
            () => {

                block.classList.remove(
                    "lit"
                );


                position++;


                setTimeout(
                    showNext,
                    level.gapTime
                );

            },
            level.flashTime
        );

    }


    setTimeout(
        showNext,
        1000
    );

}


/* =========================================================
   SEQUENCE INPUT
   ========================================================= */

function enableSequenceInput(sequence) {


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


    const startTime =
        Date.now();


    let finished = false;


    [...board.children]
        .forEach(block => {


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


                    block.classList.add(
                        "lit"
                    );


                    setTimeout(
                        () => {

                            block.classList.remove(
                                "lit"
                            );

                        },
                        180
                    );


                    const position =
                        userSequence.length - 1;


                    progress.textContent =
                        `${userSequence.length} of ${sequence.length}`;


                    /* -------------------------------------
                       Wrong answer
                       ------------------------------------- */

                    if (
                        userSequence[position] !==
                        sequence[position]
                    ) {


                        finished = true;


                        const correctSteps =
                            userSequence.length - 1;


                        const accuracy =
                            Math.round(
                                (
                                    correctSteps /
                                    sequence.length
                                ) * 100
                            );


                        finishGame(

                            `You remembered ${correctSteps} of ${sequence.length}. 🌿`,

                            accuracy,

                            sequence.length,

                            Date.now() - startTime

                        );


                        return;

                    }


                    /* -------------------------------------
                       Complete
                       ------------------------------------- */

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

        });


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
       Show objects
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

                ${
                    selected
                        .map(
                            item => `

                                <div
                                    class="picture-item"
                                    aria-label="Object ${item}"
                                >
                                    ${item}
                                </div>

                            `
                        )
                        .join("")
                }

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


    const countdownTimer =
        setInterval(
            () => {


                secondsLeft--;


                if (
                    secondsLeft > 0
                ) {

                    countdown.textContent =
                        `Remember... ${secondsLeft}`;

                }

            },
            1000
        );


    /* -----------------------------------------------------
       Answer screen
       ----------------------------------------------------- */

    setTimeout(
        () => {


            clearInterval(
                countdownTimer
            );


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

                        ${
                            choices
                                .map(
                                    item => `

                                        <button
                                            class="choice-button"
                                            data-value="${escapeHTML(item)}"
                                        >
                                            ${item}
                                        </button>

                                    `
                                )
                                .join("")
                        }

                    </div>


                    <button
                        id="submitChoices"
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


            const answerStart =
                Date.now();


            document
                .querySelectorAll(
                    ".choice-button"
                )
                .forEach(button => {


                    button.addEventListener(
                        "click",
                        () => {


                            button.classList.toggle(
                                "selected"
                            );


                            const selectedCount =
                                document
                                    .querySelectorAll(
                                        ".choice-button.selected"
                                    )
                                    .length;


                            selectionCount.textContent =
                                `${selectedCount} selected`;

                        }
                    );

                });


            document
                .getElementById(
                    "submitChoices"
                )
                .addEventListener(
                    "click",
                    () => {


                        const chosen =
                            [
                                ...document
                                    .querySelectorAll(
                                        ".choice-button.selected"
                                    )
                            ]
                            .map(
                                button =>
                                    button.dataset.value
                            );


                        if (
                            chosen.length === 0
                        ) {

                            selectionCount.textContent =
                                "Please select at least one object.";

                            return;

                        }


                        const correct =
                            chosen.filter(
                                item =>
                                    selectedSet.has(item)
                            ).length;


                        const wrong =
                            chosen.filter(
                                item =>
                                    !selectedSet.has(item)
                            ).length;


                        const rawScore =
                            correct -
                            wrong * 0.5;


                        const accuracy =
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    Math.round(
                                        (
                                            rawScore /
                                            count
                                        ) * 100
                                    )
                                )
                            );


                        let message;


                        if (
                            correct === count &&
                            wrong === 0
                        ) {

                            message =
                                "Amazing! You remembered everything! 🎉";

                        } else if (
                            accuracy >= 75
                        ) {

                            message =
                                `Excellent! You remembered ${correct} of ${count}. 🌟`;

                        } else if (
                            accuracy >= 50
                        ) {

                            message =
                                `Good effort! You remembered ${correct} of ${count}. 🌿`;

                        } else {

                            message =
                                `Nice try! You remembered ${correct} of ${count}. Keep practicing. 💚`;

                        }


                        finishGame(

                            message,

                            accuracy,

                            count,

                            Date.now() - answerStart

                        );

                    }
                );


        },
        displayTime
    );

}


/* =========================================================
   GAME 3
   OBJECT MATCHING
   ========================================================= */

function playObjectGame() {


    const pairs = [

        {
            item: "☕",
            matches: ["🍵", "🥄", "🫖"],
            name: "Tea time"
        },

        {
            item: "🪥",
            matches: ["🦷", "🧴", "🧼"],
            name: "Getting ready"
        },

        {
            item: "🔑",
            matches: ["🚪", "🏠", "🔒"],
            name: "Going home"
        },

        {
            item: "👟",
            matches: ["🧦", "👕", "🎒"],
            name: "Getting dressed"
        },

        {
            item: "📖",
            matches: ["👓", "🪑", "💡"],
            name: "Reading"
        },

        {
            item: "🍽️",
            matches: ["🥄", "🍴", "🥣"],
            name: "Mealtime"
        },

        {
            item: "🌱",
            matches: ["🌳", "🪴", "🌷"],
            name: "Gardening"
        },

        {
            item: "🛏️",
            matches: ["🛌", "🛋️", "🛏️"],
            name: "Resting"

        }

    ];


    const rounds =
        currentDifficulty === "easy"
            ? 1
            : currentDifficulty === "medium"
                ? 2
                : 3;


    let round = 0;

    let score = 0;

    let roundStartTime;


    /* -----------------------------------------------------
       Start matching round
       ----------------------------------------------------- */

    function startRound() {


        if (
            round >= rounds
        ) {

            const accuracy =
                Math.round(
                    (score / rounds) * 100
                );


            finishGame(

                `You matched ${score} of ${rounds} correctly! 🔗`,

                accuracy,

                rounds,

                Date.now() - roundStartTime

            );


            return;

        }


        round++;


        const pair =
            randomItem(pairs);


        const correct =
            randomItem(pair.matches);


        const wrongOptions =
            randomItems(
                pairs
                    .flatMap(
                        p => p.matches
                    )
                    .filter(
                        item =>
                            item !== correct
                    ),
                3
            );


        const choices =
            randomItems(
                [
                    correct,
                    ...wrongOptions
                ],
                4
            );


        roundStartTime =
            Date.now();


        gameArea.innerHTML = `

            <div
                style="
                    width:100%;
                    text-align:center;
                "
            >

                <p class="eyebrow">
                    MATCHING • ROUND ${round} OF ${rounds}
                </p>


                <div
                    class="match-target"
                    style="
                        font-size:80px;
                        margin:20px;
                    "
                >
                    ${pair.item}
                </div>


                <h2>
                    Which item belongs with it?
                </h2>


                <div
                    class="choice-grid"
                >

                    ${
                        choices
                            .map(
                                item => `

                                    <button
                                        class="choice-button"
                                        data-answer="${escapeHTML(item)}"
                                    >
                                        ${item}
                                    </button>

                                `
                            )
                            .join("")
                    }

                </div>

            </div>

        `;


        document
            .querySelectorAll(
                ".choice-button"
            )
            .forEach(button => {


                button.addEventListener(
                    "click",
                    () => {


                        const answer =
                            button.dataset.answer;


                        if (
                            answer === correct
                        ) {

                            score++;


                            gameMessage.textContent =
                                "Excellent match! 🎉";

                        } else {

                            gameMessage.textContent =
                                "Good try! Let's keep practicing. 🌿";

                        }


                        setTimeout(
                            startRound,
                            500
                        );

                    }
                );

            });

    }


    startRound();

}


/* =========================================================
   GAME 4
   DAILY ROUTINE RECALL
   ========================================================= */

function playRoutineGame() {


    const routines = [

        {
            title: "A Peaceful Morning",

            items: [
                "7:00 AM — Wake up",
                "7:30 AM — Breakfast",
                "8:00 AM — Take medicine",
                "9:00 AM — Morning walk"
            ]

        },

        {
            title: "A Relaxing Day",

            items: [
                "8:00 AM — Breakfast",
                "10:00 AM — Read a book",
                "12:30 PM — Lunch",
                "2:00 PM — Rest"
            ]

        },

        {
            title: "Morning Garden Time",

            items: [
                "6:30 AM — Wake up",
                "7:00 AM — Tea",
                "8:00 AM — Breakfast",
                "9:30 AM — Garden walk"
            ]

        },

        {
            title: "An Afternoon Routine",

            items: [
                "9:00 AM — Breakfast",
                "11:00 AM — Talk with family",
                "1:00 PM — Lunch",
                "3:00 PM — Afternoon rest"
            ]

        },

        {
            title: "An Evening Routine",

            items: [
                "5:00 PM — Evening tea",
                "5:30 PM — Short walk",
                "7:00 PM — Dinner",
                "8:30 PM — Read a book"
            ]

        }

    ];


    const routine =
        randomItem(routines);


    const items =
        routine.items;


    const questionIndex =
        currentDifficulty === "easy"
            ? 1
            : currentDifficulty === "medium"
                ? 2
                : 3;


    const target =
        items[questionIndex];


    const time =
        target
            .split("—")[0]
            .trim();


    const correct =
        target
            .split("—")[1]
            .trim();


    /* -----------------------------------------------------
       Create distractors
       ----------------------------------------------------- */

    const possibleAnswers = [

        "Have breakfast",
        "Read a book",
        "Take medicine",
        "Go for a walk",
        "Have tea",
        "Eat lunch",
        "Take a rest",
        "Talk with family",
        "Go to sleep",
        "Have dinner",
        "Wake up",
        "Work in the garden"

    ];


    const distractors =
        randomItems(
            possibleAnswers.filter(
                item =>
                    item !== correct
            ),
            3
        );


    const choices =
        randomItems(
            [
                correct,
                ...distractors
            ],
            4
        );


    const displayTime =
        currentDifficulty === "easy"
            ? 7000
            : currentDifficulty === "medium"
                ? 5500
                : 4000;


    /* -----------------------------------------------------
       Show routine
       ----------------------------------------------------- */

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
                ${routine.title}
            </h2>


            <p>
                Remember this routine carefully.
            </p>


            <div class="routine-list">

                ${
                    items
                        .map(
                            item =>
                                `<div>${item}</div>`
                        )
                        .join("")
                }

            </div>


            <p
                id="routineCountdown"
                style="
                    font-weight:bold;
                    margin-top:20px;
                "
            >
                Remember the routine...
            </p>

        </div>

    `;


    let seconds =
        Math.ceil(
            displayTime / 1000
        );


    const countdown =
        document.getElementById(
            "routineCountdown"
        );


    const timer =
        setInterval(
            () => {

                seconds--;


                if (
                    seconds > 0
                ) {

                    countdown.textContent =
                        `Remember... ${seconds}`;

                }

            },
            1000
        );


    setTimeout(
        () => {


            clearInterval(timer);


            const answerStart =
                Date.now();


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
                        What happened at ${time}?
                    </h2>


                    <div class="choice-grid">

                        ${
                            choices
                                .map(
                                    item => `

                                        <button
                                            class="choice-button"
                                            data-answer="${escapeHTML(item)}"
                                        >
                                            ${item}
                                        </button>

                                    `
                                )
                                .join("")
                        }

                    </div>

                </div>

            `;


            document
                .querySelectorAll(
                    ".choice-button"
                )
                .forEach(button => {


                    button.addEventListener(
                        "click",
                        () => {


                            const isCorrect =
                                button.dataset.answer ===
                                correct;


                            finishGame(

                                isCorrect
                                    ? "Great memory! 🌟"
                                    : "Nice try! Keep practicing. 🌿",

                                isCorrect
                                    ? 100
                                    : 0,

                                1,

                                Date.now() -
                                answerStart

                            );

                        }
                    );

                });


        },
        displayTime
    );

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
        "MILK",
        "BIRD",
        "TREE",
        "SUN",
        "FAMILY",
        "PHONE",
        "WATER"

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


    const selectedSet =
        new Set(selected);


    /* -----------------------------------------------------
       Show words
       ----------------------------------------------------- */

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
                Remember these words
            </h2>


            <p>
                Read them slowly and remember as many as you can.
            </p>


            <div class="word-grid">

                ${
                    selected
                        .map(
                            word =>
                                `
                                <div class="word-item">
                                    ${word}
                                </div>
                                `
                        )
                        .join("")
                }

            </div>


            <p
                id="wordCountdown"
                style="
                    font-weight:bold;
                    margin-top:20px;
                "
            >
                Remember ${count} words
            </p>

        </div>

    `;


    let seconds =
        Math.ceil(
            displayTime / 1000
        );


    const countdown =
        document.getElementById(
            "wordCountdown"
        );


    const timer =
        setInterval(
            () => {


                seconds--;


                if (
                    seconds > 0
                ) {

                    countdown.textContent =
                        `Remember... ${seconds}`;

                }

            },
            1000
        );


    /* -----------------------------------------------------
       Answer screen
       ----------------------------------------------------- */

    setTimeout(
        () => {


            clearInterval(timer);


            const distractors =
                randomItems(
                    words.filter(
                        word =>
                            !selectedSet.has(word)
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
                        Which words do you remember?
                    </h2>


                    <p id="wordSelectionCount">
                        0 selected
                    </p>


                    <div
                        class="choice-grid word-choice-grid"
                    >

                        ${
                            choices
                                .map(
                                    word => `

                                        <button
                                            class="choice-button"
                                            data-word="${escapeHTML(word)}"
                                        >
                                            ${word}
                                        </button>

                                    `
                                )
                                .join("")
                        }

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


            const selectionText =
                document.getElementById(
                    "wordSelectionCount"
                );


            const answerStart =
                Date.now();


            document
                .querySelectorAll(
                    ".choice-button"
                )
                .forEach(button => {


                    button.addEventListener(
                        "click",
                        () => {


                            button.classList.toggle(
                                "selected"
                            );


                            const selectedCount =
                                document
                                    .querySelectorAll(
                                        ".choice-button.selected"
                                    )
                                    .length;


                            selectionText.textContent =
                                `${selectedCount} selected`;

                        }
                    );

                });


            document
                .getElementById(
                    "submitWords"
                )
                .addEventListener(
                    "click",
                    () => {


                        const answers =
                            [
                                ...document
                                    .querySelectorAll(
                                        ".choice-button.selected"
                                    )
                            ]
                            .map(
                                button =>
                                    button.dataset.word
                            );


                        if (
                            answers.length === 0
                        ) {

                            selectionText.textContent =
                                "Please select at least one word.";

                            return;

                        }


                        const correct =
                            answers.filter(
                                word =>
                                    selectedSet.has(word)
                            ).length;


                        const wrong =
                            answers.filter(
                                word =>
                                    !selectedSet.has(word)
                            ).length;


                        const rawScore =
                            correct -
                            wrong * 0.5;


                        const accuracy =
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    Math.round(
                                        (
                                            rawScore /
                                            count
                                        ) * 100
                                    )
                                )
                            );


                        let message;


                        if (
                            correct === count &&
                            wrong === 0
                        ) {

                            message =
                                "Fantastic! You remembered every word! 🎉";

                        } else if (
                            accuracy >= 75
                        ) {

                            message =
                                `Excellent! You remembered ${correct} of ${count} words. 🌟`;

                        } else if (
                            accuracy >= 50
                        ) {

                            message =
                                `Good work! You remembered ${correct} of ${count} words. 🌿`;

                        } else {

                            message =
                                `Nice try! You remembered ${correct} of ${count}. Keep practicing. 💚`;

                        }


                        finishGame(

                            message,

                            accuracy,

                            count,

                            Date.now() -
                            answerStart

                        );

                    }
                );


        },
        displayTime
    );

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


    /* -----------------------------------------------------
       Prevent invalid accuracy
       ----------------------------------------------------- */

    accuracy =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(accuracy)
            )
        );


    const score =
        accuracy;


    /* -----------------------------------------------------
       Show message
       ----------------------------------------------------- */

    gameMessage.textContent =
        message;


    /* -----------------------------------------------------
       Save to Flask backend
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
                "Game result could not be saved."
            );

        }


    } catch (error) {

        console.error(
            "Backend connection error:",
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
                ${message}
            </p>


            <div
                style="
                    margin:20px 0;
                    font-size:20px;
                "
            >

                <p>
                    <strong>
                        Accuracy
                    </strong>
                </p>

                <p
                    style="
                        font-size:36px;
                        font-weight:bold;
                    "
                >
                    ${accuracy}%
                </p>

            </div>


            <button
                id="playAgain"
                class="primary-button"
            >
                Play Again
            </button>


            <button
                id="backToGames"
                class="secondary-button"
                style="margin-top:10px"
            >
                Back to Games
            </button>

        </div>

    `;


    /* -----------------------------------------------------
       Play again
       ----------------------------------------------------- */

    document
        .getElementById("playAgain")
        .addEventListener(
            "click",
            startGame
        );


    /* -----------------------------------------------------
       Back to games
       ----------------------------------------------------- */

    const backButton =
        document.getElementById(
            "backToGames"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "/games";

            }
        );

    }

}
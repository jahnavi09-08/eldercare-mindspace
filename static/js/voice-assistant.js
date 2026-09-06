// ============================================
// ELDERCARE MINDSPACE - VOICE ASSISTANT
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    // --------------------------------------------
    // Browser support
    // --------------------------------------------

    if (!SpeechRecognition) {
        console.error("Speech recognition is not supported.");

        alert(
            "Voice recognition is not supported in this browser. Please use Google Chrome."
        );

        return;
    }

    // --------------------------------------------
    // Recognition
    // --------------------------------------------

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    let isListening = false;


    // --------------------------------------------
    // Create assistant UI
    // --------------------------------------------

    const assistant = document.createElement("div");

    assistant.id = "voiceAssistant";

    assistant.innerHTML = `
        <button
            id="voiceAssistantButton"
            type="button"
            aria-label="Voice Assistant"
        >
            🎤
            <span>Voice Assistant</span>
        </button>

        <div
            id="voiceAssistantStatus"
            aria-live="polite"
        >
            Tap the microphone and speak
        </div>
    `;

    document.body.appendChild(assistant);


    const voiceButton =
        document.getElementById("voiceAssistantButton");

    const status =
        document.getElementById("voiceAssistantStatus");


    // --------------------------------------------
    // Speak
    // --------------------------------------------

    function speak(text) {

        console.log("Assistant:", text);

        if (!("speechSynthesis" in window)) {
            return;
        }

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang = "en-IN";

        utterance.rate = 0.85;

        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    }


    // --------------------------------------------
    // START LISTENING
    // --------------------------------------------

    voiceButton.addEventListener("click", function () {

        if (isListening) {
            console.log("Already listening.");
            return;
        }

        console.log("Starting microphone...");

        status.textContent =
            "🎧 Starting microphone...";

        voiceButton.classList.add("listening");

        isListening = true;

        try {

            recognition.start();

        } catch (error) {

            console.error(
                "Could not start recognition:",
                error
            );

            isListening = false;

            voiceButton.classList.remove("listening");

            status.textContent =
                "Could not start microphone.";

        }

    });


    // --------------------------------------------
    // Recognition started
    // --------------------------------------------

    recognition.onstart = function () {

        console.log("Microphone is listening.");

        status.textContent =
            "🎧 Listening... Speak now";

        voiceButton.classList.add("listening");

        isListening = true;

    };


    // --------------------------------------------
    // Speech detected
    // --------------------------------------------

    recognition.onspeechstart = function () {

        console.log("Speech detected!");

        status.textContent =
            "👂 I can hear you...";

    };


    // --------------------------------------------
    // Speech ended
    // --------------------------------------------

    recognition.onspeechend = function () {

        console.log("Speech ended.");

        status.textContent =
            "Processing your voice...";

    };


    // --------------------------------------------
    // RESULT
    // --------------------------------------------

    recognition.onresult = function (event) {

        console.log("Recognition result received.");

        if (
            !event.results ||
            !event.results.length
        ) {

            console.log("No result received.");

            return;

        }


        const result =
            event.results[0][0];


        const transcript =
            result.transcript
                .toLowerCase()
                .trim();


        console.log(
            "You said:",
            transcript
        );


        console.log(
            "Confidence:",
            result.confidence
        );


        status.textContent =
            `You said: "${transcript}"`;


        processCommand(transcript);

    };


    // --------------------------------------------
    // Recognition ended
    // --------------------------------------------

    recognition.onend = function () {

        console.log("Recognition ended.");

        isListening = false;

        voiceButton.classList.remove("listening");

    };


    // --------------------------------------------
    // Recognition error
    // --------------------------------------------

    recognition.onerror = function (event) {

        console.error(
            "Speech recognition error:",
            event.error
        );


        isListening = false;

        voiceButton.classList.remove("listening");


        switch (event.error) {

            case "not-allowed":

                status.textContent =
                    "❌ Microphone permission denied.";

                speak(
                    "Please allow microphone access."
                );

                break;


            case "no-speech":

                status.textContent =
                    "🔇 No speech detected. Please speak louder and try again.";

                break;


            case "audio-capture":

                status.textContent =
                    "❌ Microphone could not be accessed.";

                break;


            case "network":

                status.textContent =
                    "❌ Speech recognition network error.";

                break;


            default:

                status.textContent =
                    "❌ Voice recognition error: " +
                    event.error;

        }

    };


    // ============================================
    // COMMAND PROCESSOR
    // ============================================

    function processCommand(command) {

        console.log(
            "Processing command:",
            command
        );


        // ----------------------------------------
        // HOME
        // ----------------------------------------

        if (
            command.includes("home") ||
            command.includes("main page")
        ) {

            speak(
                "Opening the home page."
            );

            setTimeout(function () {

                window.location.href = "/";

            }, 800);

            return;

        }


        // ----------------------------------------
        // GAMES
        // ----------------------------------------

        if (
            command.includes("games") ||
            command.includes("game")
        ) {

            speak(
                "Opening the games."
            );

            setTimeout(function () {

                window.location.href = "/games";

            }, 800);

            return;

        }


        // ----------------------------------------
        // REMINDERS
        // ----------------------------------------

        if (
            command.includes("reminder") ||
            command.includes("reminders")
        ) {

            speak(
                "Opening your reminders."
            );

            setTimeout(function () {

                window.location.href = "/reminders";

            }, 800);

            return;

        }


        // ----------------------------------------
        // ACTIVITIES
        // ----------------------------------------

        if (
            command.includes("activity") ||
            command.includes("activities")
        ) {

            speak(
                "Opening your activities."
            );

            setTimeout(function () {

                window.location.href = "/activities";

            }, 800);

            return;

        }


        // ----------------------------------------
        // PROGRESS
        // ----------------------------------------

        if (
            command.includes("progress") ||
            command.includes("performance")
        ) {

            speak(
                "Opening your progress."
            );

            setTimeout(function () {

                window.location.href = "/progress";

            }, 800);

            return;

        }


        // ----------------------------------------
        // PROFILE
        // ----------------------------------------

        if (
            command.includes("profile") ||
            command.includes("my profile")
        ) {

            speak(
                "Opening your profile."
            );

            setTimeout(function () {

                window.location.href = "/profile";

            }, 800);

            return;

        }


        // ----------------------------------------
        // HELP
        // ----------------------------------------

        if (
            command.includes("help") ||
            command.includes("what can you do")
        ) {

            speak(
                "You can say open games, open reminders, open activities, open progress, open profile, or go home."
            );

            status.textContent =
                "Try saying: Open Games";

            return;

        }


        // ----------------------------------------
        // UNKNOWN
        // ----------------------------------------

        speak(
            "Sorry, I did not understand that."
        );

        status.textContent =
            "Try saying: Open Games or Open Reminders.";

    }

});
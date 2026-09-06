// ============================================
// MINDSPACE - AI VOICE ASSISTANT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Voice Assistant loading...");


    // ============================================
    // BROWSER SUPPORT
    // ============================================

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    // ============================================
    // CREATE VOICE ASSISTANT UI
    // ============================================

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


    // ============================================
    // TEXT TO SPEECH
    // ============================================

    function speak(text) {

        console.log("Assistant says:", text);

        if (!("speechSynthesis" in window)) {

            console.error(
                "Speech synthesis is not supported."
            );

            return;
        }


        // Stop previous speech
        window.speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(text);


        utterance.lang = "en-IN";

        utterance.rate = 0.9;

        utterance.pitch = 1;


        utterance.onstart = () => {

            console.log(
                "Assistant started speaking."
            );

        };


        utterance.onend = () => {

            console.log(
                "Assistant finished speaking."
            );

        };


        utterance.onerror = event => {

            console.error(
                "Speech synthesis error:",
                event
            );

        };


        // Important Chrome fix
        window.speechSynthesis.resume();


        setTimeout(() => {

            window.speechSynthesis.speak(
                utterance
            );

        }, 100);

    }


    // ============================================
    // CHECK SPEECH RECOGNITION
    // ============================================

    if (!SpeechRecognition) {

        console.error(
            "Speech Recognition is not supported."
        );

        status.textContent =
            "Voice recognition is not supported in this browser.";

        voiceButton.addEventListener(
            "click",
            () => {

                speak(
                    "Voice recognition is not supported. Please use Google Chrome."
                );

            }
        );

        return;
    }


    // ============================================
    // CREATE RECOGNITION
    // ============================================

    const recognition =
        new SpeechRecognition();


    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 3;


    let isListening = false;

    let finalTranscript = "";


    // ============================================
    // MICROPHONE PERMISSION CHECK
    // ============================================

    async function requestMicrophone() {

        try {

            console.log(
                "Requesting microphone permission..."
            );


            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });


            console.log(
                "Microphone permission granted!"
            );


            // Stop stream because SpeechRecognition
            // will use the microphone itself

            stream.getTracks().forEach(track => {

                track.stop();

            });


            return true;

        }
        catch (error) {

            console.error(
                "Microphone permission error:",
                error
            );


            status.textContent =
                "❌ Please allow microphone access.";

            speak(
                "Please allow microphone access in your browser."
            );


            return false;

        }

    }


    // ============================================
    // START LISTENING
    // ============================================

    voiceButton.addEventListener(
        "click",
        async () => {

            if (isListening) {

                console.log(
                    "Already listening."
                );

                return;

            }


            // ----------------------------------------
            // Check microphone permission
            // ----------------------------------------

            status.textContent =
                "🎧 Checking microphone...";


            const allowed =
                await requestMicrophone();


            if (!allowed) {

                return;

            }


            // ----------------------------------------
            // Start recognition
            // ----------------------------------------

            try {

                finalTranscript = "";

                console.log(
                    "Starting speech recognition..."
                );


                status.textContent =
                    "🎤 Listening... Speak now";


                voiceButton.classList.add(
                    "listening"
                );


                isListening = true;


                recognition.start();

            }
            catch (error) {

                console.error(
                    "Recognition start error:",
                    error
                );


                isListening = false;


                voiceButton.classList.remove(
                    "listening"
                );


                status.textContent =
                    "❌ Could not start listening.";

            }

        }
    );


    // ============================================
    // RECOGNITION STARTED
    // ============================================

    recognition.onstart = () => {

        console.log(
            "Recognition started successfully!"
        );


        isListening = true;


        voiceButton.classList.add(
            "listening"
        );


        status.textContent =
            "👂 I'm listening... speak now";

    };


    // ============================================
    // SPEECH STARTED
    // ============================================

    recognition.onspeechstart = () => {

        console.log(
            "Speech detected!"
        );


        status.textContent =
            "👂 I can hear you...";

    };


    // ============================================
    // SOUND DETECTED
    // ============================================

    recognition.onsoundstart = () => {

        console.log(
            "Sound detected!"
        );

    };


    // ============================================
    // SPEECH ENDED
    // ============================================

    recognition.onspeechend = () => {

        console.log(
            "Speech ended."
        );


        status.textContent =
            "🧠 Understanding your command...";

    };


    // ============================================
    // PROCESS RESULTS
    // ============================================

    recognition.onresult = event => {

        console.log(
            "Speech result received:",
            event
        );


        let transcript = "";


        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            transcript +=
                event.results[i][0].transcript;


            if (
                event.results[i].isFinal
            ) {

                finalTranscript +=
                    event.results[i][0].transcript;

            }

        }


        transcript =
            transcript.trim();


        console.log(
            "Heard:",
            transcript
        );


        // Show live speech

        if (transcript) {

            status.textContent =
                `You said: "${transcript}"`;

        }


        // Process final speech

        if (finalTranscript.trim()) {

            const command =
                finalTranscript
                    .toLowerCase()
                    .trim();


            console.log(
                "Final command:",
                command
            );


            processCommand(command);

        }

    };


    // ============================================
    // RECOGNITION ENDED
    // ============================================

    recognition.onend = () => {

        console.log(
            "Recognition ended."
        );


        isListening = false;


        voiceButton.classList.remove(
            "listening"
        );

    };


    // ============================================
    // ERROR HANDLING
    // ============================================

    recognition.onerror = event => {

        console.error(
            "Recognition error:",
            event.error
        );


        isListening = false;


        voiceButton.classList.remove(
            "listening"
        );


        // ----------------------------------------
        // NO SPEECH
        // ----------------------------------------

        if (
            event.error === "no-speech"
        ) {

            status.textContent =
                "🔇 I couldn't hear anything. Please try again.";

            return;

        }


        // ----------------------------------------
        // MICROPHONE DENIED
        // ----------------------------------------

        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {

            status.textContent =
                "❌ Microphone permission was denied.";

            speak(
                "Please allow microphone access."
            );

            return;

        }


        // ----------------------------------------
        // AUDIO CAPTURE
        // ----------------------------------------

        if (
            event.error === "audio-capture"
        ) {

            status.textContent =
                "❌ No microphone was found.";

            speak(
                "I could not find a microphone."
            );

            return;

        }


        // ----------------------------------------
        // NETWORK
        // ----------------------------------------

        if (
            event.error === "network"
        ) {

            status.textContent =
                "❌ Speech recognition needs an internet connection.";

            return;

        }


        // ----------------------------------------
        // OTHER ERROR
        // ----------------------------------------

        status.textContent =
            "❌ Voice error: " +
            event.error;

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
            command.includes("go home") ||
            command.includes("main page")
        ) {

            respondAndNavigate(
                "Opening the home page.",
                "/"
            );

            return;

        }


        // ----------------------------------------
        // GAMES
        // ----------------------------------------

        if (
            command.includes("game") ||
            command.includes("games")
        ) {

            respondAndNavigate(
                "Opening your brain games.",
                "/games"
            );

            return;

        }


        // ----------------------------------------
        // REMINDERS
        // ----------------------------------------

        if (
            command.includes("reminder") ||
            command.includes("reminders")
        ) {

            respondAndNavigate(
                "Opening your reminders.",
                "/reminders"
            );

            return;

        }


        // ----------------------------------------
        // ACTIVITIES
        // ----------------------------------------

        if (
            command.includes("activity") ||
            command.includes("activities")
        ) {

            respondAndNavigate(
                "Opening your activities.",
                "/activities"
            );

            return;

        }


        // ----------------------------------------
        // PROGRESS
        // ----------------------------------------

        if (
            command.includes("progress") ||
            command.includes("performance") ||
            command.includes("my progress")
        ) {

            respondAndNavigate(
                "Opening your progress.",
                "/progress"
            );

            return;

        }


        // ----------------------------------------
        // PROFILE
        // ----------------------------------------

        if (
            command.includes("profile") ||
            command.includes("my profile")
        ) {

            respondAndNavigate(
                "Opening your profile.",
                "/profile"
            );

            return;

        }


        // ----------------------------------------
        // HELP
        // ----------------------------------------

        if (
            command.includes("help") ||
            command.includes("what can you do")
        ) {

            const message =
                "You can ask me to open games, reminders, activities, progress, profile, or home.";


            status.textContent =
                "💡 Try saying: Open Games";


            speak(message);


            return;

        }


        // ----------------------------------------
        // GREETING
        // ----------------------------------------

        if (
            command.includes("hello") ||
            command.includes("hi")
        ) {

            const message =
                "Hello! How can I help you today?";


            status.textContent =
                "😊 Hello! How can I help you?";


            speak(message);


            return;

        }


        // ----------------------------------------
        // UNKNOWN COMMAND
        // ----------------------------------------

        const message =
            "Sorry, I did not understand that. You can say open games, open reminders, or ask for help.";


        status.textContent =
            "🤔 I didn't understand. Try saying: Open Games";


        speak(message);

    }


    // ============================================
    // SPEAK + NAVIGATE
    // ============================================

    function respondAndNavigate(
        message,
        url
    ) {

        status.textContent =
            "🤖 " + message;


        speak(message);


        // Give the assistant time to speak

        setTimeout(() => {

            window.location.href =
                url;

        }, 1800);

    }


    // ============================================
    // INITIAL GREETING
    // ============================================

    console.log(
        "Voice Assistant ready!"
    );

});
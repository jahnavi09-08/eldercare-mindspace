// ============================================================
// ELDERCARE MINDSPACE - SMART VOICE ASSISTANT
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================================
    // SPEECH RECOGNITION SUPPORT
    // ========================================================

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.error(
            "Speech recognition is not supported."
        );

        return;

    }


    // ========================================================
    // LANGUAGE CONFIGURATION
    // ========================================================

    const LANGUAGE_CONFIG = {

        en: {

            recognition: "en-IN",

            speech: "en-IN",

            button: "Voice Assistant",

            ready:
                "Tap the microphone and speak.",

            starting:
                "Starting microphone...",

            listening:
                "Listening... Speak now.",

            hearing:
                "I can hear you.",

            processing:
                "Processing your voice...",

            noSpeech:
                "I could not hear anything. Please try again.",

            microphoneDenied:
                "Microphone permission denied.",

            unknown:
                "Sorry, I did not understand that.",

            welcome:
                "Hello! How can I help you? " +
                "I can help you open Home, Games, Reminders, " +
                "Activities, Progress, or Profile. " +
                "Would you like me to explain the Home page?",

            homeDescription:
                "Welcome to MindSpace. " +
                "This website helps support memory and daily wellbeing. " +
                "You can use Games to play memory activities. " +
                "Reminders helps you remember important tasks. " +
                "Activities helps you plan your daily routine. " +
                "Progress shows your game performance and AI recommendation. " +
                "Profile shows your personal information and memory activity summary.",

            openingHome:
                "Opening the Home page.",

            openingGames:
                "Opening Games.",

            openingReminders:
                "Opening Reminders.",

            openingActivities:
                "Opening Activities.",

            openingProgress:
                "Opening Progress.",

            openingProfile:
                "Opening Profile.",

            gamesDescription:
                "Welcome to Games. " +
                "You can play Sequence Memory, Remember the Picture, " +
                "Object Matching, Daily Routine Recall, and Word Recall. " +
                "Each game helps support memory and thinking skills.",

            remindersDescription:
                "Welcome to Reminders. " +
                "Here you can add reminders for important daily tasks, " +
                "medicines, wellness activities, and other routines.",

            activitiesDescription:
                "Welcome to Daily Activities. " +
                "Here you can add simple daily activities such as walking, " +
                "reading, gardening, exercise, or listening to music.",

            profileDescription:
                "Welcome to your Profile. " +
                "Here you can see your personal information, " +
                "memory activity statistics, recommended difficulty, " +
                "and personalized recommendation.",

            help:
                "You can say open Home, open Games, open Reminders, " +
                "open Activities, open Progress, or open Profile."
        },


        // ====================================================
        // TELUGU
        // ====================================================

        te: {

            recognition: "te-IN",

            speech: "te-IN",

            button: "వాయిస్ అసిస్టెంట్",

            ready:
                "మైక్రోఫోన్ నొక్కి మాట్లాడండి.",

            starting:
                "మైక్రోఫోన్ ప్రారంభమవుతోంది.",

            listening:
                "వింటున్నాను. ఇప్పుడు మాట్లాడండి.",

            hearing:
                "నేను మిమ్మల్ని వింటున్నాను.",

            processing:
                "మీ మాటలను అర్థం చేసుకుంటున్నాను.",

            noSpeech:
                "మీ మాటలు వినిపించలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",

            microphoneDenied:
                "మైక్రోఫోన్ అనుమతి ఇవ్వబడలేదు.",

            unknown:
                "క్షమించండి, నేను అర్థం చేసుకోలేకపోయాను.",

            welcome:
                "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను? " +
                "నేను హోమ్, గేమ్స్, రిమైండర్స్, యాక్టివిటీస్, " +
                "ప్రోగ్రెస్ లేదా ప్రొఫైల్ తెరవగలను. " +
                "మీకు హోమ్ పేజీ గురించి వివరించాలా?",

            homeDescription:
                "మైండ్‌స్పేస్‌కు స్వాగతం. " +
                "ఇక్కడ మీరు మెమరీ గేమ్స్ ఆడవచ్చు, " +
                "రిమైండర్స్ సెట్ చేసుకోవచ్చు, " +
                "రోజువారీ యాక్టివిటీస్ ప్లాన్ చేసుకోవచ్చు, " +
                "మీ ప్రోగ్రెస్ చూడవచ్చు.",

            openingHome:
                "హోమ్ పేజీని తెరుస్తున్నాను.",

            openingGames:
                "గేమ్స్ తెరుస్తున్నాను.",

            openingReminders:
                "రిమైండర్స్ తెరుస్తున్నాను.",

            openingActivities:
                "యాక్టివిటీస్ తెరుస్తున్నాను.",

            openingProgress:
                "మీ ప్రోగ్రెస్ తెరుస్తున్నాను.",

            openingProfile:
                "మీ ప్రొఫైల్ తెరుస్తున్నాను.",

            gamesDescription:
                "గేమ్స్ పేజీకి స్వాగతం. ఇక్కడ మెమరీ గేమ్స్ ఉన్నాయి.",

            remindersDescription:
                "రిమైండర్స్ పేజీలో ముఖ్యమైన పనులకు గుర్తింపులు పెట్టుకోవచ్చు.",

            activitiesDescription:
                "యాక్టివిటీస్ పేజీలో రోజువారీ కార్యక్రమాలను ప్లాన్ చేసుకోవచ్చు.",

            profileDescription:
                "ప్రొఫైల్‌లో మీ వ్యక్తిగత సమాచారం మరియు ప్రోగ్రెస్ చూడవచ్చు.",

            help:
                "మీరు గేమ్స్ తెరవండి, ప్రోగ్రెస్ తెరవండి, " +
                "యాక్టివిటీస్ తెరవండి లేదా హోమ్‌కు వెళ్ళండి అని చెప్పవచ్చు."
        },


        // ====================================================
        // HINDI
        // ====================================================

        hi: {

            recognition: "hi-IN",

            speech: "hi-IN",

            button: "वॉइस असिस्टेंट",

            ready:
                "माइक्रोफोन दबाकर बोलें।",

            starting:
                "माइक्रोफोन शुरू हो रहा है।",

            listening:
                "मैं सुन रहा हूँ। अब बोलिए।",

            hearing:
                "मैं आपको सुन रहा हूँ।",

            processing:
                "आपकी बात समझ रहा हूँ।",

            noSpeech:
                "मुझे कुछ सुनाई नहीं दिया। कृपया फिर से कोशिश करें।",

            microphoneDenied:
                "माइक्रोफोन की अनुमति नहीं मिली।",

            unknown:
                "माफ़ कीजिए, मैं समझ नहीं पाया।",

            welcome:
                "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ? " +
                "मैं होम, गेम्स, रिमाइंडर्स, एक्टिविटीज, " +
                "प्रोग्रेस या प्रोफाइल खोल सकता हूँ। " +
                "क्या आप चाहते हैं कि मैं होम पेज समझाऊँ?",

            homeDescription:
                "माइंडस्पेस में आपका स्वागत है। " +
                "यहाँ आप मेमोरी गेम खेल सकते हैं, " +
                "रिमाइंडर बना सकते हैं, " +
                "दैनिक गतिविधियाँ प्लान कर सकते हैं " +
                "और अपनी प्रगति देख सकते हैं।",

            openingHome:
                "होम पेज खोल रहा हूँ।",

            openingGames:
                "गेम्स खोल रहा हूँ।",

            openingReminders:
                "रिमाइंडर्स खोल रहा हूँ।",

            openingActivities:
                "एक्टिविटीज खोल रहा हूँ।",

            openingProgress:
                "आपकी प्रगति खोल रहा हूँ।",

            openingProfile:
                "आपकी प्रोफाइल खोल रहा हूँ।",

            gamesDescription:
                "गेम्स पेज पर कई मेमोरी गेम उपलब्ध हैं।",

            remindersDescription:
                "रिमाइंडर्स पेज पर आप महत्वपूर्ण कामों के लिए रिमाइंडर बना सकते हैं।",

            activitiesDescription:
                "एक्टिविटीज पेज पर आप अपनी दैनिक गतिविधियाँ प्लान कर सकते हैं।",

            profileDescription:
                "प्रोफाइल में आपकी व्यक्तिगत जानकारी और प्रगति दिखाई जाती है।",

            help:
                "आप कह सकते हैं गेम्स खोलो, प्रोग्रेस खोलो, एक्टिविटीज खोलो या होम खोलो।"
        }

    };


    // ========================================================
    // GET LANGUAGE
    // ========================================================

    function getCurrentLanguage() {

        const selector =
            document.getElementById("languageSelector");


        if (
            selector &&
            LANGUAGE_CONFIG[selector.value]
        ) {

            return selector.value;

        }


        return "en";

    }


    function getLanguageConfig() {

        return LANGUAGE_CONFIG[
            getCurrentLanguage()
        ];

    }


    // ========================================================
    // SPEECH RECOGNITION
    // ========================================================

    const recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    let isListening = false;


    // ========================================================
    // CONVERSATION STATE
    // ========================================================

    let waitingForHomeAnswer = false;


    // ========================================================
    // CREATE VOICE ASSISTANT UI
    // ========================================================

    const assistant =
        document.createElement("div");


    assistant.id =
        "voiceAssistant";


    assistant.innerHTML = `

        <button
            id="voiceAssistantButton"
            type="button"
            aria-label="Voice Assistant"
        >

            🎤

            <span id="voiceAssistantButtonText">
                Voice Assistant
            </span>

        </button>


        <div
            id="voiceAssistantStatus"
            aria-live="polite"
        >
            Tap the microphone and speak
        </div>

    `;


    document.body.appendChild(
        assistant
    );


    const voiceButton =
        document.getElementById(
            "voiceAssistantButton"
        );


    const buttonText =
        document.getElementById(
            "voiceAssistantButtonText"
        );


    const status =
        document.getElementById(
            "voiceAssistantStatus"
        );


    // ========================================================
    // UPDATE LANGUAGE UI
    // ========================================================

    function updateVoiceUI() {

        const lang =
            getLanguageConfig();


        buttonText.textContent =
            lang.button;


        if (!isListening) {

            status.textContent =
                lang.ready;

        }

    }


    updateVoiceUI();


    // ========================================================
    // SPEAK
    // ========================================================

    function speak(text, callback = null) {

        window.speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                text
            );


        utterance.lang =
            getLanguageConfig().speech;


        utterance.rate = 0.85;

        utterance.pitch = 1;


        if (callback) {

            utterance.onend =
                callback;

        }


        window.speechSynthesis.speak(
            utterance
        );

    }


    // ========================================================
    // START LISTENING
    // ========================================================

    function startListening() {

        if (isListening) {

            return;

        }


        const lang =
            getLanguageConfig();


        recognition.lang =
            lang.recognition;


        try {

            recognition.start();

        }
        catch (error) {

            console.error(
                "Recognition error:",
                error
            );

        }

    }


    // ========================================================
    // BUTTON CLICK
    // ========================================================

    voiceButton.addEventListener(
        "click",
        function () {

            const lang =
                getLanguageConfig();


            // Stop existing speech

            window.speechSynthesis.cancel();


            waitingForHomeAnswer = true;


            status.textContent =
                "🤖 Assistant is ready";


            // First conversation

            speak(
                lang.welcome,
                function () {

                    startListening();

                }
            );

        }
    );


    // ========================================================
    // RECOGNITION START
    // ========================================================

    recognition.onstart =
        function () {

            isListening = true;


            voiceButton.classList.add(
                "listening"
            );


            status.textContent =
                getLanguageConfig().listening;

        };


    // ========================================================
    // SPEECH START
    // ========================================================

    recognition.onspeechstart =
        function () {

            status.textContent =
                getLanguageConfig().hearing;

        };


    // ========================================================
    // SPEECH END
    // ========================================================

    recognition.onspeechend =
        function () {

            status.textContent =
                getLanguageConfig().processing;

        };


    // ========================================================
    // RESULT
    // ========================================================

    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0]
                    .transcript
                    .toLowerCase()
                    .trim();


            console.log(
                "User said:",
                transcript
            );


            status.textContent =
                "🎤 " +
                event.results[0][0].transcript;


            processCommand(
                transcript
            );

        };


    // ========================================================
    // END
    // ========================================================

    recognition.onend =
        function () {

            isListening = false;


            voiceButton.classList.remove(
                "listening"
            );

        };


    // ========================================================
    // ERROR
    // ========================================================

    recognition.onerror =
        function (event) {

            isListening = false;


            voiceButton.classList.remove(
                "listening"
            );


            const lang =
                getLanguageConfig();


            if (
                event.error === "not-allowed"
            ) {

                status.textContent =
                    lang.microphoneDenied;

                speak(
                    lang.microphoneDenied
                );

            }

            else if (
                event.error === "no-speech"
            ) {

                status.textContent =
                    lang.noSpeech;

            }

            else {

                status.textContent =
                    "Voice recognition error.";

            }

        };


    // ========================================================
    // NAVIGATE AND READ
    // ========================================================

    function openPage(
        url,
        openingMessage,
        pageToRead
    ) {

        // Save which page should be read

        sessionStorage.setItem(
            "voiceReadPage",
            pageToRead
        );


        speak(
            openingMessage
        );


        setTimeout(
            function () {

                window.location.href =
                    url;

            },
            1400
        );

    }


    // ========================================================
    // YES / NO DETECTION
    // ========================================================

    function isYes(command) {

        return (

            command.includes("yes") ||
            command.includes("yeah") ||
            command.includes("sure") ||
            command.includes("okay") ||
            command.includes("yes please") ||

            command.includes("అవును") ||
            command.includes("చెప్పు") ||

            command.includes("हाँ") ||
            command.includes("हां")

        );

    }


    function isNo(command) {

        return (

            command.includes("no") ||
            command.includes("no thanks") ||

            command.includes("వద్దు") ||
            command.includes("లేదు") ||

            command.includes("नहीं")

        );

    }


    // ========================================================
    // COMMAND PROCESSOR
    // ========================================================

    function processCommand(command) {

        const lang =
            getLanguageConfig();


        // ====================================================
        // YES / NO FOR HOME QUESTION
        // ====================================================

        if (waitingForHomeAnswer) {

            if (isYes(command)) {

                waitingForHomeAnswer = false;


                speak(
                    lang.homeDescription
                );


                return;

            }


            if (isNo(command)) {

                waitingForHomeAnswer = false;


                speak(
                    lang.help
                );


                return;

            }


            // User may directly say:
            // Open Progress
            // Open Activities

            waitingForHomeAnswer = false;

        }


        // ====================================================
        // PROGRESS
        // ====================================================

        if (

            command.includes("progress") ||
            command.includes("performance") ||
            command.includes("my results") ||

            command.includes("ప్రోగ్రెస్") ||
            command.includes("పురోగతి") ||

            command.includes("प्रगति") ||
            command.includes("प्रोग्रेस")

        ) {

            openPage(
                "/progress",
                lang.openingProgress,
                "progress"
            );

            return;

        }


        // ====================================================
        // ACTIVITIES
        // ====================================================

        if (

            command.includes("activity") ||
            command.includes("activities") ||

            command.includes("యాక్టివిటీస్") ||
            command.includes("కార్యకలాపాలు") ||

            command.includes("गतिविधि") ||
            command.includes("एक्टिविटी")

        ) {

            openPage(
                "/activities",
                lang.openingActivities,
                "activities"
            );

            return;

        }


        // ====================================================
        // GAMES
        // ====================================================

        if (

            command.includes("game") ||
            command.includes("games") ||

            command.includes("గేమ్") ||
            command.includes("గేమ్స్") ||

            command.includes("गेम") ||
            command.includes("खेल")

        ) {

            openPage(
                "/games",
                lang.openingGames,
                "games"
            );

            return;

        }


        // ====================================================
        // REMINDERS
        // ====================================================

        if (

            command.includes("reminder") ||

            command.includes("రిమైండర్") ||

            command.includes("रिमाइंडर")

        ) {

            openPage(
                "/reminders",
                lang.openingReminders,
                "reminders"
            );

            return;

        }


        // ====================================================
        // PROFILE
        // ====================================================

        if (

            command.includes("profile") ||

            command.includes("ప్రొఫైల్") ||

            command.includes("प्रोफाइल")

        ) {

            openPage(
                "/profile",
                lang.openingProfile,
                "profile"
            );

            return;

        }


        // ====================================================
        // HOME
        // ====================================================

        if (

            command.includes("home") ||
            command.includes("main page") ||

            command.includes("హోమ్") ||

            command.includes("होम")

        ) {

            openPage(
                "/",
                lang.openingHome,
                "home"
            );

            return;

        }


        // ====================================================
        // HELP
        // ====================================================

        if (

            command.includes("help") ||
            command.includes("what can you do") ||

            command.includes("సహాయం") ||

            command.includes("मदद")

        ) {

            speak(
                lang.help
            );

            return;

        }


        // ====================================================
        // UNKNOWN
        // ====================================================

        speak(
            lang.unknown
        );

    }


    // ========================================================
    // READ CURRENT PAGE
    // ========================================================

    async function readCurrentPage() {

        const page =
            sessionStorage.getItem(
                "voiceReadPage"
            );


        if (!page) {

            return;

        }


        // Remove immediately

        sessionStorage.removeItem(
            "voiceReadPage"
        );


        const lang =
            getLanguageConfig();


        // Wait for page content to load

        await new Promise(
            resolve => {

                setTimeout(
                    resolve,
                    1800
                );

            }
        );


        // ====================================================
        // HOME
        // ====================================================

        if (page === "home") {

            speak(
                lang.homeDescription
            );

        }


        // ====================================================
        // GAMES
        // ====================================================

        else if (page === "games") {

            speak(
                lang.gamesDescription
            );

        }


        // ====================================================
        // REMINDERS
        // ====================================================

        else if (page === "reminders") {

            await readReminders();

        }


        // ====================================================
        // ACTIVITIES
        // ====================================================

        else if (page === "activities") {

            await readActivities();

        }


        // ====================================================
        // PROGRESS
        // ====================================================

        else if (page === "progress") {

            await readProgress();

        }


        // ====================================================
        // PROFILE
        // ====================================================

        else if (page === "profile") {

            speak(
                lang.profileDescription
            );

        }

    }


    // ========================================================
    // READ PROGRESS
    // ========================================================

    async function readProgress() {

        const lang =
            getLanguageConfig();


        try {

            const response =
                await fetch(
                    "/api/progress"
                );


            const data =
                await response.json();


            const games =
                Math.round(
                    Number(
                        data.games_played || 0
                    )
                );


            const accuracy =
                Math.round(
                    Number(
                        data.average_accuracy || 0
                    )
                );


            const best =
                Math.round(
                    Number(
                        data.best_score || 0
                    )
                );


            if (
                getCurrentLanguage() === "en"
            ) {

                speak(

                    `Welcome to your Progress page. ` +

                    `You have played ${games} games. ` +

                    `Your average accuracy is ${accuracy} percent. ` +

                    `Your best score is ${best} percent. ` +

                    `${data.recommendation_message}`

                );

            }

            else {

                speak(
                    lang.profileDescription
                );

            }

        }
        catch (error) {

            console.error(
                "Progress error:",
                error
            );

        }

    }


    // ========================================================
    // READ ACTIVITIES
    // ========================================================

    async function readActivities() {

        try {

            const response =
                await fetch(
                    "/api/activities"
                );


            const activities =
                await response.json();


            if (
                !activities.length
            ) {

                speak(
                    "Welcome to Activities. You have no activities yet. You can add a daily activity."
                );

                return;

            }


            let message =
                "Welcome to Daily Activities. " +

                `You have ${activities.length} activities. `;


            activities.forEach(
                function (
                    activity,
                    index
                ) {

                    message +=

                        `Activity ${index + 1}: ` +

                        `${activity.activity_name}, ` +

                        `scheduled at ${activity.scheduled_time}. `;

                }
            );


            speak(
                message
            );

        }
        catch (error) {

            console.error(
                "Activities error:",
                error
            );

        }

    }


    // ========================================================
    // READ REMINDERS
    // ========================================================

    async function readReminders() {

        try {

            const response =
                await fetch(
                    "/api/reminders"
                );


            const reminders =
                await response.json();


            if (
                !reminders.length
            ) {

                speak(
                    "Welcome to Reminders. You have no reminders yet. You can add a reminder for important daily tasks."
                );

                return;

            }


            let message =
                "Welcome to your Reminders page. " +

                `You have ${reminders.length} reminders. `;


            reminders.forEach(
                function (
                    reminder,
                    index
                ) {

                    message +=

                        `Reminder ${index + 1}: ` +

                        `${reminder.title}, ` +

                        `at ${reminder.reminder_time}. `;

                }
            );


            speak(
                message
            );

        }
        catch (error) {

            console.error(
                "Reminder error:",
                error
            );

        }

    }


    // ========================================================
    // AUTOMATICALLY READ PAGE AFTER VOICE NAVIGATION
    // ========================================================

    readCurrentPage();

});
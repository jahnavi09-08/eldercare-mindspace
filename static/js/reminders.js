// ============================================================
// Eldercare MindSpace - Reminders
// Reminder list + completion + browser notification + beep alarm
// ============================================================

let activeReminders = [];
let reminderCheckTimer = null;
let alarmInterval = null;
let audioContext = null;


// ============================================================
// INITIALIZE ALERT SYSTEM
// ============================================================

async function enableReminderAlerts() {
    // Ask for browser notification permission
    if ("Notification" in window) {
        try {
            if (Notification.permission === "default") {
                await Notification.requestPermission();
            }
        } catch (error) {
            console.log("Notification permission error:", error);
        }
    }

    // Prepare audio after user interaction
    try {
        if (!audioContext) {
            const AudioContext =
                window.AudioContext || window.webkitAudioContext;

            if (AudioContext) {
                audioContext = new AudioContext();
            }
        }

        if (audioContext && audioContext.state === "suspended") {
            await audioContext.resume();
        }
    } catch (error) {
        console.log("Audio initialization error:", error);
    }
}


// ============================================================
// PLAY BEEP
// ============================================================

function playReminderBeep() {
    try {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            console.log("Web Audio API is not supported.");
            return;
        }

        if (!audioContext) {
            audioContext = new AudioContext();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
            880,
            audioContext.currentTime
        );

        gainNode.gain.setValueAtTime(
            0.001,
            audioContext.currentTime
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.25,
            audioContext.currentTime + 0.03
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.5
        );

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.5
        );

    } catch (error) {
        console.log("Could not play reminder beep:", error);
    }
}


// ============================================================
// SHOW BROWSER NOTIFICATION
// ============================================================

function showReminderNotification(reminder) {
    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        try {
            new Notification(
                "⏰ Reminder",
                {
                    body:
                        reminder.title +
                        (
                            reminder.description
                                ? "\n" + reminder.description
                                : ""
                        )
                }
            );
        } catch (error) {
            console.log(
                "Browser notification could not be shown:",
                error
            );
        }
    }

    // Always show an in-page alert as well
    showReminderPopup(reminder);
}


// ============================================================
// IN-PAGE REMINDER POPUP
// ============================================================

function showReminderPopup(reminder) {

    // Remove existing popup
    const oldPopup = document.getElementById(
        "reminderAlertPopup"
    );

    if (oldPopup) {
        oldPopup.remove();
    }

    const backdrop = document.createElement("div");

    backdrop.id = "reminderAlertPopup";
    backdrop.className = "reminder-alert-backdrop";

    backdrop.innerHTML = `
        <div class="reminder-alert-card">

            <div class="reminder-alert-icon">
                ⏰
            </div>

            <h2>
                Reminder
            </h2>

            <h3>
                ${escapeHtml(reminder.title || "Reminder")}
            </h3>

            ${
                reminder.description
                    ? `
                        <p>
                            ${escapeHtml(reminder.description)}
                        </p>
                    `
                    : ""
            }

            ${
                reminder.reminder_time
                    ? `
                        <div class="reminder-alert-time">
                            🕐 ${escapeHtml(reminder.reminder_time)}
                        </div>
                    `
                    : ""
            }

            <button
                type="button"
                class="btn btn-primary reminder-stop-button"
                onclick="stopReminderAlarm()"
            >
                ✓ Got it — Stop Alarm
            </button>

        </div>
    `;

    document.body.appendChild(backdrop);
}


// ============================================================
// STOP ALARM
// ============================================================

function stopReminderAlarm() {

    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }

    const popup = document.getElementById(
        "reminderAlertPopup"
    );

    if (popup) {
        popup.remove();
    }
}


// ============================================================
// ESCAPE HTML
// Prevent HTML injection in reminder text
// ============================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// CHECK REMINDERS
// Runs every 10 seconds
// ============================================================

function checkDueReminders() {

    const now = new Date();

    const hours = String(
        now.getHours()
    ).padStart(2, "0");

    const minutes = String(
        now.getMinutes()
    ).padStart(2, "0");

    const currentTime =
        `${hours}:${minutes}`;

    const today =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-${String(
            now.getDate()
        ).padStart(2, "0")}`;

    activeReminders.forEach(reminder => {

        // Ignore completed reminders
        if (
            reminder.completed === true ||
            reminder.completed === 1 ||
            reminder.completed === "1"
        ) {
            return;
        }

        // Get reminder time
        const reminderTime =
            reminder.reminder_time ||
            reminder.time;

        if (!reminderTime) {
            return;
        }

        // Only trigger when the time matches
        if (reminderTime.substring(0, 5) !== currentTime) {
            return;
        }

        // Prevent the same reminder from firing repeatedly
        // on the same day.
        const firedKey =
            `reminder-fired-${reminder.id}-${today}`;

        if (localStorage.getItem(firedKey)) {
            return;
        }

        // Mark as fired
        localStorage.setItem(
            firedKey,
            "true"
        );

        // Show notification
        showReminderNotification(reminder);

        // Play first beep
        playReminderBeep();

        // Keep beeping every 1.5 seconds
        // until the user stops the alarm.
        if (!alarmInterval) {

            alarmInterval = setInterval(
                () => {

                    const popup =
                        document.getElementById(
                            "reminderAlertPopup"
                        );

                    if (!popup) {
                        clearInterval(
                            alarmInterval
                        );

                        alarmInterval = null;

                        return;
                    }

                    playReminderBeep();

                },
                1500
            );
        }

    });
}


// ============================================================
// LOAD REMINDERS
// ============================================================

async function loadReminders() {

    const reminderList =
        document.getElementById(
            "reminderList"
        );

    if (!reminderList) {
        return;
    }

    try {

        const response =
            await fetch("/api/reminders");

        if (!response.ok) {
            throw new Error(
                "Could not load reminders"
            );
        }

        const reminders =
            await response.json();

        activeReminders = reminders;

        // Empty state
        if (!reminders.length) {

            reminderList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        ⏰
                    </div>

                    <h3>
                        No reminders yet
                    </h3>

                    <p>
                        Add a reminder below
                        to help keep track of
                        important activities.
                    </p>
                </div>
            `;

            return;
        }

        reminderList.innerHTML =
            reminders.map(reminder => {

                const completed =
                    reminder.completed === true ||
                    reminder.completed === 1 ||
                    reminder.completed === "1";

                const reminderTime =
                    reminder.reminder_time ||
                    reminder.time ||
                    "";

                return `
                    <div
                        class="
                            reminder-card
                            ${completed ? "completed" : ""}
                        "
                    >

                        <div class="reminder-info">

                            <div class="reminder-icon">
                                ${
                                    getReminderIcon(
                                        reminder.type
                                    )
                                }
                            </div>

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        reminder.title ||
                                        "Reminder"
                                    )}
                                </h3>

                                <div class="reminder-time">
                                    🕐
                                    ${
                                        escapeHtml(
                                            reminderTime
                                        )
                                    }
                                </div>

                                ${
                                    reminder.description
                                        ? `
                                            <p>
                                                ${escapeHtml(
                                                    reminder.description
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                                ${
                                    reminder.type
                                        ? `
                                            <span
                                                class="
                                                    reminder-type
                                                "
                                            >
                                                ${escapeHtml(
                                                    reminder.type
                                                )}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                        </div>

                        <div class="reminder-actions">

                            ${
                                completed
                                    ? `
                                        <span
                                            class="
                                                reminder-status
                                                completed-status
                                            "
                                        >
                                            ✓ Done
                                        </span>
                                    `
                                    : `
                                        <button
                                            type="button"
                                            class="
                                                btn
                                                btn-secondary
                                                reminder-complete-btn
                                            "
                                            onclick="
                                                completeReminder(
                                                    ${reminder.id}
                                                )
                                            "
                                        >
                                            ✓ Mark Done
                                        </button>
                                    `
                            }

                        </div>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Error loading reminders:",
            error
        );

        reminderList.innerHTML = `
            <div class="error-state">
                <h3>
                    Unable to load reminders
                </h3>

                <p>
                    Please refresh the page
                    and try again.
                </p>
            </div>
        `;
    }
}


// ============================================================
// REMINDER ICON
// ============================================================

function getReminderIcon(type) {

    const reminderType =
        String(type || "")
            .toLowerCase();

    if (reminderType === "health") {
        return "💊";
    }

    if (reminderType === "activity") {
        return "🚶";
    }

    if (reminderType === "wellness") {
        return "🧘";
    }

    if (reminderType === "brain") {
        return "🧠";
    }

    return "⏰";
}


// ============================================================
// COMPLETE REMINDER
// ============================================================

async function completeReminder(id) {

    try {

        const response =
            await fetch(
                `/api/reminders/${id}/complete`,
                {
                    method: "POST"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Could not complete reminder"
            );
        }

        // Stop alarm if this reminder is currently alerting
        stopReminderAlarm();

        // Reload reminders
        await loadReminders();

    } catch (error) {

        console.error(
            "Error completing reminder:",
            error
        );

        alert(
            "Unable to mark the reminder as complete. Please try again."
        );
    }
}


// ============================================================
// ADD NEW REMINDER
// ============================================================

async function handleReminderSubmit(event) {

    event.preventDefault();

    // Enable notification/audio after user interaction
    await enableReminderAlerts();

    const titleInput =
        document.getElementById(
            "reminderTitle"
        );

    const timeInput =
        document.getElementById(
            "reminderTime"
        );

    const typeInput =
        document.getElementById(
            "reminderType"
        );

    const descriptionInput =
        document.getElementById(
            "reminderDescription"
        );

    if (!titleInput || !timeInput) {
        return;
    }

    const title =
        titleInput.value.trim();

    const reminderTime =
        timeInput.value;

    const type =
        typeInput
            ? typeInput.value
            : "";

    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";

    // Validate
    if (!title) {

        alert(
            "Please enter a reminder title."
        );

        titleInput.focus();

        return;
    }

    if (!reminderTime) {

        alert(
            "Please select a reminder time."
        );

        timeInput.focus();

        return;
    }

    try {

        const response =
            await fetch(
                "/api/reminders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        title: title,
                        reminder_time:
                            reminderTime,
                        type: type,
                        description:
                            description
                    })
                }
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Server error:",
                errorText
            );

            throw new Error(
                "Could not save reminder"
            );
        }

        // Clear form
        titleInput.value = "";

        timeInput.value = "";

        if (typeInput) {
            typeInput.value = "Health";
        }

        if (descriptionInput) {
            descriptionInput.value = "";
        }

        // Reload list
        await loadReminders();

        // Make sure monitoring is running
        startReminderMonitoring();

        // Friendly confirmation
        showTemporaryMessage(
            "✓ Reminder added successfully!"
        );

    } catch (error) {

        console.error(
            "Error adding reminder:",
            error
        );

        alert(
            "Unable to add the reminder. Please try again."
        );
    }
}


// ============================================================
// TEMPORARY SUCCESS MESSAGE
// ============================================================

function showTemporaryMessage(message) {

    const existing =
        document.getElementById(
            "reminderSuccessMessage"
        );

    if (existing) {
        existing.remove();
    }

    const messageBox =
        document.createElement("div");

    messageBox.id =
        "reminderSuccessMessage";

    messageBox.className =
        "reminder-success-message";

    messageBox.textContent =
        message;

    document.body.appendChild(
        messageBox
    );

    setTimeout(() => {

        messageBox.remove();

    }, 3000);
}


// ============================================================
// START REMINDER MONITORING
// ============================================================

function startReminderMonitoring() {

    // Avoid multiple timers
    if (reminderCheckTimer) {
        clearInterval(
            reminderCheckTimer
        );
    }

    // Check immediately
    checkDueReminders();

    // Then check every 10 seconds
    reminderCheckTimer =
        setInterval(
            checkDueReminders,
            10000
        );
}


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // Load reminders
        await loadReminders();

        // Start reminder checker
        startReminderMonitoring();

        // Connect form
        const form =
            document.getElementById(
                "reminderForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                handleReminderSubmit
            );
        }

    }
);


// ============================================================
// CLEANUP
// ============================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (reminderCheckTimer) {

            clearInterval(
                reminderCheckTimer
            );

            reminderCheckTimer = null;
        }

        if (alarmInterval) {

            clearInterval(
                alarmInterval
            );

            alarmInterval = null;
        }
    }
);
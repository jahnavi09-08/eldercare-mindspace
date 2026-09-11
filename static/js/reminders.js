\/* =========================================================
   MINDSPACE - REMINDERS
   MULTI-LANGUAGE SUPPORT
   ========================================================= */


/* =========================================================
   GET CURRENT LANGUAGE
   ========================================================= */

function getCurrentLanguage() {

    return localStorage.getItem("mindspaceLanguage") || "en";

}


/* =========================================================
   GET TRANSLATION
   ========================================================= */

function t(key) {

    const language = getCurrentLanguage();

    if (
        typeof translations !== "undefined" &&
        translations[language] &&
        translations[language][key]
    ) {

        return translations[language][key];

    }


    if (
        typeof translations !== "undefined" &&
        translations.en &&
        translations.en[key]
    ) {

        return translations.en[key];

    }


    return key;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GET ICON FOR REMINDER TYPE
   ========================================================= */

function getReminderIcon(type) {

    const icons = {

        Health: "💊",
        Activity: "🚶",
        Wellness: "🌿",
        Brain: "🧠"

    };

    return icons[type] || "🔔";

}


/* =========================================================
   TRANSLATE REMINDER TYPE
   ========================================================= */

function getTranslatedReminderType(type) {

    const typeKeys = {

        Health: "health",
        Activity: "reminderActivity",
        Wellness: "wellness",
        Brain: "brainExerciseOption"

    };


    if (typeKeys[type]) {

        return t(typeKeys[type]);

    }


    return escapeHTML(type || "Reminder");

}


/* =========================================================
   LOAD REMINDERS
   ========================================================= */

async function loadReminders() {

    const list =
        document.getElementById("reminderList");


    if (!list) {

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


        /* =============================================
           EMPTY STATE
           ============================================= */

        if (!reminders || reminders.length === 0) {

            list.innerHTML = `

                <div class="empty-reminders">

                    <div
                        style="
                            font-size: 40px;
                            margin-bottom: 10px;
                        "
                    >
                        🔔
                    </div>

                    <strong>
                        ${t("noReminders")}
                    </strong>

                    <p style="margin-top: 8px;">
                        ${t("noRemindersText")}
                    </p>

                </div>

            `;

            return;

        }


        /* =============================================
           DISPLAY REMINDERS
           ============================================= */

        list.innerHTML =
            reminders.map(item => {


                const completed =
                    Boolean(item.completed);


                const icon =
                    getReminderIcon(item.type);


                const translatedType =
                    getTranslatedReminderType(
                        item.type
                    );


                return `

                    <article class="reminder-card">


                        <!-- REMINDER INFORMATION -->

                        <div class="reminder-info">

                            <h3>

                                ${icon}

                                ${escapeHTML(item.title)}

                            </h3>


                            ${

                                item.description

                                    ? `

                                        <p>

                                            ${escapeHTML(
                                                item.description
                                            )}

                                        </p>

                                    `

                                    : ""

                            }


                            <p class="reminder-time">

                                ⏰

                                ${escapeHTML(
                                    item.reminder_time
                                )}

                            </p>


                            <p>

                                ${

                                    completed

                                        ? `✅ ${t("completed")}`

                                        : `🔔 ${translatedType}`

                                }

                            </p>

                        </div>


                        <!-- MARK DONE BUTTON -->

                        <button

                            type="button"

                            class="
                                complete-btn
                                ${
                                    completed
                                        ? "completed"
                                        : ""
                                }
                            "

                            onclick="
                                completeReminder(
                                    ${item.id}
                                )
                            "

                            ${
                                completed
                                    ? "disabled"
                                    : ""
                            }

                        >

                            ${

                                completed

                                    ? `✓ ${t("completed")}`

                                    : `✓ ${t("markDone")}`

                            }

                        </button>


                    </article>

                `;

            }).join("");


    }
    catch (error) {

        console.error(
            "Reminder loading error:",
            error
        );


        list.innerHTML = `

            <div class="empty-reminders">

                <div
                    style="
                        font-size: 40px;
                        margin-bottom: 10px;
                    "
                >
                    ⚠️
                </div>

                <strong>

                    ${t("unableToLoadReminders")}

                </strong>

                <p style="margin-top: 8px;">

                    ${t("refreshAndTryAgain")}

                </p>

            </div>

        `;

    }

}


/* =========================================================
   MARK REMINDER AS COMPLETED
   ========================================================= */

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


        await loadReminders();


    }
    catch (error) {

        console.error(
            "Complete reminder error:",
            error
        );


        alert(
            t("updateReminderError")
        );

    }

}


/* =========================================================
   ADD NEW REMINDER
   ========================================================= */

const reminderForm =
    document.getElementById("reminderForm");


if (reminderForm) {

    reminderForm.addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            /* =========================================
               GET FORM VALUES
               ========================================= */

            const title =
                document
                    .getElementById("reminderTitle")
                    .value
                    .trim();


            const reminderTime =
                document
                    .getElementById("reminderTime")
                    .value;


            const type =
                document
                    .getElementById("reminderType")
                    .value;


            const description =
                document
                    .getElementById(
                        "reminderDescription"
                    )
                    .value
                    .trim();


            /* =========================================
               VALIDATION
               ========================================= */

            if (!title) {

                alert(
                    t("enterReminderTitle")
                );

                return;

            }


            if (!reminderTime) {

                alert(
                    t("chooseReminderTime")
                );

                return;

            }


            /* =========================================
               PREPARE DATA
               ========================================= */

            const payload = {

                title: title,

                reminder_time: reminderTime,

                type: type,

                description: description

            };


            try {

                const submitButton =
                    reminderForm.querySelector(
                        'button[type="submit"]'
                    );


                /* =====================================
                   DISABLE BUTTON
                   ===================================== */

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        t("adding");

                }


                /* =====================================
                   SEND TO BACKEND
                   ===================================== */

                const response =
                    await fetch(

                        "/api/reminders",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    payload
                                )

                        }

                    );


                if (!response.ok) {

                    throw new Error(
                        "Could not create reminder"
                    );

                }


                /* =====================================
                   CLEAR FORM
                   ===================================== */

                reminderForm.reset();


                /* =====================================
                   RELOAD REMINDERS
                   ===================================== */

                await loadReminders();


                /* =====================================
                   SUCCESS MESSAGE
                   ===================================== */

                showReminderSuccess();


            }
            catch (error) {

                console.error(
                    "Add reminder error:",
                    error
                );


                alert(
                    t("addReminderError")
                );

            }
            finally {

                const submitButton =
                    reminderForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        `✓ ${t("addReminderButton")}`;

                }

            }

        }

    );

}


/* =========================================================
   SUCCESS MESSAGE
   ========================================================= */

function showReminderSuccess() {

    const oldMessage =
        document.querySelector(
            ".reminder-success"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const successMessage =
        document.createElement("div");


    successMessage.className =
        "reminder-success";


    successMessage.innerHTML = `

        ✓ ${t("reminderAddedSuccessfully")}

    `;


    const form =
        document.getElementById(
            "reminderForm"
        );


    if (form) {

        form.insertAdjacentElement(

            "afterend",

            successMessage

        );

    }


    setTimeout(() => {

        successMessage.remove();

    }, 3000);

}


/* =========================================================
   LANGUAGE CHANGE
   Reload dynamic reminder content
   ========================================================= */

document.addEventListener(

    "mindspaceLanguageChanged",

    () => {

        loadReminders();

    }

);


/* =========================================================
   LOAD REMINDERS WHEN PAGE OPENS
   ========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadReminders();

    }

);
/* =========================================================
   MINDSPACE - REMINDERS
   ========================================================= */


/* =========================================================
   ESCAPE HTML
   Prevents text from breaking the page layout
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


        /* -------------------------------------------------
           EMPTY STATE
           ------------------------------------------------- */

        if (!reminders || reminders.length === 0) {

            list.innerHTML = `

                <div class="empty-reminders">

                    <div style="font-size: 40px; margin-bottom: 10px;">
                        🔔
                    </div>

                    <strong>
                        No reminders yet
                    </strong>

                    <p style="margin-top: 8px;">
                        Add a reminder below to help
                        remember important things.
                    </p>

                </div>

            `;

            return;

        }


        /* -------------------------------------------------
           DISPLAY REMINDERS
           ------------------------------------------------- */

        list.innerHTML =
            reminders.map(item => {


                const completed =
                    Boolean(item.completed);


                const icon =
                    getReminderIcon(item.type);


                return `

                    <article
                        class="reminder-card"
                    >

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


                            <p
                                class="reminder-time"
                            >

                                ⏰
                                ${escapeHTML(
                                    item.reminder_time
                                )}

                            </p>


                            <p>

                                ${
                                    completed

                                        ? "✅ Completed"

                                        : `🔔 ${
                                            escapeHTML(
                                                item.type ||
                                                "Reminder"
                                            )
                                        }`
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

                                    ? "✓ Completed"

                                    : "✓ Mark Done"
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
                        font-size:40px;
                        margin-bottom:10px;
                    "
                >
                    ⚠️
                </div>

                <strong>
                    Unable to load reminders
                </strong>

                <p style="margin-top:8px;">

                    Please refresh the page
                    and try again.

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


        /* Reload the reminder list */

        await loadReminders();


    }
    catch (error) {

        console.error(
            "Complete reminder error:",
            error
        );


        alert(
            "We couldn't update this reminder. Please try again."
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


            /* ---------------------------------------------
               GET FORM VALUES
               --------------------------------------------- */

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
                    .getElementById("reminderDescription")
                    .value
                    .trim();


            /* ---------------------------------------------
               VALIDATION
               --------------------------------------------- */

            if (!title) {

                alert(
                    "Please enter a reminder title."
                );

                return;

            }


            if (!reminderTime) {

                alert(
                    "Please choose a reminder time."
                );

                return;

            }


            /* ---------------------------------------------
               PREPARE DATA
               --------------------------------------------- */

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


                /* -----------------------------------------
                   DISABLE BUTTON WHILE SAVING
                   ----------------------------------------- */

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        "Adding...";

                }


                /* -----------------------------------------
                   SEND TO FLASK
                   ----------------------------------------- */

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


                /* -----------------------------------------
                   CLEAR FORM
                   ----------------------------------------- */

                reminderForm.reset();


                /* -----------------------------------------
                   RELOAD REMINDERS
                   ----------------------------------------- */

                await loadReminders();


                /* -----------------------------------------
                   SUCCESS MESSAGE
                   ----------------------------------------- */

                showReminderSuccess();


            }
            catch (error) {

                console.error(
                    "Add reminder error:",
                    error
                );


                alert(
                    "We couldn't add the reminder. Please try again."
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
                        "✓&nbsp; Add Reminder";

                }

            }

        }

    );

}


/* =========================================================
   SUCCESS MESSAGE
   ========================================================= */

function showReminderSuccess() {

    /* Remove old success message */

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

        ✓ Reminder added successfully!

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


    /* Automatically remove message */

    setTimeout(() => {

        successMessage.remove();

    }, 3000);

}


/* =========================================================
   LOAD REMINDERS WHEN PAGE OPENS
   ========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadReminders();

    }

);
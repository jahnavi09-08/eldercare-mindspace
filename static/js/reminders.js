async function loadReminders() {
    const list = document.getElementById("reminderList");

    try {
        const response = await fetch("/api/reminders");

        if (!response.ok) {
            throw new Error("Could not load reminders");
        }

        const reminders = await response.json();

        if (!reminders.length) {
            list.innerHTML = `
                <div class="loading">
                    <h3>No reminders yet 🔔</h3>
                    <p>Add a reminder below to help remember important activities.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = reminders.map(item => `
            <article class="reminder-item ${item.completed ? "completed" : ""}">

                <div class="reminder-content">

                    <span class="difficulty-label">
                        ${item.type || "Reminder"}
                    </span>

                    <h3>${item.title}</h3>

                    ${
                        item.description
                            ? `<p>${item.description}</p>`
                            : ""
                    }

                    <div class="reminder-status">
                        ${
                            item.completed
                                ? "✓ Completed"
                                : "🔔 Reminder"
                        }
                    </div>

                </div>

                <div class="reminder-actions">

                    <div class="reminder-time">
                        ${item.reminder_time}
                    </div>

                    <button
                        class="secondary-button"
                        onclick="completeReminder(${item.id})"
                        ${item.completed ? "disabled" : ""}
                    >
                        ${
                            item.completed
                                ? "✓ Done"
                                : "Mark Done"
                        }
                    </button>

                </div>

            </article>
        `).join("");

    } catch (error) {

        console.error("Reminder loading error:", error);

        list.innerHTML = `
            <div class="loading">
                <h3>Unable to load reminders</h3>
                <p>
                    Please refresh the page and try again.
                </p>
            </div>
        `;
    }
}


// --------------------------------------
// MARK REMINDER AS COMPLETED
// --------------------------------------

async function completeReminder(id) {

    try {

        const response = await fetch(
            `/api/reminders/${id}/complete`,
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            throw new Error("Could not complete reminder");
        }

        await loadReminders();

    } catch (error) {

        console.error("Complete reminder error:", error);

        alert(
            "We couldn't update this reminder. Please try again."
        );
    }
}


// --------------------------------------
// ADD NEW REMINDER
// --------------------------------------

const reminderForm = document.getElementById("reminderForm");

if (reminderForm) {

    reminderForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const title =
                document.getElementById("reminderTitle").value.trim();

            const reminderTime =
                document.getElementById("reminderTime").value;

            const type =
                document.getElementById("reminderType").value;

            const description =
                document.getElementById("reminderDescription").value.trim();


            // Basic validation
            if (!title) {

                alert("Please enter a reminder title.");

                return;
            }

            if (!reminderTime) {

                alert("Please choose a reminder time.");

                return;
            }


            const payload = {

                title: title,

                reminder_time: reminderTime,

                type: type,

                description: description

            };


            try {

                const response = await fetch(
                    "/api/reminders",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(payload)
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        "Could not create reminder"
                    );

                }


                // Clear form
                event.target.reset();


                // Reload reminders
                await loadReminders();


                alert(
                    "Reminder added successfully! 🔔"
                );


            } catch (error) {

                console.error(
                    "Add reminder error:",
                    error
                );

                alert(
                    "We couldn't add the reminder. Please try again."
                );
            }

        }
    );

}


// Load reminders when page opens
loadReminders();
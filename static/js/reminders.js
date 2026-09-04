async function loadReminders() {
    const response = await fetch("/api/reminders");
    const reminders = await response.json();

    const list = document.getElementById("reminderList");

    if (!reminders.length) {
        list.innerHTML = `<div class="loading">No reminders yet.</div>`;
        return;
    }

    list.innerHTML = reminders.map(item => `
        <article class="reminder-item ${item.completed ? "completed" : ""}">
            <div>
                <span class="difficulty-label">${item.type}</span>
                <h3>${item.title}</h3>
                <p>${item.description || ""}</p>
            </div>
            <div>
                <div class="reminder-time">${item.reminder_time}</div>
                <button class="secondary-button"
                    onclick="completeReminder(${item.id})"
                    ${item.completed ? "disabled" : ""}>
                    ${item.completed ? "✓ Done" : "Mark Done"}
                </button>
            </div>
        </article>
    `).join("");
}

async function completeReminder(id) {
    await fetch(`/api/reminders/${id}/complete`, { method: "POST" });
    loadReminders();
}

document.getElementById("reminderForm").addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
        title: document.getElementById("reminderTitle").value,
        reminder_time: document.getElementById("reminderTime").value,
        type: document.getElementById("reminderType").value,
        description: document.getElementById("reminderDescription").value
    };

    const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        event.target.reset();
        loadReminders();
    }
});

loadReminders();

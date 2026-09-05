async function loadActivities() {
    const list = document.getElementById("activityList");

    try {
        const response = await fetch("/api/activities");

        if (!response.ok) {
            throw new Error("Unable to load activities.");
        }

        const activities = await response.json();

        if (!activities.length) {
            list.innerHTML = `
                <div class="loading">
                    <div style="font-size: 45px;">🌱</div>
                    <h3>No activities yet</h3>
                    <p>Add a simple daily activity to get started.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = activities.map(activity => `
            <article class="activity-card ${activity.completed ? "completed" : ""}">

                <div class="activity-icon">
                    ${getActivityIcon(activity.activity_name)}
                </div>

                <div>
                    <h2>${escapeHtml(activity.activity_name)}</h2>

                    <p>
                        🕐 ${escapeHtml(activity.scheduled_time)}
                        ${activity.duration
                            ? ` &nbsp; • &nbsp; ⏱ ${escapeHtml(activity.duration)}`
                            : ""}
                    </p>

                    ${
                        activity.completed
                            ? `<p class="activity-status">✓ Completed</p>`
                            : `<p class="activity-status">Ready for today</p>`
                    }
                </div>

                <div>
                    <button
                        class="secondary-button"
                        onclick="completeActivity(${activity.id})"
                        ${activity.completed ? "disabled" : ""}
                    >
                        ${activity.completed ? "✓ Done" : "Mark Done"}
                    </button>
                </div>

            </article>
        `).join("");

    } catch (error) {
        list.innerHTML = `
            <div class="loading">
                <h3>Unable to load activities</h3>
                <p>Please make sure the server is running.</p>
            </div>
        `;

        console.error(error);
    }
}


function getActivityIcon(name) {
    const text = name.toLowerCase();

    if (text.includes("walk")) return "🚶";
    if (text.includes("garden")) return "🌱";
    if (text.includes("read")) return "📖";
    if (text.includes("music")) return "🎵";
    if (text.includes("tea")) return "☕";
    if (text.includes("exercise")) return "🏃";
    if (text.includes("family")) return "👨‍👩‍👧";
    if (text.includes("pray")) return "🙏";
    if (text.includes("cook")) return "🍳";

    return "🌿";
}


async function completeActivity(id) {
    try {
        const response = await fetch(
            `/api/activities/${id}/complete`,
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            throw new Error("Could not complete activity.");
        }

        await loadActivities();

    } catch (error) {
        alert("Unable to complete this activity.");
        console.error(error);
    }
}


document
    .getElementById("activityForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const activityName =
            document.getElementById("activityName").value.trim();

        const duration =
            document.getElementById("activityDuration").value.trim();

        const scheduledTime =
            document.getElementById("activityScheduledTime").value;

        if (!activityName || !scheduledTime) {
            alert("Please enter an activity name and time.");
            return;
        }

        const payload = {
            activity_name: activityName,
            duration: duration,
            scheduled_time: scheduledTime
        };

        try {
            const response = await fetch("/api/activities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to add activity.");
            }

            this.reset();

            await loadActivities();

        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    });


function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


loadActivities();
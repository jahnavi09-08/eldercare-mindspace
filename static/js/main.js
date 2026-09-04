document.querySelectorAll(".moods button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".moods button").forEach(item => {
            item.style.transform = "";
        });

        button.style.transform = "scale(1.12)";
    });
});

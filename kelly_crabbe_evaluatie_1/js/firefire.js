// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
// Get the button
const sleepButton = document.getElementById("sleep-button");
const fireWindows = document.querySelectorAll(".fire-window");

// Check if the button exists to avoid errors
if (sleepButton) {
    sleepButton.addEventListener("click", () => {
    fireWindows.forEach((windowElement) => {
        windowElement.style.display = 'block';
    });
    sleepButton.style.opacity = '0';
    sleepButton.style.transition = 'opacity 0.5s ease-in-out';
    document.body.style.backgroundColor = "#313a4a";
    document.body.style.transition = 'background-color 0.5s ease-in-out';
    });
} else {
    console.error("Button with ID 'sleep-button' not found.");
}
});

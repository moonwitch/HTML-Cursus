// Get the theme switcher button element
const themeSwitcher = document.querySelector('#theme-switcher');

// Get the current theme from local storage, or default to 'light'
let currentTheme = localStorage.getItem('theme') || 'light';

// Set the initial theme
setTheme(currentTheme);

// Add a click event listener to the theme switcher button
themeSwitcher.addEventListener('click', () => {
    // Toggle the current theme
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    // Update the theme in local storage
    localStorage.setItem('theme', currentTheme);
    // Set the new theme
    setTheme(currentTheme);
});

// Function to set the theme
function setTheme(theme) {
    // Get the body element
    const body = document.querySelector('body');
    // Set the body class to the current theme
    body.className = theme;
}

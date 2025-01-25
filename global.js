console.log('ITS ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Create the color scheme switcher
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-selector">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`
);

// Function to set the color scheme
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  localStorage.colorScheme = colorScheme; // Save preference to localStorage

  // Update CSS variables for background and text colors
  if (colorScheme === 'light') {
    document.documentElement.style.setProperty('--background-color', '#ffffff');
    document.documentElement.style.setProperty('--text-color', '#000000');
    document.documentElement.style.setProperty('--border-color', 'oklch(50% 10% 200 / 40%)'); // Light border color
  } else if (colorScheme === 'dark') {
    document.documentElement.style.setProperty('--background-color', '#121212');
    document.documentElement.style.setProperty('--text-color', '#ffffff');
    document.documentElement.style.setProperty('--border-color', 'oklch(80% 3% 200 / 40%)'); // Dark border color
  }

  // Update nav styles immediately
  const nav = document.querySelector('nav');
  if (nav) {
    nav.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color');
    nav.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    nav.style.borderBottomColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
  }
}

// Set the initial value based on the OS color scheme or localStorage
const themeSelector = document.getElementById('theme-selector');
if (localStorage.colorScheme) {
  themeSelector.value = localStorage.colorScheme; // Set to saved preference
  setColorScheme(localStorage.colorScheme); // Apply the saved color scheme
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  themeSelector.value = "dark"; // Set to dark if OS is in dark mode
  setColorScheme("dark"); // Apply dark mode
} else {
  themeSelector.value = "light"; // Set to light if OS is in light mode
  setColorScheme("light"); // Apply light mode
}

// Add event listener to change the color scheme
themeSelector.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  setColorScheme(event.target.value); // Call the function to set the color scheme
});

// Ensure the nav bar is updated on page load
window.addEventListener('load', () => {
  const nav = document.querySelector('nav');
  if (nav) {
    nav.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color');
    nav.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    nav.style.borderBottomColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
  }
});

// Define the pages for the navigation menu
let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'https://github.com/parnapraveen', title: 'GitHub Profile' }, // External link
  { url: 'resume/index.html', title: 'Resume' }
];

// Create a new <nav> element and prepend it to the body
let nav = document.createElement('nav');
document.body.prepend(nav);

// Check if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Iterate over the pages to create links
for (let p of pages) {
  let url = p.url; // This should not have a leading slash
  let title = p.title;

  // Adjust the URL if we are not on the home page
  if (!ARE_WE_HOME && !url.startsWith('http')) {
    // Check if the URL starts with the GitHub Pages base URL
    if (url.startsWith('https://parnapraveen.github.io/')) {
      url = 'portfolio/' + url.substring('https://parnapraveen.github.io/'.length);
    } else {
      // Only prepend '../' if the URL does not start with a '/'
      url = url.startsWith('/') ? url : '../' + url;
    }
  }

  // Create the link element
  let a = document.createElement('a');
  a.href = url; // Set the href to the URL from the pages array
  a.textContent = title;

  // Highlight the current page link
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = '_blank';
  }

  // Append the link to the nav
  nav.append(a);
}
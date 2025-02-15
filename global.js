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
  { url: 'resume/index.html', title: 'Resume' },
  { url: 'meta/index.html', title: 'Meta' },
  { url: 'https://github.com/parnapraveen', title: 'GitHub Profile' }
];

// Create a new <nav> element and prepend it to the body
let nav = document.createElement('nav');
document.body.prepend(nav);

// Check if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

const BASE_PATH = '/portfolio/';

// Iterate over the pages to create links
for (let p of pages) {
  let url = p.url; // This should not have a leading slash
  let title = p.title;

  // Handle external links
  if (url.startsWith('http')) {
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    a.target = '_blank';
    nav.append(a);
    continue;
  }

  // Adjust the URL if we are not on the home page
  if (!ARE_WE_HOME) {
    // Prepend '/portfolio/' to internal page links
    //url = '/portfolio/' + url;
    //url = url.startsWith('/') ? url : '../' + url;
    url = '../' + url
  }

  // Create the link element
  let a = document.createElement('a');
  a.href = url; // Set the href to the URL from the pages array
  a.textContent = title;

  // Highlight the current page link
  a.classList.toggle(
    'current',
    a.pathname === location.pathname
  );

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = '_blank';
  }

  // Append the link to the nav
  nav.append(a);
}

// Function to fetch JSON data
export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      
      // Log the response object to inspect it
      console.log(response);

      // Parse the JSON data
      const data = await response.json();
      return data; // Return the parsed data

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

//fetchJSON('../lib/projects.json')

// Function to render project details
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Check if the containerElement is a valid DOM element
  if (!(containerElement instanceof HTMLElement)) {
      console.error('Invalid container element provided.');
      return;
  }

  // Clear existing content in the container
  containerElement.innerHTML = '';

  // Validate heading level
  const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const headingTag = validHeadingLevels.includes(headingLevel) ? headingLevel : 'h2';

  // Loop through each project and create an article element
  projects.forEach(project => {
      const article = document.createElement('article');

      // Create the content with year information
      article.innerHTML = `
          <${headingTag}>${project.title || 'Untitled Project'}</${headingTag}>
          <img src="${project.image || 'path/to/default/image.png'}" alt="${project.title || 'Project Image'}">
          <div class="project-content">
              <p class="project-description">${project.description || 'No description available.'}</p>
              <p class="project-year">${project.year ? `Year: ${project.year}` : 'Year not specified'}</p>
          </div>
      `;

      // Add CSS styles to the article element
      article.style.cssText = `
          display: grid;
          gap: 1rem;
      `;

      // Style the project content container
      const projectContent = article.querySelector('.project-content');
      if (projectContent) {
          projectContent.style.cssText = `
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
          `;
      }

      // Style the year text
      const yearElement = article.querySelector('.project-year');
      if (yearElement) {
          yearElement.style.cssText = `
              font-style: italic;
              color: var(--text-color);
              opacity: 0.8;
              margin-top: 0.5rem;
          `;
      }

      // Append the article to the container
      containerElement.appendChild(article);
  });
}
/*
const sampleProject = {
    title: "My Awesome Project",
    image: "path/to/image.png",
    description: "This project does amazing things."
};

const container = document.getElementById('projects-container'); // Ensure this element exists in your HTML
renderProjects(sampleProject, container, 'h3'); // Test with h3
renderProjects(sampleProject, container, 'h1'); // Test with h1
renderProjects(sampleProject, container, 'h4'); // Test with h4
*/

export async function fetchGitHubData(username) {
    // Fetch data from the GitHub API for the specified username
    return fetchJSON(`https://api.github.com/users/${username}`);
}
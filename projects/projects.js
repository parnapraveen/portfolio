import { fetchJSON, renderProjects } from '../global.js';

// Select the projects container
const projectsContainer = document.querySelector('.projects');

// Function to load and render projects
async function loadProjects() {
    try {
        const projects = await fetchJSON('../lib/projects.json');
        
        // Update the projects count in the title
        const projectsTitle = document.querySelector('.projects-title');
        if (Array.isArray(projects)) {
            projectsTitle.textContent = `${projects.length} Projects`; // Change format to "12 Projects"
        }

        // Check if projects is an array and has content
        if (Array.isArray(projects) && projects.length > 0) {
            renderProjects(projects, projectsContainer, 'h2');
        } else {
            // Handle empty projects array
            projectsContainer.innerHTML = '<p>No projects available.</p>'; // Placeholder message
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Call the function to load projects when the script runs
loadProjects(); 
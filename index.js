import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

// Function to load and render the latest projects
async function loadLatestProjects() {
    try {
        const projects = await fetchJSON('./lib/projects.json');
        const latestProjects = projects.slice(0, 3); // Get the first three projects

        // Select the projects container
        const projectsContainer = document.querySelector('.projects');

        // Render the latest projects
        renderProjects(latestProjects, projectsContainer, 'h2');
    } catch (error) {
        console.error('Error loading latest projects:', error);
    }
}

// Function to load GitHub data
async function loadGitHubData() {
    try {
        const githubData = await fetchGitHubData('parnapraveen'); // Replace with the desired GitHub username
        console.log('GitHub Data:', githubData); // Log the fetched GitHub data

        // Select the profile stats container
        const profileStats = document.querySelector('#profile-stats');

        // Check if the profileStats container exists
        if (profileStats) {
            profileStats.innerHTML = `
                <div class="stat">
                    <h3>FOLLOWERS</h3>
                    <p id="followers-count">${githubData.followers}</p>
                </div>
                <div class="stat">
                    <h3>FOLLOWING</h3>
                    <p id="following-count">${githubData.following}</p>
                </div>
                <div class="stat">
                    <h3>PUBLIC REPOS</h3>
                    <p id="repos-count">${githubData.public_repos}</p>
                </div>
                <div class="stat">
                    <h3>PUBLIC GISTS</h3>
                    <p id="gists-count">${githubData.public_gists}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
    }
}

// Call the function to load the latest projects when the script runs
loadLatestProjects();

// Call the function to load GitHub data when the script runs
loadGitHubData();

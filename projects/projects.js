import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Select the projects container
const projectsContainer = document.querySelector('.projects');

let query = '';
let allProjects = []; // Store all projects for filtering
let selectedIndex = -1; // Track selected wedge

// Function to process and render the pie chart
function renderPieChart(projectsGiven) {
    // Group projects by year and count them
    let rolledData = d3.rollups(
        projectsGiven,
        v => v.length,  // counting function
        d => d.year     // grouping function
    );

    // Convert rolled data to the format we need
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    // Create the arc generator
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    // Create color scale
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Create pie generator and generate the arc data
    let sliceGenerator = d3.pie().value(d => d.value);
    let arcData = sliceGenerator(data);

    // Clear existing content
    const svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();
    d3.select('.legend').selectAll('*').remove();

    // Add the paths to the SVG with click handlers
    arcData.forEach((d, idx) => {
        svg.append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(idx))
            .attr('class', idx === selectedIndex ? 'selected' : '')
            .attr('cursor', 'pointer')
            .attr('style', `--color: ${colors(idx)}`)
            .on('click', () => {
                // Toggle selection
                selectedIndex = selectedIndex === idx ? -1 : idx;
                
                // Update wedge styles
                svg.selectAll('path')
                    .attr('class', (_, i) => i === selectedIndex ? 'selected' : '');
                
                // Update legend styles
                d3.select('.legend')
                    .selectAll('li')
                    .attr('class', (_, i) => i === selectedIndex ? 'legend-item selected' : 'legend-item');
                
                // Filter projects based on selection
                if (selectedIndex === -1) {
                    // Show all projects when deselected
                    const filteredProjects = filterProjects(query);
                    updateVisualization(filteredProjects);
                } else {
                    // Filter by selected year
                    const selectedYear = data[selectedIndex].label;
                    const yearFilteredProjects = allProjects.filter(project => 
                        project.year === selectedYear && 
                        (query === '' || Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase()))
                    );
                    updateVisualization(yearFilteredProjects, false);
                }
            });
    });

    // Create legend with click handlers
    const legend = d3.select('.legend');
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('class', `legend-item ${idx === selectedIndex ? 'selected' : ''}`)
            .attr('style', `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .attr('cursor', 'pointer')
            .on('click', () => {
                // Simulate click on corresponding wedge
                svg.selectAll('path').nodes()[idx].dispatchEvent(new Event('click'));
            });
    });
}

// Function to filter projects based on search query
function filterProjects(query) {
    return allProjects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
}

// Function to update the visualization
function updateVisualization(filteredProjects, updatePieChart = true) {
    // Update the projects count in the title
    const projectsTitle = document.querySelector('.projects-title');
    projectsTitle.textContent = `${filteredProjects.length} Projects`;

    // Render the filtered projects
    renderProjects(filteredProjects, projectsContainer, 'h2');
    
    // Only update pie chart if specified (to avoid infinite loop)
    if (updatePieChart) {
        renderPieChart(filteredProjects);
    }
}

// Function to load and render projects
async function loadProjects() {
    try {
        allProjects = await fetchJSON('../lib/projects.json');
        
        if (Array.isArray(allProjects) && allProjects.length > 0) {
            // Create container div for visualization and search
            const container = document.querySelector('.container');
            const visualizationContainer = document.createElement('div');
            visualizationContainer.className = 'visualization-container';
            
            // Move the container inside visualization container
            container.parentNode.insertBefore(visualizationContainer, container);
            visualizationContainer.appendChild(container);
            
            // Add search input after the container
            const searchInput = document.createElement('input');
            searchInput.type = 'search';
            searchInput.className = 'searchBar';
            searchInput.setAttribute('aria-label', 'Search projects');
            searchInput.placeholder = '🔍 Search projects…';
            visualizationContainer.appendChild(searchInput);

            // Add event listener for search
            searchInput.addEventListener('input', (event) => {
                query = event.target.value;
                selectedIndex = -1; // Reset selection when searching
                const filteredProjects = filterProjects(query);
                updateVisualization(filteredProjects);
            });

            // Initial render with all projects
            updateVisualization(allProjects);
        } else {
            projectsContainer.innerHTML = '<p>No projects available.</p>';
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Add necessary styles for the pie chart interactivity
const style = document.createElement('style');
style.textContent = `
    #projects-pie-plot path {
        transition: 300ms;
    }
    
    #projects-pie-plot:has(path:hover) path:not(:hover) {
        opacity: 0.5;
    }
    
    .selected {
        --color: oklch(60% 45% 0) !important;
    }
    
    .selected:is(path) {
        fill: var(--color);
    }
`;
document.head.appendChild(style);

// Call the function to load projects when the script runs
loadProjects();
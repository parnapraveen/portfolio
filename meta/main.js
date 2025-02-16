let data = [];
let commits = []; // Declare commits as a global variable

// Declare scales globally
let xScale, yScale;
let brushSelection = null;

const width = 1000;
const height = 600;

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  processCommits(); // Call to process commits
  displayStats(); // Call to display stats
  createScatterplot(); // Call the scatterplot function
  console.log(commits); // Log the commits array to see the structure
}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/YOUR_REPO/commit/' + commit, // Replace YOUR_REPO with your actual repo name
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60, // Calculate hour as a decimal
        totalLines: lines.length, // Count of lines modified
      };

      // Define 'lines' as a hidden property
      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true, // Allows the property to be reconfigured
        writable: false,     // Prevents the property from being overwritten
        enumerable: false,   // Prevents the property from showing up in for...in loops
      });

      return ret;
    });
}

function displayStats() {
  // Create a container for the stats
  const statsContainer = d3.select('#stats').append('div').attr('class', 'stats-container');

  // Create the summary title
  statsContainer.append('h2').text('Summary').attr('class', 'summary-title');

  // Create a flexbox for the stats
  const statsFlex = statsContainer.append('div').attr('class', 'stats-flex');

  // Add total LOC
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').html('Total <abbr title="Lines of code">LOC</abbr>');
  statsFlex.append('div').attr('class', 'stat-value').text(data.length);

  // Add total commits
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Total commits');
  statsFlex.append('div').attr('class', 'stat-value').text(commits.length);

  // Add number of files
  const numberOfFiles = d3.group(data, d => d.file).size;
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Number of files');
  statsFlex.append('div').attr('class', 'stat-value').text(numberOfFiles);

  // Add maximum file length
  const maxFileLength = d3.max(data, d => d.length);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Maximum file length (lines)');
  statsFlex.append('div').attr('class', 'stat-value').text(maxFileLength);

  // Add average file length
  const averageFileLength = d3.mean(data, d => d.length);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Average file length (lines)');
  statsFlex.append('div').attr('class', 'stat-value').text(averageFileLength.toFixed(2)); // Fixed to 2 decimal places

  // Add maximum depth
  const maxDepth = d3.max(data, d => d.depth);
  statsFlex.append('div').attr('class', 'stat-item')
    .append('span').attr('class', 'stat-label').text('Maximum depth');
  statsFlex.append('div').attr('class', 'stat-value').text(maxDepth);
}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) {
    document.getElementById('commit-tooltip').style.display = 'none';
    return;
  }

  // Update tooltip content
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;

  // Show the tooltip
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.display = 'block';
  tooltip.style.top = `${d3.event.pageY + 10}px`;
  tooltip.style.left = `${d3.event.pageX + 10}px`;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 10}px`; // Offset for better visibility
  tooltip.style.top = `${event.clientY + 10}px`; // Offset for better visibility
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  // Convert breakdown to array and sort by language
  const breakdownArray = Array.from(breakdown);
  
  const formattedLanguages = breakdownArray.map(([language, count]) => {
    const proportion = count / lines.length;
    const formatted = d3.format('.1%')(proportion);
    return `<strong>${language}</strong>\n${count} lines\n(${formatted})`;
  }).join('          '); // Add spacing between language blocks
  
  container.innerHTML = formattedLanguages;

  return breakdown;
}

function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;
  
  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  
  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
  d3.selectAll('circle')
    .classed('selected', (d) => isCommitSelected(d))
    .style('fill', d => isCommitSelected(d) ? '#4a90e2' : '#D5006D'); // Blue when selected, pink when not
}

function createScatterplot() {
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Create the SVG element
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // Update global scales instead of creating new ones
  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  // Add gridlines
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Sort commits by total lines in descending order
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  // Draw the dots
  const dots = svg.append('g').attr('class', 'dots');

  // Calculate the range of edited lines across all commits
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

  // Create a square root scale for the radius
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill', '#D5006D') // Set the fill color to a darker pink shade
    .style('fill-opacity', 0.7)
    .on('mouseenter', function(event, d) {
        d3.select(this)
            .style('fill-opacity', 1)
            .style('cursor', 'pointer');
        updateTooltipContent(d);
        const tooltip = document.getElementById('commit-tooltip');
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
    })
    .on('mousemove', function(event) {
        const tooltip = document.getElementById('commit-tooltip');
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
    })
    .on('mouseleave', function() {
        d3.select(this)
            .style('fill-opacity', 0.7);
        updateTooltipContent({});
    });

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  // Call brushSelector at the end
  brushSelector();
}

// Function to set up the brush
function brushSelector() {
  const svg = document.querySelector('svg');
  
  // Create brush with event listener
  d3.select(svg).call(d3.brush().on('start brush end', brushed));

  // Raise dots and everything after overlay
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

// Load data when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

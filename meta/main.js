let data = [];

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // Convert line to a number
    depth: Number(row.depth), // Convert depth to a number
    length: Number(row.length), // Convert length to a number
    date: new Date(row.date + 'T00:00' + row.timezone), // Convert date to a Date object
    datetime: new Date(row.datetime), // Convert datetime to a Date object
  }));
}

// Load data when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  //console.log(data); // Log the data after loading
});

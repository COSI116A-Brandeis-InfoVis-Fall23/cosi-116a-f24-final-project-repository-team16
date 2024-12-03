// Set dimensions and create SVGs
const margin = {top: 20, right: 20, bottom: 50, left: 70};


function createSvg(selector) {
  return d3.select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
}

const timeline = createSvg("#timeline");
const barChart = createSvg("#barchart");

// Load and process data
d3.csv("data/SH_STA_MORT.csv", function(error, data) {
  if (error) throw error;
  
  // Get years from columns (excluding non-year columns)
  const years = Object.keys(data[0]).filter(key => !isNaN(key));
  
  // Create country dropdown
  const countries = data.map(d => d.GeoAreaName).sort();
  const dropdown = d3.select("#timeline")
    .insert("div", ":first-child")
    .append("select")
    .attr("id", "countryFilter")
    .style("margin-bottom", "10px");

  dropdown
    .selectAll("option")
    .data(["Global Average", ...countries])
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Setup scales
  const x = d3.scaleLinear()
    .domain(d3.extent(years, d => +d))
    .range([0, width]);

  const y = d3.scaleLinear()
    .range([height, 0]);

  // Create line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value));

  function updateVisualization() {
    const selectedCountry = dropdown.node().value;
    
    // Clear ALL existing elements first
    timeline.selectAll("*").remove();  // This ensures complete cleanup

    // Get data for selected country
    const countryData = data.find(d => d.GeoAreaName === selectedCountry);
    const timeData = years.map(year => ({
        year: +year,
        value: +countryData[year]
    }));

    // Reset scales with new data
    x.domain(d3.extent(years, d => +d));
    y.domain([0, d3.max(timeData, d => d.value) * 1.1]);

    // Create axes
    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.format("d"))
        .ticks(10);
    
    const yAxis = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(d => Math.round(d));

    // Add grid lines
    timeline.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    // Add X axis
    timeline.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "12px");

    // Add Y axis
    timeline.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "12px");

    // Draw line
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value));

    timeline.append("path")
        .datum(timeData)
        .attr("fill", "none")
        .attr("stroke", "#2a9d8f")
        .attr("stroke-width", 2.5)
        .attr("d", line);

    // Add title showing current country
    timeline.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(`Maternal Mortality Ratio - ${selectedCountry}`);
  }

  // Add change listener to dropdown
  dropdown.on("change", updateVisualization);

  // Initial visualization
  updateVisualization();
});

function drawAxes(svg, x, y, xLabel, yLabel) {
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g").call(d3.axisLeft(y));

  // Add labels
  svg.append("text")
    .attr("transform", `translate(${width/2}, ${height + 40})`)
    .style("text-anchor", "middle")
    .text(xLabel);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -(height/2))
    .style("text-anchor", "middle")
    .text(yLabel);
}

function drawLine(svg, data, x, y) {
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.average));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#2a9d8f")
    .attr("stroke-width", 3)
    .attr("d", line);
}

function addStyling(timeline, barChart) {
  // Add hover effects
  barChart.selectAll(".bar")
    .on("mouseover", function() { d3.select(this).attr("fill", "#264653"); })
    .on("mouseout", function() { d3.select(this).attr("fill", "#2a9d8f"); });

  // Style text
  timeline.selectAll(".axis text").style("font-size", "10px");
  barChart.selectAll(".axis text").style("font-size", "10px");

  // Style brush
  timeline.select(".brush rect.selection")
    .attr("fill", "#264653")
    .attr("fill-opacity", 0.3);
}
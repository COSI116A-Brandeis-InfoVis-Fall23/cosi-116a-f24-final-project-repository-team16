console.log("Worldmap.js is loading");
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing world map...");
    
    // Set dimensions
    const margin = {top: 20, right: 20, bottom: 20, left: 20};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select("#world-map")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create projection
    const projection = d3.geoMercator()
        .scale(120)
        .translate([width / 2, height / 1.5]);

    // Create path generator
    const path = d3.geoPath()
        .projection(projection);

    // Load world map data using local file
    d3.json("data/world.geojson").then(function(worldData) {
        svg.selectAll("path")
            .data(worldData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "#69b3a2")
            .style("stroke", "#fff")
            .style("stroke-width", "0.5")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("fill", "#ffcc00")
                    .style("cursor", "pointer");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("fill", "#69b3a2");
            })
            .on("click", function(event, d) {
                const countryName = d.properties.name;
                const select = document.getElementById('countryFilter');
                if (select && select.querySelector(`option[value="${countryName}"]`)) {
                    select.value = countryName;
                    select.dispatchEvent(new Event('change'));
                }
            });
    }).catch(function(error) {
        console.error("Error loading map:", error);
        d3.select("#world-map")
            .append("div")
            .style("color", "red")
            .style("padding", "20px")
            .text("Error loading map data");
    });
});


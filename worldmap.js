const width = 1000
const height = 400
// Create SVG element
const svg = d3.select("#world-map")

    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "#f0f0f0");

// Create a projection for the world map
const projection = d3.geoNaturalEarth1()
    .scale(150)
    .translate([width / 2, height / 2]);

// Create a path generator
const path = d3.geoPath().projection(projection);

// Fetch and render the GeoJSON data
fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(response => response.json())
    .then(data => {
        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#69b3a2")
            .attr("stroke", "#333")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "#ffcc00");
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("fill", "#69b3a2");
            })
            .on("click", function (event, d) {
                alert(`You clicked on: ${d.properties.name}`);
            });
    })
    .catch(error => {
        console.error("Error loading the map data:", error);
    });


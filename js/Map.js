import * as d3 from 'd3';
import { feature } from 'topojson-client';

// Dimensions for the SVG
const width = 960;
const height = 600;

// Create an SVG element in the map container
const svg = d3.select("#worldmap")
    .attr("width", width)
    .attr("height", height);

// Set up the projection and path for the world map
const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Load the world map and data
d3.json("https://unpkg.com/world-atlas/world/110m.json").then(world => {
    svg.selectAll("path")
        .data(feature(world, world.objects.countries).features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#ccc");  // Default fill

    // Load the health data
    d3.csv("data/SH_STA_MORT.csv").then(data => {
        // Create a year select dropdown dynamically
        const years = Array.from(new Set(data.map(d => d.Year))).sort();
        d3.select("#yearSelect").selectAll("option")
            .data(years)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        // Update map on year select change
        d3.select("#yearSelect").on("change", function() {
            const year = d3.select(this).property("value");
            updateMapColors(year, data);
        });

        function updateMapColors(year, data) {
            const yearData = data.filter(d => d.Year === year);
            const colorScale = d3.scaleSequential(d3.interpolateReds)
                .domain(d3.extent(yearData, d => +d.Value));

            svg.selectAll("path")
                .style("fill", d => {
                    const countryData = yearData.find(c => c.CountryCode === d.id);
                    return countryData ? colorScale(+countryData.Value) : "#ccc";
                });
        }

        // Initially update the map colors
        updateMapColors(years[0], data);
    });
});

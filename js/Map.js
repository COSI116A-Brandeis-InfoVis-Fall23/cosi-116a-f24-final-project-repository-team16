console.log("Worldmap.js is loading");
document.addEventListener('DOMContentLoaded', function () {
    console.log("Initializing world map...");

    // Set dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
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

    // Tooltip setup
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("display", "none")
        .style("background", "rgba(255, 255, 255, 0.9)")
        .style("border", "1px solid #ddd")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 0 5px rgba(0, 0, 0, 0.2)");

    // Load world map data and SDG score data
    Promise.all([
        d3.json("data/world.geojson"),
        d3.csv("data/sdg_score.csv")
    ]).then(([worldData, sdgData]) => {
        // Create a map of country names to SDG scores and rankings
        const sdgMap = new Map(sdgData.map(d => [
            d.Country,
            { score: +d["SDG Index Score"], rank: +d["SDG Index Rank"] }
        ]));

        // Create a monochromatic blue color scale based on SDG scores
        const colorScale = d3.scaleLinear()
            .domain(d3.extent(sdgData, d => +d["SDG Index Score"])) // Min and max SDG scores
            .range(["#cce5ff", "#0047ab"]); // Light blue to dark blue

        // Draw the map
        svg.selectAll("path")
            .data(worldData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", d => {
                const data = sdgMap.get(d.properties.name);
                return data ? colorScale(data.score) : "#ccc"; // Default color for missing data
            })
            .style("stroke", "#fff")
            .style("stroke-width", "0.5")
            .on("mouseover", function (event, d) {
                const countryName = d.properties.name;
                const data = sdgMap.get(countryName);

                d3.select(this)
                    .style("stroke", "#000")
                    .style("stroke-width", "1.5")
                    .style("cursor", "pointer");

                // Show tooltip
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`)
                    .style("display", "inline-block")
                    .html(`
                        <strong>${countryName}</strong><br>
                        SDG Score: ${data ? data.score : "N/A"}<br>
                        Rank: ${data ? data.rank : "N/A"}
                    `);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("stroke", "#fff")
                    .style("stroke-width", "0.5");

                // Hide tooltip
                tooltip.style("display", "none");
            })
            .on("click", function (event, d) {
                const countryName = d.properties.name;
                const select = document.getElementById('countryFilter');
                if (select && select.querySelector(`option[value="${countryName}"]`)) {
                    select.value = countryName;
                    select.dispatchEvent(new Event('change'));
                }
            });
    }).catch(function (error) {
        console.error("Error loading data:", error);
        d3.select("#world-map")
            .append("div")
            .style("color", "red")
            .style("padding", "20px")
            .text("Error loading map data or SDG score data");
    });
});

const svg = d3 .select("#my_dataviz") .append("svg") .attr("width", this.width +
margin.left + margin.right) .attr("height", this.height + margin.top +
margin.bottom) .append("g") .attr("transform", `translate(${margin.left},
${margin.top})`);
d3.csv("../../data/globalterrorismdb_0718dist.csv").then((data) => { const
counts = { Iraq: 0, Pakistan: 0, Other: 0 }; data.forEach((row) => { const
country_txt = row.country_txt; if (country_txt == "Iraq") { counts["Iraq"]++; }
else if (country_txt == "Pakistan") { counts["Pakistan"]++; } else {
counts["Other"]++; } }); const result =
Object.entries(counts).map(([country_txt, count]) => ({ country_txt, count, }));

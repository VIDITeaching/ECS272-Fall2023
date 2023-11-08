import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./App.css";
import ScatterPlot from "./Components/ScatterPlot";
import BarChart from "./Components/BarChart";
import SankeyChart from "./Components/SankeyChart";
import StackedBarChart from "./Components/StackedBarChart";

function App() {
  const [scatterData, setScatterData] = useState([]);
  const [stackedBarData, setStackedBarData] = useState([]);
  const [sankeyData, setSankeyData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    d3.csv("src/data/mxmh_survey_results.csv").then((loadedData) => {
      // Remove rows with any null values
      const cleanedData = loadedData.filter((row) => {
        return !Object.values(row).some(
          (value) => value === null || value === ""
        );
      });

      setScatterData(cleanedData);
      // Aggregate the data for the bar chart
      // bar
      const genres = [
        "Classical",
        "Country",
        "EDM",
        "Folk",
        "Gospel",
        "Hip hop",
        "Jazz",
        "K pop",
        "Latin",
        "Lofi",
        "Metal",
        "Pop",
        "R&B",
        "Rap",
        "Rock",
        "Video game music",
      ];
      const aggregatedData = {};
      genres.forEach((genre) => {
        aggregatedData[genre] = {
          Never: 0,
          Rarely: 0,
          Sometimes: 0,
          "Very frequently": 0,
        };
      });

      cleanedData.forEach((entry) => {
        genres.forEach((genre) => {
          const frequency = entry[`Frequency [${genre}]`];
          aggregatedData[genre][frequency]++;
        });
      });

      const stackedBarData = genres.map((genre) => {
        return {
          genre: genre,
          Never: aggregatedData[genre]["Never"],
          Rarely: aggregatedData[genre]["Rarely"],
          Sometimes: aggregatedData[genre]["Sometimes"],
          "Very frequently": aggregatedData[genre]["Very frequently"],
        };
      });

      setStackedBarData(stackedBarData);
      //data for sankey

      function processSankeyData(data) {
        const nodes = [];
        const links = [];
        const nodeNames = [];

        data.forEach((d) => {
          const serviceSource = d["Primary streaming service"];
          const genreTarget = d["Fav genre"];
          const healthIndicator = d["Mental Health"];

          // Add the service source node if it doesn't exist
          if (!nodeNames.includes(serviceSource)) {
            nodes.push({ name: serviceSource });
            nodeNames.push(serviceSource);
          }

          // Add the genre target node if it doesn't exist
          if (!nodeNames.includes(genreTarget)) {
            nodes.push({ name: genreTarget });
            nodeNames.push(genreTarget);
          }

          // Add the health indicator node if it doesn't exist
          if (!nodeNames.includes(healthIndicator)) {
            nodes.push({ name: healthIndicator });
            nodeNames.push(healthIndicator);
          }

          // Create or update the link between service and genre
          const serviceIndex = nodeNames.indexOf(serviceSource);
          const genreIndex = nodeNames.indexOf(genreTarget);
          const existingServiceGenreLink = links.find(
            (l) => l.source === serviceIndex && l.target === genreIndex
          );

          if (existingServiceGenreLink) {
            existingServiceGenreLink.value += 1;
          } else {
            links.push({ source: serviceIndex, target: genreIndex, value: 1 });
          }

          // Create or update the link between genre and health indicator
          const healthIndex = nodeNames.indexOf(healthIndicator);
          const existingGenreHealthLink = links.find(
            (l) => l.source === genreIndex && l.target === healthIndex
          );

          if (existingGenreHealthLink) {
            existingGenreHealthLink.value += 1;
          } else {
            links.push({ source: genreIndex, target: healthIndex, value: 1 });
          }
        });

        return { nodes, links };
      }

      const processedData = processSankeyData(cleanedData);

      setSankeyData(processedData);
    });
  }, []);

  return (
    <div>
      {scatterData.length > 0 && stackedBarData.length > 0 ? ( // corrected this line
        <>
          <div className="container">
            <ScatterPlot data={scatterData} />
            <StackedBarChart data={stackedBarData} />
          </div>
          <SankeyChart data={sankeyData} />
          <div className="textbox">
            <h2
              style={{
                fontFamily: "Montserrat-Bold",
                fontWeight: 900,
                fontSize: 35,
                background:
                  "linear-gradient(to right, #66c2a5, #fc8d62, #8da0cb, #e78ac3, #66c2a5, #fc8d62, #8da0cb, #e78ac3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              Music and Mental Health
            </h2>

            <p style={{ fontSize: 12, textAlign: "justify" }}>
              Music positively impacts mental health, offering solace and
              elevating moods. <strong>Music Therapy (MT)</strong> leverages
              music to enhance mental well-being, releasing "happy" hormones
              like oxytocin.{" "}
              <strong>
                <br /> In this dashboard, you can:
                <br /> 1. Scatter Plot (Overview):{" "}
              </strong>{" "}
              Select different streaming platforms from dropdown menu, brushing
              and zooming using bounded box
              <br /> <strong>2. Sankey Diagram: </strong>Hover over each node
              and link to see the count, click on the nodes to highlight the
              path of data flow
              <br />
              <strong> 3. Stacked Barchart: </strong>Select different views from
              drop down menu
            </p>
          </div>
          {/* <div className="container-next"></div> */}
        </>
      ) : (
        "Loading..."
      )}
    </div>
  );
}

export default App;

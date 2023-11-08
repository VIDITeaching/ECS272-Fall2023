// HeatmapContainer.js
import React from "react";
import Heatmap from "./Heatmap";

const HeatmapContainer = ({ data }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <Heatmap data={data} attribute="Anxiety" />
      <Heatmap data={data} attribute="Depression" />
      <Heatmap data={data} attribute="Insomnia" />
      <Heatmap data={data} attribute="OCD" />
    </div>
  );
};

export default HeatmapContainer;

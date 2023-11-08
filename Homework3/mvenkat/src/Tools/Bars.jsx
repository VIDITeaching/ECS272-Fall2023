import React from "react";
import * as d3 from "d3";

function Bars({ data, height, scaleX, scaleY }) {
  const graphData = data.map((item) => ({
    age: item.Age,
    cgpa: item["What is your CGPA?"],
  }));

  console.log(graphData);

  return (
    <g>
      {graphData.map(({ age, cgpa }) => (
        <rect
          key={`bar-${cgpa}`}
          x={scaleX(cgpa)}
          y={scaleY(age)}
          width={scaleX.bandwidth()}
          height={height - scaleY(age)}
          fill="white"
        />
      ))}
    </g>
  );
}

export default Bars;

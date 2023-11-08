import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { axisBottom } from "d3-axis";

function AxisBottom({ scale, transform }) {
  const ref = useRef(null);

  useEffect(() => {
    const xAxis = axisBottom(scale);
    select(ref.current).call(xAxis);
  }, [scale]);

  return <g ref={ref} transform={transform}></g>;
}

export default AxisBottom;

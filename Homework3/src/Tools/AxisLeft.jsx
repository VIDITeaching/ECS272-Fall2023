import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { axisLeft } from "d3-axis";

function AxisLeft({ scale }) {
  const ref = useRef(null);

  useEffect(() => {
    const yAxis = axisLeft(scale);
    select(ref.current).call(yAxis);
  }, [scale]);

  return <g ref={ref}></g>;
}

export default AxisLeft;

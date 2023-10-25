import { useMemo } from "react";
import { ScaleLinear } from "d3";

type AxisLeftProps = {
  yScale: ScaleLinear<number, number>;
  pixelsPerTick: number;
  width: number;
};

const TICK_LENGTH = 10;

export const AxisLeft = ({ yScale, pixelsPerTick, width }: AxisLeftProps) => {
  const range = yScale.range();

  const ticks = useMemo(() => {
    const height = range[0] - range[1];
    const numberOfTicksTarget = Math.floor(height / pixelsPerTick);

    return yScale.ticks(numberOfTicksTarget).map((value) => ({
      value,
      yOffset: yScale(value),
    }));
  }, [yScale]);

  let isFirst = true;
  return (
    <>
      {/* Ticks and labels */}
      {ticks.map(({ value, yOffset }, index: number) => {

        return (
          <g key={value} transform={`translate(0, ${yOffset})`}>
            <line
              x1={-TICK_LENGTH}
              x2={width + TICK_LENGTH}
              stroke="#D2D7D3"
              strokeWidth={0.5}
              shapeRendering={"crispEdges"}
            />
            <text
              key={value}
              style={{
                fontSize: "10px",
                textAnchor: "middle",
                transform:  `translateX(-${index == ticks.length - 1 ? 36 : 20}px)`,
                fill: "#D2D7D3",
              }}
            >
              {index == ticks.length - 1 ? `Attack ${value}` : value}
            </text>
          </g>
        )
      })}
    </>
  );
};

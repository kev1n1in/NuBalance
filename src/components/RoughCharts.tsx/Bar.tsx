import React, { useEffect, useRef } from "react";
import { Bar } from "rough-viz";
import styled from "styled-components";

interface RoughBarChartProps {
  data: { labels: string[]; values: number[] };
}

const RoughBarChart: React.FC<RoughBarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.innerHTML = "";
      const processedData = {
        labels: data.labels.slice().reverse(),
        values: data.values.map((value) => Math.max(0, value)).reverse(),
      };

      new Bar({
        element: `#${chartRef.current.id}`,
        data: processedData,
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        xLabel: "Date",
        yLabel: "Kg",
        roughness: 2,
        color: "skyblue",
        margin: { top: 50, right: 50, bottom: 120, left: 70 },
      });
    }
    console.log("我在動");
    return () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = "";
      }
    };
  }, [data]);

  return (
    <ChartContainer>
      <ChartWrapper ref={chartRef} id="chart" />
    </ChartContainer>
  );
};

const ChartContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 0;
  padding-bottom: 50%;
  position: relative;
`;

const ChartWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export default RoughBarChart;

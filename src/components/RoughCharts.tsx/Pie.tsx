import React, { useEffect, useRef } from "react";
import { Pie } from "rough-viz";
import styled from "styled-components";

interface RoughPieChartProps {
  data: { labels: string[]; values: number[] };
}

const RoughPieChart: React.FC<RoughPieChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.innerHTML = "";

      const width = chartRef.current.clientWidth;
      const height = chartRef.current.clientHeight;

      new Pie({
        element: `#${chartRef.current.id}`,
        data: {
          labels: data.labels,
          values: data.values,
        },
        roughness: 2,
        colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        stroke: "black",
        strokeWidth: 2,
        width: width,
        height: height,
        margin: { top: 40, right: 20, bottom: 20, left: 20 },
        legendPosition: "right",
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = "";
      }
    };
  }, [data]);

  return (
    <ChartContainer>
      <ChartWrapper ref={chartRef} id="pie-chart" />
    </ChartContainer>
  );
};

const ChartContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  overflow: hidden;
`;

const ChartWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-top: 75px;
`;

export default RoughPieChart;

import React, { useEffect, useRef } from "react";
import { Pie } from "rough-viz";
import styled from "styled-components";

interface RoughPieChartProps {
  data: { labels: string[]; values: number[] };
}

const RoughPieChart: React.FC<RoughPieChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const adjustPieChart = () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = "";

        const width = chartRef.current.clientWidth;
        const height = chartRef.current.clientHeight;

        let bottomMargin, translateY, viewBoxY;

        if (window.innerWidth < 360) {
          bottomMargin = 0;
          translateY = 0;
          viewBoxY = 10;
        } else if (window.innerWidth < 480) {
          bottomMargin = 0;
          translateY = 0;
          viewBoxY = 200;
        } else if (window.innerWidth < 768) {
          bottomMargin = 20;
          translateY = 0;
          viewBoxY = 10;
        } else if (window.innerWidth < 1000) {
          bottomMargin = 120;
          translateY = -50;
          viewBoxY = -50;
        } else if (window.innerWidth < 1280) {
          bottomMargin = 0;
          translateY = 100;
          viewBoxY = 50;
        } else {
          bottomMargin = 80;
          translateY = 200;
          viewBoxY = 50;
        }

        const pieChart = new Pie({
          element: `#${chartRef.current.id}`,
          data: {
            labels: data.labels,
            values: data.values,
          },
          roughness: 2,
          colors: ["#36A2EB", "#FFCE56", "#4BC0C0"],
          stroke: "black",
          strokeWidth: 2,
          width: width,
          height: height,
          margin: { top: 40, right: 20, bottom: bottomMargin, left: 20 },
        });

        setTimeout(() => {
          if (chartRef.current) {
            const svg = chartRef.current.querySelector("svg");
            const roughPieChart =
              chartRef.current.querySelector("g.roughpie-chart");

            if (roughPieChart && svg) {
              roughPieChart.setAttribute(
                "transform",
                `translate(-40, ${translateY})`
              );
              const viewBoxValue = `0 ${viewBoxY} ${width} ${height}`;
              svg.setAttribute("viewBox", viewBoxValue);
              svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
            }
          }
        }, 100);
      }
    };

    window.addEventListener("resize", adjustPieChart);

    adjustPieChart();

    return () => {
      window.removeEventListener("resize", adjustPieChart);
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
  @media (max-width: 768px) {
    padding-top: 0;
  }
`;

export default RoughPieChart;

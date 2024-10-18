import React, { useEffect, useRef } from "react";
import { Pie } from "rough-viz";
import styled from "styled-components";

interface RoughPieChartProps {
  data: { labels: string[]; values: number[] };
}

const RoughPieChart: React.FC<RoughPieChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const calculatePercentages = (values: number[]) => {
    const total = values.reduce((acc, value) => acc + value, 0);
    return values.map((value) => ((value / total) * 100).toFixed(2));
  };

  useEffect(() => {
    const adjustPieChart = () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = "";

        const width = chartRef.current.clientWidth;
        const height = chartRef.current.clientHeight;

        let bottomMargin,
          translateX,
          translateY,
          viewBoxX,
          viewBoxY,
          legendTranslateX,
          legendTranslateY,
          legendScale;

        if (window.innerWidth < 360) {
          bottomMargin = 0;
          translateX = -50;
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = -100;
          legendTranslateX = -1000;
          legendTranslateY = -30;
          legendScale = 1;
        } else if (window.innerWidth < 480) {
          bottomMargin = 0;
          translateX = -50;
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = -100;
          legendTranslateX = 100;
          legendTranslateY = -30;
          legendScale = 1;
        } else if (window.innerWidth < 768) {
          bottomMargin = 20;
          translateX = -50;
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = -100;
          legendTranslateX = 100;
          legendTranslateY = -30;
          legendScale = 1;
        } else if (window.innerWidth < 1000) {
          bottomMargin = 120;
          translateX = -100;
          translateY = -50;
          viewBoxX = -100;
          viewBoxY = -100;
          legendTranslateX = -400;
          legendTranslateY = -30;
          legendScale = 1.5;
        } else if (window.innerWidth < 1280) {
          bottomMargin = 0;
          translateX = -1000;
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = -100;
          legendTranslateX = -800;
          legendTranslateY = -30;
          legendScale = 2;
        } else {
          bottomMargin = 0;
          translateX = -100;
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = -100;
          legendTranslateX = -1100;
          legendTranslateY = -30;
          legendScale = 2;
        }

        const percentageValues = calculatePercentages(data.values);

        const pieChart = new Pie({
          element: `#${chartRef.current.id}`,
          data: {
            labels: data.labels,
            values: percentageValues,
          },
          roughness: 2,
          colors: ["#36A2EB", "#FFCE56", "#4BC0C0"],
          stroke: "black",
          strokeWidth: 2,
          width: width,
          height: height,
          tooltipFontSize: "1.2rem",
          margin: { top: 0, right: 20, bottom: 100, left: 20 },
        });

        setTimeout(() => {
          if (chartRef.current) {
            const svg = chartRef.current.querySelector("svg");
            const roughPieChart =
              chartRef.current.querySelector("g.roughpie-chart");

            if (roughPieChart && svg) {
              roughPieChart.setAttribute(
                "transform",
                `translate(${translateX}, ${translateY})`
              );
              const viewBoxValue = `${viewBoxX} ${viewBoxY} ${
                width + 200
              } ${height}`;
              svg.setAttribute("viewBox", viewBoxValue);
              svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
              const legend = svg.querySelector("g.roughpie-chart");
              if (legend) {
                legend.setAttribute(
                  "transform",
                  `translate(${legendTranslateX}, ${legendTranslateY}) scale(${legendScale})`
                );
              }
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
  padding-bottom: 55%;
  position: relative;
`;

const ChartWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    padding-top: 0;
  }
`;

export default RoughPieChart;

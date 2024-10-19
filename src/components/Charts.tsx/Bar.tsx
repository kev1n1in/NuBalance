import { useEffect, useRef } from "react";
import { Bar } from "rough-viz";
import styled from "styled-components";
import { RoughBarChartProps } from "../../types/charts";

const RoughBarChart = ({ data }: RoughBarChartProps) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const adjustLabels = () => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = chartRef.current.clientHeight;
      const labels = chartRef.current.querySelectorAll("text.labelText");

      labels.forEach((label) => {
        const svgLabel = label as SVGTextElement;
        const transform = label.getAttribute("transform");
        const fontSize = Math.max(containerWidth * 0.03, 16);

        svgLabel.style.fontSize = `${fontSize}px`;

        if (transform && transform.includes("rotate(-90)")) {
          label.setAttribute("y", `-${containerWidth * 0.1}`);
        } else {
          const xPos = containerWidth * 0.5;
          label.setAttribute("x", `${xPos * 0.8}`);
          label.setAttribute("y", `${containerHeight * 0.87}`);
        }
      });
    }
  };

  const renderChart = () => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = chartRef.current.clientHeight;
      chartRef.current.innerHTML = "";
      const processedData = {
        labels: data.labels.slice().reverse(),
        values: data.values.map((value) => Math.max(0, value)).reverse(),
      };
      const margin = {
        top: containerHeight * 0.1,
        right: containerWidth * 0.05,
        bottom: containerHeight * 0.2,
        left: containerWidth * 0.1,
      };

      new Bar({
        element: `#${chartRef.current.id}`,
        data: processedData,
        width: containerWidth,
        height: containerHeight * 1.2,
        xLabel: "Date",
        yLabel: "Kg",
        roughness: 2,
        color: "skyblue",
        margin,
      });

      setTimeout(() => {
        adjustLabels();
      }, 100);
    }
  };

  useEffect(() => {
    renderChart();

    const handleResize = () => {
      renderChart();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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
  padding-bottom: 55%;
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

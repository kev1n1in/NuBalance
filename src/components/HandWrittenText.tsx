import { useState, useEffect } from "react";
import opentype from "opentype.js";
import { RoughSVG } from "react-rough-fiber";

interface HandwrittenTextProps {
  text: string | number;
  fill?: string;
  roughness?: number;
  fillStyle?: string;
  color?: string;
  fontSize?: number;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
}

const HandwrittenText = ({
  text,
  roughness = 0.1,
  fill = "gray",
  fillStyle = "hachure",
  color = "black",
  fontSize = 100,
  width = "100%",
  height = "100%",
}: HandwrittenTextProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [viewBoxWidth, setViewBoxWidth] = useState(0);
  const [viewBoxHeight, setViewBoxHeight] = useState(0);

  useEffect(() => {
    let ignore = false;
    const loadFont = async () => {
      try {
        const res = await fetch(
          "https://fonts.gstatic.com/s/caveat/v17/WnznHAc5bAfYB2QRah7pcpNvOx-pjcB9eIWpZw.woff"
        );
        const buffer = await res.arrayBuffer();
        if (ignore) return;
        const font = opentype.parse(buffer);
        const fontPaths = font
          .getPaths(text, 0, fontSize, fontSize)
          .map((path: { toPathData: () => string }) => path.toPathData());
        const textWidth = font.getAdvanceWidth(text, fontSize);
        const textHeight = fontSize * 1.2;
        setPaths(fontPaths);
        setViewBoxWidth(textWidth + fontSize * 0.2);
        setViewBoxHeight(textHeight);
      } catch (error) {
        console.error("Error loading font:", error);
      }
    };
    loadFont();
    return () => {
      ignore = true;
    };
  }, [text, fontSize]);

  return (
    <RoughSVG style={{ color }} options={{ roughness, fillStyle }}>
      <svg
        style={{
          width: width,
          height: height,
        }}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        fill={fill}
        stroke={color}
      >
        {paths.map((d, i) => (
          <path d={d} key={i} />
        ))}
      </svg>
    </RoughSVG>
  );
};

export default HandwrittenText;

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import styled from "styled-components";
import centerImg from "./circle.png";
import cubeImg from "./Cube.png";
import standingMan from "./standingMan.png";
import avocado from "./avocado.png";

const GSAPWrapper: React.FC = () => {
  const wordRefs = useRef([]);
  const isCentered = useRef(false);
  const centerImgRef = useRef(null);
  const planetContainerRef = useRef(null);
  const outerCircleRef = useRef(null);
  const innerCircleRef = useRef(null);
  const InnerCubeImgRef = useRef(null);
  const OuterCubeImgRef = useRef(null);
  const ellipseRef = useRef(null);
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  const isAnimating = useRef(false); // 用於鎖定動畫進行狀態
  const [scrollLocked, setScrollLocked] = useState(false);
  // 定義四個單字
  const nutritionWords = ["N", "U", "T", "R", "I", "T", "I", "O", "N"];
  const balanceWords = ["B", "A", "L", "A", "N", "C", "E"];

  // 定義Balance的字母
  const initialFontSizes = [
    "2vw", // 左下角Ｎ
    "2.5vw",
    "2.3vw",
    "2.7vw",
    "3vw",
    "1.5vw",
    "2vw",
    "2.5vw",
    "3vw",
    "2vw",
    "2.3vw",
    "2.7vw",
    "3vw",
    "1.5vw",
    "2vw",
    "2.5vw",
    "3vw",
  ];

  const finalFontSizes = [
    "7vw", // 左下角Ｎ
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
    "7vw",
  ];

  const initialRotations = [30, -45, 60, -90, 45, -30, 15, -60, 90];
  const finalRotations = Array(15).fill(0);

  const positions = [
    { x: -500, y: centerY - 300 }, // 左下角Ｎ
    { x: 100, y: 100 }, // 左上角U
    { x: -100, y: -100 }, // 左下角T
    { x: 300, y: -300 }, // 左上角R
    { x: 200, y: windowHeight + 100 }, // 正中間I
    { x: 100, y: -200 }, // 右T
    { x: centerX, y: centerY }, // 右下角I
    { x: centerX - 200, y: -300 }, // 右下角O
    { x: centerX, y: -100 }, // 右上角N
    { x: -100, y: 300 }, // 左上角B
    { x: centerY, y: windowHeight + 100 }, // 上Ａ
    { x: centerX - 300, y: centerY - 200 }, // 左Ｌ
    { x: windowWidth, y: windowHeight - 300 }, // 左下Ａ
    { x: centerX, y: windowHeight - 100 }, // 右上角小N
    { x: centerX + 100, y: -100 }, // 左中C
    { x: centerX, y: centerY }, // 右下角E
  ];
  const fontGap = windowWidth * 0.05; // 字母之間的間距
  const finalPositions = [
    ...nutritionWords.map((_, index) => ({
      x: index * fontGap - 75,
      y: centerY / 2 - 150,
    })),
    ...balanceWords.map((_, index) => ({
      x: index * fontGap + 200, // 平衡行的 X 坐標往右偏移
      y: centerY / 2 - 100,
    })),
  ];
  const initialOuterCircleRadius = centerX * 0.6;
  const finalOuterCircleRadius = 0;
  const initialInnerCircleRadius = centerX * 0.35;
  const finalInnerCircleRadius = 0;

  useEffect(() => {
    wordRefs.current.forEach((word, index) => {
      gsap.set(word, {
        x: positions[index].x,
        y: positions[index].y,
        rotate: initialRotations[index],
        fontSize: initialFontSizes[index],
      });
    });
    gsap.set(centerImgRef.current, {
      x: centerX,
      y: centerY,
    });
    gsap.set(planetContainerRef.current, {
      x: -150,
      y: windowHeight - 200,
    });

    gsap.set(outerCircleRef.current, {
      rx: centerX,
      ry: centerY,
      r: initialOuterCircleRadius,
    });

    gsap.set(innerCircleRef.current, {
      rx: centerX,
      ry: centerY,
      r: initialInnerCircleRadius,
    });
    gsap.set(OuterCubeImgRef.current, {
      x: windowWidth - 500,
      y: 100,
      rotation: 0,
    });
    gsap.to(OuterCubeImgRef.current, {
      rotation: -360,
      duration: 10,
      repeat: -1,
      ease: "none",
    });
    gsap.set(InnerCubeImgRef.current, {
      x: centerX - 500,
      y: centerY + 100,
      rotation: 0,
    });
    gsap.set(ellipseRef.current, {
      x: 0,
      y: -200,
    });
    gsap.to(InnerCubeImgRef.current, {
      rotation: 360,
      duration: 13,
      repeat: -1,
      ease: "none",
    });

    const handleScroll = (event) => {
      const scrollDirection = event.deltaY > 0 ? "down" : "up";
      if (isAnimating.current) return;

      if (scrollDirection === "down" && !isCentered.current) {
        // 限制滾動
        setScrollLocked(true);
        isAnimating.current = true;

        wordRefs.current.forEach((word, index) => {
          gsap.to(word, {
            duration: 1,
            x: finalPositions[index].x,
            y: finalPositions[index].y,
            rotate: finalRotations[index],
            fontSize: finalFontSizes[index],
            ease: "power4.out",
          });
        });

        // 圖片動畫

        gsap.to(planetContainerRef.current, {
          x: centerX - 200,
          y: centerY - 300,
          scale: 0,
          duration: 1,
          ease: "power2.out",
        });

        // 圓動畫
        gsap.to(outerCircleRef.current, {
          rx: 0,
          ry: 0,
          r: finalOuterCircleRadius,
          duration: 0,
          ease: "power4.out",
        });

        gsap.to(innerCircleRef.current, {
          rx: 0,
          ry: 0,
          r: finalInnerCircleRadius,
          duration: 0,
          ease: "power4.out",
        });
        gsap.to(ellipseRef.current, {
          rx: centerX * 0.8,
          ry: centerY * 0.4,
          duration: 0,
          ease: "power4.out",
        });
        gsap.to(OuterCubeImgRef.current, {
          x: centerX - 100, // 聚集到中心
          y: centerY - 100,
          scale: 0, // 可以進行縮放
          duration: 1,
          ease: "power4.out",
        });

        gsap.to(InnerCubeImgRef.current, {
          x: centerX - 100, // 聚集到中心
          y: centerY - 100,
          scale: 0,
          duration: 1,

          ease: "power4.out",
        });
        gsap.to(centerImgRef.current, {
          scale: 2,
          y: centerY - 100,
          duration: 1,
          onComplete: () => {
            isAnimating.current = false;
            setScrollLocked(false);
          },
          ease: "power1.out",
        });

        isCentered.current = true;
      }

      if (scrollDirection === "up" && isCentered.current) {
        // 返回初始文字動畫
        wordRefs.current.forEach((word, index) => {
          gsap.to(word, {
            duration: 1,
            x: positions[index].x,
            y: positions[index].y,
            rotate: initialRotations[index],
            fontSize: initialFontSizes[index],
            ease: "power3.out",
          });
        });

        // 圖片動畫
        gsap.to(centerImgRef.current, {
          scale: 1,
          y: centerY,
          rotate: 0,
          duration: 1,
          delay: 0.5,
          onComplete: () => {
            isAnimating.current = false;
          },
          ease: "power4.out",
        });
        gsap.to(planetContainerRef.current, {
          x: -200,
          y: windowHeight - 200,
          scale: 1,
          duration: 2,
          ease: "power2.out",
        });

        gsap.to(outerCircleRef.current, {
          cx: centerX,
          cy: centerY,
          y: 0,
          r: initialOuterCircleRadius,
          duration: 0,
          ease: "power4.out",
        });

        gsap.to(innerCircleRef.current, {
          cx: centerX,
          cy: centerY,
          y: 0,
          r: initialInnerCircleRadius,
          duration: 0,
          ease: "power4.out",
        });
        gsap.to(ellipseRef.current, {
          rx: 0,
          ry: 0,
          y: -200,
          ease: "power4.out",
        });
        gsap.to(OuterCubeImgRef.current, {
          x: windowWidth - 500,
          y: 100,
          scale: 1,
          duration: 2,
          ease: "power2.out",
        });

        gsap.to(InnerCubeImgRef.current, {
          x: centerX - 500,
          y: centerY + 100,
          scale: 1,
          duration: 2,
          ease: "power2.out",
        });

        isCentered.current = false;
      }
    };

    window.addEventListener("wheel", (event) => {
      if (scrollLocked) {
        // 當滾動被鎖定時，將滾動範圍限制在 windowHeight
        window.scrollTo(0, windowHeight);
      } else {
        handleScroll(event);
      }
    });

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, []);

  return (
    <Wrapper>
      <SVGContainer viewBox={`0 0 ${windowWidth} ${windowHeight}`}>
        <OuterCircle
          ref={outerCircleRef}
          cx={centerX}
          cy={centerY}
          r={initialOuterCircleRadius}
          fill="none"
          stroke="gray"
        />
        <InnerCircle
          ref={innerCircleRef}
          cx={centerX}
          cy={centerY}
          r={initialInnerCircleRadius}
          fill="none"
          stroke="gray"
        />
        <Ellipse
          ref={ellipseRef}
          cx={centerX}
          cy={centerY + 200}
          rx="0"
          ry="0"
          fill="none"
          stroke="#b0b0b0"
        />
      </SVGContainer>
      <WordsContainer>
        {nutritionWords.map((word, index) => (
          <Word key={index} ref={(el) => (wordRefs.current[index] = el)}>
            {word}
          </Word>
        ))}
        <BalanceContainer>
          {balanceWords.map((word, index) => (
            <Word
              key={index + nutritionWords.length}
              ref={(el) =>
                (wordRefs.current[index + nutritionWords.length] = el)
              }
            >
              {word}
            </Word>
          ))}
        </BalanceContainer>
      </WordsContainer>

      <CenterImgContainer>
        <CenterImg ref={centerImgRef} src={centerImg} />
      </CenterImgContainer>
      <PlanetImgContainer ref={planetContainerRef}>
        <ManImg src={standingMan} />
        <PlanetImg src={centerImg} />
      </PlanetImgContainer>
      <CubeImgContainer>
        <InnerCubeImg ref={InnerCubeImgRef} src={cubeImg} />
      </CubeImgContainer>
      <CubeImgContainer>
        <OuterCubeImg ref={OuterCubeImgRef} src={cubeImg} />
      </CubeImgContainer>
      <FoodImg src={avocado} />
    </Wrapper>
  );
};

// 定義樣式
const Wrapper = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const OuterCircle = styled.circle`
  transition: cx 1s, cy 1s, r 1s; /* 加入動畫效果 */
`;

const InnerCircle = styled.circle`
  transition: cx 1s, cy 1s, r 1s; /* 加入動畫效果 */
`;
const SVGContainer = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -3;
`;
const WordsContainer = styled.div`
  display: flex;
  position: absolute;
  width: 50%;
  height: 50%;
  justify-content: center;
  padding-top: 10rem;
  align-items: center;
  margin: auto;
`;
const Word = styled.div`
  position: absolute;
  font-family: "Fira Code", monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 0;
`;
const BalanceContainer = styled.div`
  margin-left: 10rem;
`;

const CenterImgContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: -1;
`;

const CenterImg = styled.img`
  width: 150px;
  height: auto;
`;

const PlanetImgContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: -2;
`;

const PlanetImg = styled.img`
  width: 500px;
  height: auto;
`;
const CubeImgContainer = styled.div`
  position: absolute;
  z-index: 3;
`;
const InnerCubeImg = styled.img`
  width: 50px;
  height: auto;
`;
const OuterCubeImg = styled.img`
  width: 100px;
  height: auto;
`;
const Ellipse = styled.ellipse`
  transition: rx 1s, ry 1s;
`;
const ManImg = styled.img`
  position: absolute;
  top: 50px;
  right: 100px;
  height: 140px;
`;
const FoodImg = styled.img`
  display: flex;
  position: absolute;
  width: 200px;
  margin: 0 auto;
`;
export default GSAPWrapper;

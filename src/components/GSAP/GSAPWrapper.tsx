import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import styled from "styled-components";
import asparagus from "./asparagus.png";
import avocado from "./avocado.png";
import banana from "./banana.png";
import cheery from "./cheery.png";
import lemon from "./lemon.png";
import garlic from "./garlic.png";
import potato from "./potato.png";
import tomato from "./tomato.png";
import pear from "./pear.png";
import pineapple from "./pineapple.png";
import redCarrot from "./redCarrot.png";

// 使用相對單位來讓圖片具備 RWD 功能

const GSAPWrapper: React.FC = () => {
  const wordRefs = useRef([]);
  const imageRefs = useRef([]);
  const isCentered = useRef(false);
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  const isAnimating = useRef(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  const nutritionWords = [
    { letter: "N", zIndex: 0 },
    { letter: "U", zIndex: 0 },
    { letter: "T", zIndex: 5 },
    { letter: "R", zIndex: 5 },
    { letter: "I", zIndex: 0 },
    { letter: "T", zIndex: 0 },
    { letter: "I", zIndex: 10 },
    { letter: "O", zIndex: 10 },
    { letter: "N", zIndex: 10 },
  ];

  const balanceWords = [
    { letter: "B", zIndex: 0 },
    { letter: "A", zIndex: 0 },
    { letter: "L", zIndex: 0 },
    { letter: "A", zIndex: 0 },
    { letter: "N", zIndex: 0 },
    { letter: "C", zIndex: 0 },
    { letter: "E", zIndex: 2 },
  ];

  const images = {
    avocado: {
      src: avocado,
      width: "400vw",
      height: "auto",
      initial: { x: 100, y: -600 },
      final: { x: centerX - 200, y: centerY + 250 },
    },
    potato: {
      src: potato,
      width: "250vw",
      height: "auto",
      initial: { x: 300, y: -800 },
      final: { x: centerX - 80, y: centerY + 110 },
      rotate: 0,
      scale: 1,
    },

    tomato: {
      src: tomato,
      width: "150vw",
      height: "auto",
      initial: { x: 400, y: -900 },
      final: { x: centerX - 40, y: centerY + 22 },
      rotate: 0,
      scale: 1,
      zIndex: 1,
    },
    asparagus: {
      src: asparagus,
      width: "800vw",
      height: "auto",
      initial: { x: -200, y: -500 },
      final: { x: centerX - 370, y: centerY - 50 },
      rotate: -30,
      scale: 1,
      zIndex: 2,
    },
    pear: {
      src: pear,
      width: "130vw",
      height: "auto",
      initial: { x: centerX - 80, y: -500 },
      final: { x: centerX - 80, y: centerY - 110 },
      rotate: 0,
      scale: 1,
      zIndex: -1,
    },

    redCarrot: {
      src: redCarrot,
      width: "155vw",
      height: "auto",
      initial: { x: centerX - 330, y: windowHeight + 500 },
      final: { x: centerX - 330, y: centerY + 235 },
      scale: 1,
      rotate: -60,
      zIndex: 2,
    },
    banana: {
      src: banana,
      width: "210vw",
      height: "auto",
      initial: { x: centerX + 280, y: -700 },
      final: { x: centerX + 280, y: 180 },
      rotate: -10,
      scale: 1,
      zIndex: 2,
    },
    cheery: {
      src: cheery,
      width: "100px",
      height: "auto",
      initial: { x: centerX + 500, y: centerY + 100 },
      final: { x: centerX + 510, y: centerY + 110 },
      rotate: 15,
      scale: 0,
      scaleY: 0,
    },

    lemon: {
      src: lemon,
      width: "100vw",
      height: "auto",
      initial: { x: centerX + 335, y: -500 },
      final: { x: centerX + 510, y: centerY + 10 },
      rotate: 85,
      scale: 1,
      zIndex: -2,
    },
    pineapple: {
      src: pineapple,
      width: "80vw",
      height: "auto",
      initial: { x: centerX - 330, y: -500 },
      final: { x: centerX - 280, y: centerY + 10 },
      scale: 1,
      rotate: 0,
      zIndex: -1,
    },
    garlic: {
      src: garlic,
      width: "100px",
      height: "auto",
      initial: { x: 250, y: -200 },
      final: { x: 250, y: centerY - 180 },
      rotate: 0,
      scale: 1,
      zIndex: 10,
    },
  };
  const initialFontSizes = [
    "2vw",
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

  const finalFontSizes = Array(16).fill("7vw");

  const initialRotations = [30, -45, 60, -90, 45, -30, 15, -60, 90];
  const finalRotations = Array(16).fill(0);

  const positions = [
    { x: -500, y: centerY - 300 },
    { x: 100, y: 100 },
    { x: -100, y: -100 },
    { x: 300, y: -300 },
    { x: 200, y: windowHeight + 100 },
    { x: 100, y: -200 },
    { x: centerX, y: centerY },
    { x: centerX - 200, y: -300 },
    { x: centerX, y: -100 },
    { x: -100, y: 300 },
    { x: centerY, y: windowHeight + 100 },
    { x: centerX - 300, y: centerY - 200 },
    { x: windowWidth, y: windowHeight - 300 },
    { x: centerX, y: windowHeight - 100 },
    { x: centerX + 100, y: -100 },
    { x: centerX, y: centerY },
  ];

  const fontGap = windowWidth * 0.05; // 字母之間的間距

  const finalPositions = [
    ...nutritionWords.map((_, index) => ({
      x: index * fontGap - 75,
      y: centerY / 2 - 150,
    })),
    ...balanceWords.map((_, index) => ({
      x: index * fontGap + 350,
      y: centerY / 2 - 70,
    })),
  ];

  useEffect(() => {
    // 設定文字初始位置
    wordRefs.current.forEach((word, index) => {
      gsap.set(word, {
        x: positions[index].x,
        y: positions[index].y,
        rotate: initialRotations[index],
        fontSize: initialFontSizes[index],

        zIndex:
          index < nutritionWords.length
            ? nutritionWords[index].zIndex
            : balanceWords[index - nutritionWords.length].zIndex,
      });
    });

    // 設定圖片初始位置
    Object.keys(images).forEach((key, index) => {
      gsap.set(imageRefs.current[index], {
        x: images[key].initial.x,
        y: images[key].initial.y,
        scale: images[key].scale,
        rotate: images[key].scale,
      });
    });

    const handleScroll = (event) => {
      const scrollDirection = event.deltaY > 0 ? "down" : "up";
      if (isAnimating.current) return;

      if (scrollDirection === "down" && !isCentered.current) {
        setScrollLocked(true);
        isAnimating.current = true;

        // 文字動畫
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
        Object.keys(images).forEach((key, index) => {
          gsap.to(imageRefs.current[index], {
            x: images[key].final.x,
            y: images[key].final.y,
            duration: 1.5,
            scale: images[key].scale, // cheery 從 0 放大到 1
            rotate: images[key].rotate,
            delay: index * 0.2, // 增加延遲以達到漸進效果
            zIndex: images[key].zIndex,
            ease: "power4.out",
            onComplete: () => {
              if (index === Object.keys(images).length - 1) {
                isAnimating.current = false;
                setScrollLocked(false);
              }
            },
          });
        });
        gsap.to(imageRefs.current[10], {
          duration: 2,
          delay: 2,
          x: images.garlic.final.x,
          y: images.garlic.final.y,
          ease: "bounce.out",
          onComplete: () => {
            isAnimating.current = false;
            setScrollLocked(false);
          },
        });

        isCentered.current = true;
        setScrollLocked(false);
      }

      if (
        scrollDirection === "up" &&
        isCentered.current &&
        window.scrollY === 0
      ) {
        // 返回初始文字位置
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

        // 返回初始圖片位置
        Object.keys(images).forEach((key, index) => {
          gsap.to(imageRefs.current[index], {
            x: images[key].initial.x,
            y: images[key].initial.y,
            duration: 1.5,
            ease: "power3.out",
          });
        });

        isCentered.current = false;
        setScrollLocked(false);
      }
    };

    window.addEventListener("wheel", (event) => {
      if (scrollLocked) {
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
      <WordsContainer>
        {nutritionWords.map((word, index) => (
          <Word
            key={index}
            ref={(el) => (wordRefs.current[index] = el)}
            style={{ zIndex: word.zIndex }} // 將 zIndex 應用到樣式中
          >
            {word.letter} {/* 渲染 letter */}
          </Word>
        ))}

        <BalanceContainer>
          {balanceWords.map((word, index) => (
            <Word
              key={index + nutritionWords.length}
              ref={(el) =>
                (wordRefs.current[index + nutritionWords.length] = el)
              }
              style={{ zIndex: word.zIndex }} // 將 zIndex 應用到樣式中
            >
              {word.letter} {/* 渲染 letter */}
            </Word>
          ))}
        </BalanceContainer>
      </WordsContainer>
      <ImageContainer>
        {Object.keys(images).map((key, index) => (
          <Image
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
            src={images[key].src}
            alt={key}
            width={images[key].width}
            height={images[key].height}
            style={{ zIndex: images[key].zIndex }}
          />
        ))}
      </ImageContainer>
    </Wrapper>
  );
};

// 樣式定義
const Wrapper = styled.div`
  height: 100vh; /* 增加頁面高度以觸發滾動 */
  width: 100%;
  position: relative;
  overflow: hidden;
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
  z-index: 1;
`;

const ImageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  z-index: 1;
`;

const Image = styled.img`
  position: absolute;
  max-width: 100%;
  transform-origin: top;
`;

const BalanceContainer = styled.div`
  margin-left: 10rem;
`;

export default GSAPWrapper;

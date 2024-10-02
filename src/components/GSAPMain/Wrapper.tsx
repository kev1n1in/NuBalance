import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styled from "@emotion/styled";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import carb from "./carb.png";
import protein from "./protein.png";
import fat from "./fat.png";

gsap.registerPlugin(ScrollTrigger);

const GSAPMain: React.FC = () => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]); // 多張卡片引用
  const containerRef = useRef<HTMLDivElement | null>(null); // 卡片容器引用
  const windowWidth = window.innerWidth;

  useEffect(() => {
    const wrapper = document.querySelector("#wrapper"); // 選取 Wrapper 元素

    if (containerRef.current && cardRefs.current) {
      // 設置卡片容器的 X 軸動畫
      gsap.fromTo(
        containerRef.current,
        {
          x: windowWidth, // 從視窗右邊進入
        },
        {
          x: -100, // 移動到中心
          ease: "power2.out", // 添加緩動效果，讓移動更加順暢
          scrollTrigger: {
            trigger: wrapper, // 以 Wrapper 作為觸發點
            start: "top 66%", // 當 Wrapper 的頂部到達視窗的 2/3 處開始動畫
            end: "bottom center", // 當 Wrapper 的底部到達視窗底部時動畫結束
            scrub: 1, // 添加緩動，動畫與滾動同步，並有一點延遲
          },
        }
      );
    }
  }, [windowWidth]);

  const Back: React.FC<{ title: string; content: string }> = ({
    title,
    content,
  }) => (
    <BackContainer>
      <BackTitle>{title}</BackTitle>
      <BackContent>{content}</BackContent>
    </BackContainer>
  );

  return (
    <Wrapper id="wrapper">
      <CardContainer ref={containerRef}>
        {[
          {
            title: "碳水化合物",
            content:
              "碳水化合物是人體最先用於轉化成能量的來源,因為合成肌肉雖然以蛋白質為原料，但人體能量來源依然以碳水化合物為主，攝取太少將會很難維持運動訓練與日常生活所需的能量,如果碳水化合物攝取不足，身體就沒有足夠的熱量，人會容易感到暈眩。",
            image: carb,
          },
          {
            title: "蛋白質",
            content:
              "蛋白質是組成人體細胞的原料，蛋白質除了幫助生長發育之外，亦有助於修補組織，包括肌肉、血液等,另外，蛋白質負責調節人體代謝和運送營養物質,如果蛋白質攝取不足，人的抵抗力便會下降，並且容易疲憊",
            image: protein,
          },
          {
            title: "脂肪",
            content:
              "脂肪對人體十分重要，脂肪能夠供給我們人體無法自行製造的脂肪酸。能夠幫助脂溶性維他命吸收，比如說脂溶性維他命A、D、E 及 K 等，需要脂肪幫助運送才能被人體吸收並利用。當人體攝取的碳水化合物不足時，就會由脂肪來負責提供能量，盡量減少蛋白質被分解。",
            image: fat,
          },
        ].map((item, index) => (
          <Card ref={(el) => (cardRefs.current[index] = el)} key={index}>
            <Back title={item.title} content={item.content} />
            <Front>
              <img src={item.image} alt={item.title} />
              <FrontTitle>{item.title}</FrontTitle>
            </Front>
          </Card>
        ))}
      </CardContainer>
      <TextWrapper>
        <Title>NUTRITION</Title>
        <SubTitle>三大營養素</SubTitle>
      </TextWrapper>
    </Wrapper>
  );
};

// 样式定义
const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1;
  background-color: #ffffff;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  gap: 30px;
`;

const TextWrapper = styled.div`
  position: relative;
  text-align: center;
  z-index: -1;
`;

const Title = styled.div`
  font-size: 200px;
  height: 200px;
  line-height: 200px;
  margin: auto;
  font-family: "Georgia", serif;
  color: rgba(0, 0, 0, 0.1);
`;

const SubTitle = styled.div`
  font-size: 36px;
  margin-right: 24px;
`;

const Card = styled.div`
  width: 300px;
  height: 400px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 50px 0;
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
  z-index: 20;
  transform: rotateY(180deg);

  &:hover {
    transform: rotateY(0deg); // hover 時觸發 Y 軸旋轉
  }
`;

const BackContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: left;
  font-size: 24px;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  padding: 20px;
`;

const BackTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 60px;
  text-align: center;
  color: black;
`;

const BackContent = styled.p`
  width: 260px;
  font-size: 18px;
  color: black;
  text-align: left;
`;

const Front = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  color: white;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
  border: 1px solid black;
  background-color: #bebebe;
  border-radius: 8px;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);

  transform: rotateY(180deg);
  padding-top: 20px;

  img {
    position: absolute;
    top: 50%;
    width: auto;
    height: 240px; // 保持圖片比例
    transform: translateY(-50%);
  }
`;

const FrontTitle = styled.div`
  display: flex;
  position: relative;
  top: 0;
  font-size: 24px;

  color: white;
`;

export default GSAPMain;

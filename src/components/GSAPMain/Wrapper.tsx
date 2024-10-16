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
      <CardsContainer ref={containerRef}>
        {[
          {
            title: "Carbohydrates",
            content:
              "Carbohydrates – or carbs – are the body’s primary fuel. They provide energy for your muscles and the central nervous system during movement and exercise. ",
            image: carb,
          },
          {
            title: "Protein",
            content:
              "Protein is essential to many processes in the body. It provides structure to the tissue. That includes cell membranes, organs, muscle, hair, skin, nails, bones, tendons, ligaments and blood plasma.",
            image: protein,
          },
          {
            title: "Fat",
            content:
              "Fat is vital for the body as an energy reserve, for insulation and protection of your organs, and for absorption and transport of fat-soluble vitamins.。",
            image: fat,
          },
        ].map((item, index) => (
          <CardContainer>
            <Card ref={(el) => (cardRefs.current[index] = el)} key={index}>
              <Back title={item.title} content={item.content} />
              <Front>
                <img src={item.image} alt={item.title} />
                <FrontTitle>{item.title}</FrontTitle>
              </Front>
            </Card>
          </CardContainer>
        ))}
      </CardsContainer>

      <TextWrapper>
        <Title>NUTRITION</Title>
        <SubTitle>Macronutrients</SubTitle>
      </TextWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
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

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  gap: 30px;
`;

const TextWrapper = styled.div`
  position: relative;
  text-align: center;
  margin-top: 200px;
  z-index: -1;
`;

const Title = styled.div`
  font-size: 250px;
  height: 250px;
  line-height: 200px;
  margin: auto;
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
  transform-style: preserve-3d; // 保持 3D 效果
  transition: transform 0.8s ease; // 控制翻轉效果
  z-index: 20;
  transform: rotateY(180deg); // 初始狀態為翻轉過去的
`;
const CardContainer = styled.div`
  cursor: pointer;
  perspective: 1000px; // 添加視角，讓 3D 效果更明顯
  &:hover ${Card} {
    transform: rotateY(0deg); // hover 到外部容器時觸發卡片翻轉
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

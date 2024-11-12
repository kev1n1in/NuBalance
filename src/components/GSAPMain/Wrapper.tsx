import styled from "@emotion/styled";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import carb from "./carb.png";
import fat from "./fat.png";
import protein from "./protein.png";

gsap.registerPlugin(ScrollTrigger);

const GSAPMain: React.FC = () => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const windowWidth = window.innerWidth;

  useEffect(() => {
    const wrapper = document.querySelector("#wrapper");

    if (containerRef.current && cardRefs.current) {
      gsap.fromTo(
        containerRef.current,
        {
          x: windowWidth,
        },
        {
          x: -100,
          ease: "power2.out",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 66%",
            end: "bottom center",
            scrub: 1,
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
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
  z-index: 20;
  transform: rotateY(180deg);
`;
const CardContainer = styled.div`
  cursor: pointer;
  perspective: 1000px;
  &:hover ${Card} {
    transform: rotateY(0deg);
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
    height: 240px;
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

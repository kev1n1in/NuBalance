import styled from "styled-components";
import { useState, useRef, useEffect } from "react";
import tape from "./tape.png";
import polaroid from "./polaroid.png";
import { useDropzone } from "react-dropzone";
import { annotate } from "rough-notation";

interface FoodItem {
  food_name: string;
  food_info: string[];
}

interface NutrientSelectorProps {
  selectedFood: FoodItem | null;
  onClick: () => void;
}

const NutrientSelector = ({ selectedFood, onClick }: NutrientSelectorProps) => {
  const foodSelectorRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptFiles) => {
      const file = acceptFiles[0];

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result as string);
        }
      };

      reader.readAsDataURL(file);
    },
  });
  useEffect(() => {
    if (foodSelectorRef.current) {
      const annotation = annotate(foodSelectorRef.current, {
        type: "underline",
        color: "#f9c74f",
        strokeWidth: 2,
        padding: 5,
        iterations: 2,
      });
      annotation.show();
    }
  }, []);
  const closeModal = () => {
    console.log("Closing modal...");
    setIsModalOpen(false);
  };

  return (
    <NutritionContainer onClick={onClick}>
      <TapeContainer>
        <TapeImg src={tape} />
        <BoxShadowTape />
      </TapeContainer>
      <Nutrition>
        <FoodSelectorContainer>
          <FoodSelector ref={foodSelectorRef}>
            {selectedFood ? selectedFood.food_name : "Click me to pick a food."}
          </FoodSelector>
          {selectedFood &&
            selectedFood.food_info.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
        </FoodSelectorContainer>
        <ImageUploadContainer>
          <Polaroid src={polaroid} />
          <BoxShadowFront />
          <BoxShadowBack />
          <UploadBox {...getRootProps()}>
            <input {...getInputProps()} />
            {imagePreview ? (
              <PreviewImage src={imagePreview} alt="Uploaded" />
            ) : (
              <PlusIcon>+</PlusIcon>
            )}
          </UploadBox>
        </ImageUploadContainer>
      </Nutrition>
    </NutritionContainer>
  );
};
const NutritionContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  height: 330px;
`;
const TapeContainer = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  width: 150px;
  z-index: 1;
`;
const TapeImg = styled.img`
  transform: translateX(-50%);
  width: 150px;
  height: auto;
`;
const BoxShadowTape = styled.div`
  display: flex;
  position: absolute;
  width: 120px;
  height: 15px;
  top: 22px;
  right: 95px;
  transform: rotate(0deg);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.16), 3px 3px 6px rgba(0, 0, 0, 0.23);
  z-index: -1;
`;
const Nutrition = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: left;
  width: 100%;
  padding: 36px 36px;
  border: 2px solid #ccc;
  background-color: white;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
  font-size: 24px;
  @media (max-width: 768px) {
    height: 450px;
  }
  @media (max-width: 480px) {
    padding: 24px 8px;
  }
`;
const FoodSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 60%;
  @media (max-width: 1280px) {
    width: 100%;
  }
`;
const FoodSelector = styled.div`
  width: auto;
  height: auto;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: left;
  font-size: 24px;
  margin-bottom: 30px;
  cursor: pointer;
  @media (max-width: 768px) {
    margin: 12px 0;
  }
`;
const Polaroid = styled.img`
  position: absolute;
  width: 250px;
  top: -48px;
  left: -30px;
  transform: rotate(-10deg);
  z-index: 2;
  pointer-events: none;
  @media (max-width: 480px) {
    display: none;
  }
`;
const BoxShadowFront = styled.div`
  display: flex;
  position: absolute;
  width: 160px;
  height: 160px;
  top: 18px;
  left: -8px;
  transform: rotate(0deg);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.16), 3px 3px 6px rgba(0, 0, 0, 0.23);
  z-index: -1;
  @media (max-width: 480px) {
    display: none;
  }
`;
const BoxShadowBack = styled.div`
  display: flex;
  position: absolute;
  width: 160px;
  height: 160px;
  top: 20px;
  left: 12px;
  transform: rotate(-11deg);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.16), 3px 3px 6px rgba(0, 0, 0, 0.23);
  z-index: -1;
  @media (max-width: 480px) {
    display: none;
  }
`;

const UploadBox = styled.div`
  width: 155px;
  height: 155px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #f9f9f9;
  @media (max-width: 480px) {
    width: 120px;
    height: 120px;
  }
  @media (max-width: 360px) {
    width: 100px;
    height: 100px;
  }
`;

const PlusIcon = styled.div`
  font-size: 60px;
  color: #333;
`;
const ImageUploadContainer = styled.div`
  display: flex;
  position: absolute;
  top: 4px;
  right: 48px;
  transform: rotate(10deg);
  @media (max-width: 1280px) {
    display: none;
  }
  @media (max-width: 768px) {
    display: flex;
    top: 220px;
    right: -20px;
    transform: rotate(40deg);
  }
  @media (max-width: 480px) {
    top: auto;
    right: 8px;
    bottom: 8px;
    transform: rotate(0deg);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

export default NutrientSelector;

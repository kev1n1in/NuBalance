import { motion } from "framer-motion";
import styled from "styled-components";

type MealItem = {
  id: string;
  name: string;
  imgSrc: string;
  selectImgSrc: string;
};

interface MealSelectorProps {
  meals: MealItem[];
  selectedMeal: MealItem | null;
  handleMealClick: (meal: MealItem) => void;
}

const MealSelector = ({
  meals,
  selectedMeal,
  handleMealClick,
}: MealSelectorProps) => {
  return (
    <MealSelectorContainer>
      {meals.map((meal) => (
        <MealContainer key={meal.id} onClick={() => handleMealClick(meal)}>
          <Meal
            isSelected={selectedMeal?.id === meal.id}
            src={selectedMeal?.id === meal.id ? meal.selectImgSrc : meal.imgSrc}
            alt={meal.name}
          />
          <MealName isSelected={selectedMeal?.id === meal.id}>
            {meal.name}
          </MealName>
        </MealContainer>
      ))}
    </MealSelectorContainer>
  );
};

const MealSelectorContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 200px;
  align-items: center;
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 2fr 2fr;
  }
`;

const MealContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
  @media (max-width: 480px) {
    margin: 0;
  }
  @media (max-width: 360px) {
    margin-top: 12px;
  }
`;

const Meal = styled(motion.img).attrs<{ isSelected: boolean }>(
  ({ isSelected }) => ({
    initial: { scale: 1 },
    animate: { scale: isSelected ? 1.3 : 1 },
    transition: { type: "spring", stiffness: 300 },
  })
)<{ isSelected: boolean }>`
  width: 140px;
  height: auto;
  @media (max-width: 360px) {
    width: 80px;
  }
`;

const MealName = styled.span<{ isSelected: boolean }>`
  margin-top: 8px;
  font-size: 24px;
  text-align: center;
  color: ${({ isSelected }) => (isSelected ? "#a23419" : "black")};
  @media (max-width: 360px) {
    font-size: 20px;
  }
`;

export default MealSelector;

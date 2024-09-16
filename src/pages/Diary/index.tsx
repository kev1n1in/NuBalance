import { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion"; // 引入 framer-motion
import Sidebar from "../../components/Sidebar";
import Button from "../../components/Button";
import breakImg from "./mealsImg/breakfats.png";
import lunchImg from "./mealsImg/lunch.png";
import dinnerImg from "./mealsImg/dinner.png";
import snackImg from "./mealsImg/snack.png";
import aweImg from "./moodsImg/Awe.png";
import eatingHappyImg from "./moodsImg/Eating_Happy.png";
import rageImg from "./moodsImg/Rage.png";
import suspiciousImg from "./moodsImg/Suspicious.png";
import girlImg from "./girl.png";
import Modal from "../../components/Modal";
import QueryFoodModal from "../../components/QueryFoodModal";

type FoodItem = {
  id: string;
  food_name: string;
  food_info: string[];
};
type MealItem = {
  id: string;
  name: string;
  imgSrc: string;
};

type MoodItem = {
  id: string;
  name: string;
  imgSrc: string;
};

const meals: MealItem[] = [
  { id: "breakfast", name: "早餐", imgSrc: breakImg },
  { id: "lunch", name: "午餐", imgSrc: lunchImg },
  { id: "dinner", name: "晚餐", imgSrc: dinnerImg },
  { id: "snack", name: "點心", imgSrc: snackImg },
];

const moods: MoodItem[] = [
  { id: "awe", name: "驚訝", imgSrc: aweImg },
  { id: "happy", name: "開心", imgSrc: eatingHappyImg },
  { id: "rage", name: "憤怒", imgSrc: rageImg },
  { id: "suspicious", name: "懷疑", imgSrc: suspiciousImg },
];

const Diary = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodItem | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleMealClick = (meal: MealItem) => {
    setSelectedMeal((prevSelected) =>
      prevSelected?.id === meal.id ? null : meal
    );
  };

  const handleMoodClick = (mood: MoodItem) => {
    setSelectedMood((prevSelected) =>
      prevSelected?.id === mood.id ? null : mood
    );
  };

  const handleAddFood = (food: FoodItem) => {
    setSelectedFood(food);
    setIsModalOpen(false);
  };

  return (
    <Wrapper>
      <Sidebar />
      <Container>
        <Title>Diary</Title>
        <MealSelectorContainer>
          {meals.map((meal) => (
            <MealContainer
              key={meal.id}
              onClick={() => handleMealClick(meal)}
              isSelected={selectedMeal?.id === meal.id}
            >
              <Meal src={meal.imgSrc} alt={meal.name} />
              <MealName>{meal.name}</MealName>
            </MealContainer>
          ))}
        </MealSelectorContainer>
        <FoodSelectorWrapper>
          <FoodSelectorTitle>吃了啥？</FoodSelectorTitle>
          <FoodSelectorContainer>
            <FoodSelector onClick={openModal}>
              {selectedFood ? selectedFood.food_name : "選擇食物"}
            </FoodSelector>
            <Nutrition>
              {selectedFood && selectedFood.food_info.join(" | ")}{" "}
            </Nutrition>
          </FoodSelectorContainer>
        </FoodSelectorWrapper>
        <TimePicker>
          <TimePickerTitle>時間</TimePickerTitle>
        </TimePicker>
        <MoodSelectorWrapper>
          <MoodSelectorTitle>心情如何？</MoodSelectorTitle>
          <MoodSelectorContainer>
            {moods.map((mood) => (
              <MoodContainer
                key={mood.id}
                onClick={() => handleMoodClick(mood)}
                isSelected={selectedMood?.id === mood.id}
              >
                <Mood src={mood.imgSrc} alt={mood.name} />
              </MoodContainer>
            ))}
          </MoodSelectorContainer>
        </MoodSelectorWrapper>
        <ImageUploadContainer>
          <ImageUploadTitle>圖片</ImageUploadTitle>
          <ImageUploadInput type="file" accept="image/*"></ImageUploadInput>
        </ImageUploadContainer>
        <NoteContainer>
          <NoteTitle>備註</NoteTitle>
          <NoteImg src={girlImg}></NoteImg>
          <NoteInput></NoteInput>
        </NoteContainer>
        <ButtonContainer>
          <Button label="保存"></Button>
        </ButtonContainer>
        {isModalOpen && (
          <Modal onClose={closeModal}>
            <QueryFoodModal onAddFood={handleAddFood}></QueryFoodModal>
          </Modal>
        )}
      </Container>
    </Wrapper>
  );
};
export default Diary;

const Wrapper = styled.div`
  margin-left: 150px;
`;

const Container = styled.div`
  width: 80%;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
`;

const MealSelectorContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 200px; /* 固定高度 */
  align-items: center; /* 垂直居中 */
`;

const MealContainer = styled(motion.div).attrs<{ isSelected: boolean }>(
  ({ isSelected }) => ({
    initial: { scale: 1 },
    animate: { scale: isSelected ? 1.3 : 1 },
    transition: { type: "spring", stiffness: 300 },
  })
)<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
`;

const Meal = styled.img`
  width: 100px;
  height: auto;
`;

const MealName = styled.span`
  margin-top: 8px;
  font-size: 16px;
  text-align: center;
`;

const MoodSelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const MoodSelectorContainer = styled.div`
  display: flex;
  justify-content: center;
`;
const MoodSelectorTitle = styled.h2``;

const MoodContainer = styled(motion.div).attrs<{ isSelected: boolean }>(
  ({ isSelected }) => ({
    initial: { scale: 1 },
    animate: { scale: isSelected ? 1.3 : 1 },
    transition: { type: "spring", stiffness: 300 },
  })
)<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
`;

const Mood = styled.img`
  width: 50px;
  height: auto;
`;

const MoodName = styled.span`
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
`;

const FoodSelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 150px;
`;

const FoodSelectorContainer = styled.div`
  display: flex;
  height: 100px;
`;

const FoodSelectorTitle = styled.h2`
  width: 100%;
`;

const FoodSelector = styled.div`
  width: 200px;
  height: 40px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Nutrition = styled.div`
  width: 200px;
`;

const TimePicker = styled.div``;

const TimePickerTitle = styled.h2``;

const ImageUploadContainer = styled.div``;

const ImageUploadTitle = styled.h2``;

const ImageUploadInput = styled.input``;

const NoteContainer = styled.div``;

const NoteTitle = styled.h2``;

const NoteImg = styled.img`
  display: none;
  position: absolute;
  height: 100px;
`;

const NoteInput = styled.input`
  height: 50px;
  width: 100%;
  background-color: gray;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
`;

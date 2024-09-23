import { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../Button";
import { useQuery } from "react-query";
import {
  fetchDiaryEntryById,
  updateDiaryEntry,
} from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import Modal from "../Modal";
import QueryFoodModal from "./QueryFoodModal";
import { useFoodStore } from "../../stores/foodStore";
import aweImg from "./moodsImg/Awe.png";
import eatingHappyImg from "./moodsImg/Eating_Happy.png";
import rageImg from "./moodsImg/Rage.png";
import suspiciousImg from "./moodsImg/Suspicious.png";
import { motion } from "framer-motion";
import breakImg from "./mealsImg/breakfats.png";
import lunchImg from "./mealsImg/lunch.png";
import dinnerImg from "./mealsImg/dinner.png";
import snackImg from "./mealsImg/snack.png";

interface FoodItem {
  id: string;
  food_name: string;
  food_info: string[];
}

interface DiaryEntry {
  id: string;
  meal?: string;
  food?: string;
  time?: string;
  mood?: string;
  note?: string;
  imageUrl?: string;
  nutrition?: {
    calories?: string;
    carbohydrates?: string;
    protein?: string;
    fat?: string;
  };
}
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

const DiaryFoodModal: React.FC<{ onClose: () => void; entryId: string }> = ({
  onClose,
  entryId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedFood, setSelectedFood } = useFoodStore();
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodItem | null>(null);
  const [currentFood, setCurrentFood] = useState<FoodItem | null>(null);
  const [note, setNote] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const currentUser = auth.currentUser;

  const {
    data: diaryEntry,
    isLoading,
    error,
    refetch,
  } = useQuery<DiaryEntry>(
    ["diaryEntry", entryId],
    () => {
      if (!currentUser) {
        throw new Error("用戶未登入");
      }
      return fetchDiaryEntryById(currentUser, entryId);
    },
    {
      onSuccess: (data) => {
        if (!isModalOpen) {
          setSelectedMeal(
            meals.find((meal) => meal.name === data.meal) || null
          );
          setCurrentFood({
            id: entryId,
            food_name: data.food || "未知",
            food_info: [
              data.nutrition?.calories || "未知",
              data.nutrition?.carbohydrates || "未知",
              data.nutrition?.protein || "未知",
              data.nutrition?.fat || "未知",
            ],
          });

          if (data.mood) {
            const matchedMood = moods.find((mood) => mood.name === data.mood);
            if (matchedMood) {
              setSelectedMood(matchedMood);
            }
          }

          setNote(data.note || "");
          setImageUrl(data.imageUrl || "");
          console.log("Image URL: ", data.imageUrl);
        }
      },
    }
  );
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

  const handleSave = async () => {
    if (!currentUser) {
      console.error("請先登入");
      return;
    }

    const updatedData = {
      food: currentFood?.food_name || "",
      meal: selectedMeal?.name || "",
      mood: selectedMood?.name || "",
      note: note || "",
      imageUrl: imageUrl || "",
      nutrition: {
        calories: currentFood?.food_info[0] || "未知",
        carbohydrates: currentFood?.food_info[1] || "未知",
        protein: currentFood?.food_info[2] || "未知",
        fat: currentFood?.food_info[3] || "未知",
      },
    };

    try {
      await updateDiaryEntry(currentUser, entryId, updatedData);
      console.log("日記條目已更新");

      alert("編輯成功");
      onClose();
    } catch (error) {
      console.error("更新日記條目失敗:", error);
    }
  };

  <Button label="保存" onClick={handleSave} />;

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (selectedFood) {
      console.log("選擇的食物：", selectedFood);
      setCurrentFood(selectedFood);
    }
  }, [selectedFood]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <Wrapper>
      <Title>今天吃了</Title>
      <FoodSelectorWrapper>
        <FoodSelectorTitle>吃了啥？</FoodSelectorTitle>
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
        <FoodSelectorContainer>
          <FoodSelector onClick={openModal}>
            {currentFood ? currentFood.food_name : "選擇食物"}
          </FoodSelector>
          <Nutrition>
            {currentFood && (
              <>
                <FoodInfo>{currentFood.food_info[0]}</FoodInfo>
                <FoodInfo>{currentFood.food_info[1]}</FoodInfo>
                <FoodInfo>{currentFood.food_info[2]}</FoodInfo>
                <FoodInfo>{currentFood.food_info[3]}</FoodInfo>
              </>
            )}
          </Nutrition>
        </FoodSelectorContainer>
      </FoodSelectorWrapper>

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

      <NoteContainer>
        <NoteTitle>備註：</NoteTitle>
        <NoteTextarea value={note} onChange={(e) => setNote(e.target.value)} />
      </NoteContainer>

      {imageUrl && (
        <FoodImgContainer>
          <FoodImg>圖片：</FoodImg>
          <ImagePreview src={imageUrl} alt="圖片" />
        </FoodImgContainer>
      )}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <QueryFoodModal
            onAddFood={(food) => {
              setSelectedFood(food);
              setCurrentFood(food);
              closeModal();
            }}
          />
        </Modal>
      )}

      <ButtonContainer>
        <Button label="保存" onClick={handleSave} />
      </ButtonContainer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 80vh;
`;

const Title = styled.h1`
  text-align: center;
`;
const MealSelectorContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 150px;
  align-items: center;
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
  width: 75px;
  height: auto;
`;

const MealName = styled.span`
  margin-top: 8px;
  font-size: 16px;
  text-align: center;
`;
const FoodSelectorWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
`;

const FoodSelectorContainer = styled.div`
  display: flex;
  height: 100px;
  margin-top: 24px;
`;

const FoodSelectorTitle = styled.h2`
  width: 100%;
`;

const FoodSelector = styled.div`
  width: 150px;
  height: 40px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Nutrition = styled.div`
  margin-left: 48px;
  width: 150px;
`;

const FoodInfo = styled.p``;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  text-align: center;
`;
const NoteTitle = styled.span`
  text-align: start;
  font-weight: bold;
  margin-right: 10px;
`;
const FoodImgContainer = styled.div`
  display: flex;
  margin-top: 20px;
  text-align: center;
`;

const FoodImg = styled.span`
  font-weight: bold;
  margin-right: 10px;
`;

const NoteTextarea = styled.textarea`
  color: #fff;
  background-color: gray;
`;

const ImagePreview = styled.img`
  width: 200px;
  height: auto;
  margin-top: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const MoodSelectorContainer = styled.div`
  display: flex;
  justify-content: center;
`;

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
  margin: 24px 10px 0 10px;
  cursor: pointer;
`;

const Mood = styled.img`
  width: 50px;
  height: auto;
`;

export default DiaryFoodModal;

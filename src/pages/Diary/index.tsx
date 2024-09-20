import { useState, useRef } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
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
import QueryFoodModal from "../../components/Ｍodals/QueryFoodModal";
import { useMutation } from "react-query";
import { auth } from "../../firebase/firebaseConfig";
import { addDiaryEntry } from "../../firebase/firebaseServices";
import { uploadImageToStorage } from "../../firebase/firebaseServices";

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
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const noteRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

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

  const mutation = useMutation(
    async (newDiaryEntry: any) => {
      if (!auth.currentUser) {
        throw new Error("請先登入");
      }
      return await addDiaryEntry(auth.currentUser, newDiaryEntry);
    },
    {
      onSuccess: (data) => {
        console.log("日記條目已成功保存，ID:", data);
        setSelectedMeal(null);
        setSelectedFood(null);
        setSelectedMood(null);
        setSelectedTime(new Date());
        if (noteRef.current) noteRef.current.value = "";
        if (imageRef.current) imageRef.current.value = "";
      },
      onError: (error) => {
        console.error("日記條目保存失敗:", error);
      },
    }
  );

  const handleSubmit = async () => {
    if (!selectedMeal || !selectedFood || !selectedTime) {
      alert("請填寫所有必填欄位");
      return;
    }

    let imageUrl = null;
    if (imageRef.current && imageRef.current.files?.length) {
      const file = imageRef.current.files[0];

      try {
        imageUrl = await uploadImageToStorage(file);
      } catch (error) {
        console.error("圖片上傳過程中出錯:", error);
        return;
      }
    }

    const newDiaryEntry = {
      meal: selectedMeal.name,
      food: selectedFood.food_name,
      mood: selectedMood ? selectedMood.name : null,
      time: selectedTime,
      note: noteRef.current?.value || "",
      imageUrl: imageUrl || null,
      nutrition: {
        calories: selectedFood.food_info[0],
        carbohydrates: selectedFood.food_info[1],
        protein: selectedFood.food_info[2],
        fat: selectedFood.food_info[3],
      },
    };

    mutation.mutate(newDiaryEntry);
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
        <TimePickerContainer>
          <TimePickerTitle>時間</TimePickerTitle>
          <StyledFlatpickr
            value={selectedTime}
            onChange={(date: Date[]) => setSelectedTime(date[0])}
            options={{ enableTime: true, dateFormat: "Y-m-d H:i" }}
          />
        </TimePickerContainer>
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
          <ImageUploadInput ref={imageRef} type="file" accept="image/*" />
        </ImageUploadContainer>
        <NoteContainer>
          <NoteTitle>備註</NoteTitle>
          <NoteImg src={girlImg}></NoteImg>
          <NoteInput ref={noteRef} />
        </NoteContainer>
        <ButtonContainer>
          <Button label="保存" onClick={handleSubmit} />
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
  margin: 24px 10px 0 10px;
  cursor: pointer;
`;

const Mood = styled.img`
  width: 50px;
  height: auto;
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
  margin-top: 24px;
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
  margin-left: 48px;
  width: 300px;
`;

const TimePickerContainer = styled.div`
  display: grid;
`;

const TimePickerTitle = styled.h2``;

const StyledFlatpickr = styled(Flatpickr)`
  margin: 24px auto;
  justify-self: center;
`;

const ImageUploadContainer = styled.div`
  margin: 24px 0;
`;

const ImageUploadTitle = styled.h2``;

const ImageUploadInput = styled.input`
  margin: 24px 0;
`;

const NoteContainer = styled.div`
  margin: 24px 0;
`;

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

import { useState, useRef } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Sidebar from "../../components/Sidebar";
import BGI from "../../asset/draft.png";
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
import { useFoodStore } from "../../stores/foodStore";
import { useLocation, useNavigate } from "react-router-dom";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";

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
  const { selectedFood, setSelectedFood } = useFoodStore();
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodItem | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const noteRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const { state } = useLocation();
  const navigate = useNavigate();

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
    //any 要改
    async (newDiaryEntry: any) => {
      if (!auth.currentUser) {
        throw new Error("請先登入");
      }
      return await addDiaryEntry(auth.currentUser, newDiaryEntry);
    },
    {
      onSuccess: () => {
        alert("成功新增！");
        setSelectedMeal(null);
        setSelectedFood(null);
        setSelectedMood(null);
        setSelectedTime(new Date());
        if (noteRef.current) noteRef.current.value = "";
        if (imageRef.current) imageRef.current.value = "";
        if (state?.fromUserInfo) {
          navigate("../userInfo");
        }
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
      if (state?.fromUserInfo) {
        navigate("/userInfo");
      } else {
        alert("保存成功！");
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
  const handleMenuToggle = () => {
    setToggleMenu((prev) => !prev);
  };
  return (
    <Wrapper>
      {toggleMenu && <Overlay onClick={handleMenuToggle} />}
      <HamburgerIcon onClick={handleMenuToggle} />
      <Sidebar toggleMenu={toggleMenu} />
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
          <MoodSelectorTitle>心情如何?(選填)</MoodSelectorTitle>
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
          <ImageUploadTitle>圖片(選填)</ImageUploadTitle>
          <ImageUploadInput ref={imageRef} type="file" accept="image/*" />
        </ImageUploadContainer>
        <NoteContainer>
          <NoteTitle>備註(選填)</NoteTitle>
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
  display: flex;
  background-image: url(${BGI});
  margin: 0 0 0 150px;
  z-index: 0;
  @media (max-width: 1000px) {
    margin: 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  margin: 50px auto 72px auto;
  padding: 24px 24px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  @media (max-width: 1000px) {
    margin: 50px 100px 72px 50px;
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 48px;
`;

const MealSelectorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  height: 200px;
  align-items: center;
  @media (max-width: 768px) {
    grid-template-columns: 2fr 2fr;
  }
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
  @media (max-width: 768px) {
    margin-top: 48px;
  }
`;

const FoodSelectorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100px;
  margin: 24px 0;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    place-items: center;
  }
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
  @media (max-width: 768px) {
    margin: 12px 0;
  }
`;

const Nutrition = styled.div`
  margin-left: 48px;
  width: 300px;
  @media (max-width: 768px) {
    margin-left: 0px;
    width: 100%;
  }
`;

const TimePickerContainer = styled.div`
  display: grid;
  @media (max-width: 768px) {
    margin: 24px 0;
  }
  @media (max-width: 360px) {
    margin: 48px 0;
  }
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
  background-color: #b4b4b4;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
`;

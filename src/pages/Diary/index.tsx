import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import Sidebar from "../../components/Sidebar";
import BGI from "../../asset/draft.png";
import Button from "../../components/Button";
import breakImg from "./mealsImg/breakfast.png";
import breakSelectImg from "./mealsImg/breakfast_select.png";
import lunchImg from "./mealsImg/lunch.png";
import lunchSelectImg from "./mealsImg/lunch_select.png";
import dinnerImg from "./mealsImg/dinner.png";
import dinnerSelectImg from "./mealsImg/dinner_select.png";
import snackImg from "./mealsImg/snack.png";
import snackSelectImg from "./mealsImg/snack_select.png";
import aweImg from "./moodsImg/Awe.png";
import eatingHappyImg from "./moodsImg/Eating_Happy.png";
import rageImg from "./moodsImg/Rage.png";
import suspiciousImg from "./moodsImg/Suspicious.png";
import girlImg from "./girl.png";
import Modal from "../../components/Ｍodals/Modal";
import QueryFoodModal from "../../components/Ｍodals/QueryFoodModal";
import { useMutation } from "react-query";
import { auth } from "../../firebase/firebaseConfig";
import { addDiaryEntry } from "../../firebase/firebaseServices";
import { uploadImageToStorage } from "../../firebase/firebaseServices";
import { useFoodStore } from "../../stores/foodStore";
import { useLocation, useNavigate } from "react-router-dom";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import tape from "./tape.png";
import { annotate } from "rough-notation";
import { useDropzone } from "react-dropzone";
import polaroid from "./polaroid.png";
import useAlert from "../../hooks/useAlertMessage";
import delicious from "./moodsImg/delicious.png";

type FoodItem = {
  id: string;
  food_name: string;
  food_info: string[];
};

type MealItem = {
  id: string;
  name: string;
  imgSrc: string;
  selectImgSrc: string;
};

type MoodItem = {
  id: string;
  name: string;
  imgSrc: string;
};

const meals: MealItem[] = [
  {
    id: "早餐",
    name: "breakfast",
    imgSrc: breakImg,
    selectImgSrc: breakSelectImg,
  },
  { id: "午餐", name: "lunch", imgSrc: lunchImg, selectImgSrc: lunchSelectImg },
  {
    id: "晚餐",
    name: "dinner",
    imgSrc: dinnerImg,
    selectImgSrc: dinnerSelectImg,
  },
  { id: "點心", name: "snack", imgSrc: snackImg, selectImgSrc: snackSelectImg },
];

const moods: MoodItem[] = [
  { id: "awe", name: "awe", imgSrc: aweImg },
  { id: "happy", name: "happy", imgSrc: eatingHappyImg },
  { id: "rage", name: "rage", imgSrc: rageImg },
  { id: "suspicious", name: "suspicious", imgSrc: suspiciousImg },
  { id: "delicious", name: "delicious", imgSrc: delicious },
];

const Diary = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedFood, setSelectedFood } = useFoodStore();
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodItem | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const noteRef = useRef<HTMLInputElement>(null);
  const [annotations, setAnnotations] = useState<Array<any>>([]);
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const foodSelectorRef = useRef<HTMLDivElement | null>(null);
  const { addAlert, AlertMessage } = useAlert();
  const { state } = useLocation();
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        console.log("Reader result:", reader.result);
        setImagePreview(reader.result as string);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
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
  const handleMouseEnter = (index: number) => {
    if (titleRefs.current[index] && !annotations[index]) {
      const newAnnotation = annotate(titleRefs.current[index]!, {
        type: "highlight",
        color: "#f9c74f",
        padding: 5,
      });
      newAnnotation.show();
      setAnnotations((prevAnnotations) => {
        const updatedAnnotations = [...prevAnnotations];
        updatedAnnotations[index] = newAnnotation;
        return updatedAnnotations;
      });
    }
  };
  const handleMouseLeave = (index: number) => {
    if (annotations[index]) {
      annotations[index].hide();
      setAnnotations((prevAnnotations) => {
        const updatedAnnotations = [...prevAnnotations];
        updatedAnnotations[index] = null;
        return updatedAnnotations;
      });
    }
  };

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
      onSuccess: () => {
        addAlert("Created successfully");
        setTimeout(() => {
          setSelectedMeal(null);
          setSelectedFood(null);
          setSelectedMood(null);
          setSelectedTime(new Date());

          if (noteRef.current) noteRef.current.value = "";

          if (state?.fromUserInfo) {
            navigate("../userInfo");
          }
        }, 1000);
      },
      onError: (error) => {
        console.error("日記條目保存失敗:", error);
      },
    }
  );

  const handleSubmit = async () => {
    if (!selectedMeal || !selectedFood || !selectedTime) {
      addAlert("請填寫所有必填欄位");
      return;
    }

    let imageUrl = null;
    if (imageFile) {
      try {
        imageUrl = await uploadImageToStorage(imageFile);
      } catch (error) {
        console.error("圖片上傳過程中出錯:", error);
        return;
      }
    }

    const newDiaryEntry = {
      meal: selectedMeal.id,
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
      <AlertMessage />
      {toggleMenu && <Overlay onClick={handleMenuToggle} />}
      <HamburgerIcon onClick={handleMenuToggle} />
      <Sidebar toggleMenu={toggleMenu} />
      <Container>
        <Title>Diary</Title>
        <MealSelectorContainer>
          {meals.map((meal) => (
            <MealContainer key={meal.id} onClick={() => handleMealClick(meal)}>
              <Meal
                isSelected={selectedMeal?.id === meal.id}
                src={
                  selectedMeal?.id === meal.id ? meal.selectImgSrc : meal.imgSrc
                }
                alt={meal.name}
              />
              <MealName isSelected={selectedMeal?.id === meal.id}>
                {meal.name}
              </MealName>
            </MealContainer>
          ))}
        </MealSelectorContainer>

        <FoodAndTimePickerWrapper>
          <FoodPickerContainer>
            <FoodSelectorTitle
              ref={(el) => (titleRefs.current[0] = el)}
              onMouseEnter={() => handleMouseEnter(0)}
              onMouseLeave={() => handleMouseLeave(0)}
            ></FoodSelectorTitle>
            <NutritionContainer>
              <TapeContainer>
                {" "}
                <TapeImg src={tape} />
                <BoxShadowTape />
              </TapeContainer>

              <Nutrition>
                <FoodSelector onClick={openModal} ref={foodSelectorRef}>
                  {selectedFood
                    ? selectedFood.food_name
                    : "Click me to pick a food."}
                </FoodSelector>
                {selectedFood &&
                  selectedFood.food_info.map((info, index) => (
                    <div key={index}>{info}</div>
                  ))}
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
          </FoodPickerContainer>

          <TimePickerWrapper>
            <TimePickerContainer>
              <TimePickerTitle
                ref={(el) => (titleRefs.current[1] = el)}
                onMouseEnter={() => handleMouseEnter(1)}
                onMouseLeave={() => handleMouseLeave(1)}
              >
                Time
              </TimePickerTitle>
              <StyledFlatpickr
                value={selectedTime}
                onChange={(date: Date[]) => setSelectedTime(date[0])}
                options={{
                  inline: true,
                  enableTime: true,
                  dateFormat: "Y-m-d H:i",
                }}
              />
            </TimePickerContainer>
          </TimePickerWrapper>
        </FoodAndTimePickerWrapper>

        <NoteAndMoodContainer>
          <MoodSelectorWrapper>
            <MoodSelectorTitle
              ref={(el) => (titleRefs.current[2] = el)}
              onMouseEnter={() => handleMouseEnter(2)}
              onMouseLeave={() => handleMouseLeave(2)}
            >
              Mood
            </MoodSelectorTitle>
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
          <NoteContainer>
            <NoteTitle
              ref={(el) => (titleRefs.current[3] = el)}
              onMouseEnter={() => handleMouseEnter(3)}
              onMouseLeave={() => handleMouseLeave(3)}
            >
              Note{" "}
            </NoteTitle>
            <NoteImg src={girlImg}></NoteImg>
            <NoteInput ref={noteRef} />
          </NoteContainer>
        </NoteAndMoodContainer>
        <ButtonContainer>
          <Button label="Save" onClick={handleSubmit} />
        </ButtonContainer>
        {isModalOpen && (
          <Modal title={"What did you eat?"} onClose={closeModal}>
            <QueryFoodModal onAddFood={handleAddFood}></QueryFoodModal>
          </Modal>
        )}
      </Container>
    </Wrapper>
  );
};

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

const MealContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
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
`;

const MealName = styled.span<{ isSelected: boolean }>`
  margin-top: 8px;
  font-size: 24px;
  text-align: center;
  color: ${({ isSelected }) => (isSelected ? "#a23419" : "black")};
`;

const FoodAndTimePickerWrapper = styled.div`
  display: flex;
  margin: 0 72px;

  @media (max-width: 768px) {
    margin-top: 48px;
  }
`;
const FoodPickerContainer = styled.div`
  width: 65%;

  margin-right: 48px;
`;

const FoodSelectorTitle = styled.h2`
  width: 250px;
  margin: 24px 0;
`;

const FoodSelector = styled.div`
  width: 60%;
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
`;

const TimePickerWrapper = styled.div`
  display: flex;
  margin-top: 24px;
`;
const TimePickerContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 30%;
  .flatpickr-calendar.inline {
    top: 20px !important;
  }

  @media (max-width: 768px) {
    margin: 24px 0;
  }
  @media (max-width: 360px) {
    margin: 48px 0;
  }
`;

const TimePickerTitle = styled.h2`
  width: 80px;
`;

const StyledFlatpickr = styled(Flatpickr)`
  font-family: "KG Second Chances", sans-serif;
  position: absolute;
  left: 158px;
  top: -8px;
  height: 50px;
  width: 150px;
`;

const ImageUploadContainer = styled.div`
  display: flex;
  position: absolute;
  top: 4px;
  right: 48px;

  transform: rotate(10deg);
`;

const Polaroid = styled.img`
  position: absolute;
  width: 250px;
  top: -48px;
  left: -30px;
  transform: rotate(-10deg);
  z-index: 2;
  pointer-events: none;
`;
const BoxShadowFront = styled.div`
  display: flex;
  position: absolute;
  width: 160px;
  height: 160px;
  top: 20px;
  left: -8px;
  transform: rotate(0deg);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.16), 3px 3px 6px rgba(0, 0, 0, 0.23);
  z-index: -1;
`;
const BoxShadowBack = styled.div`
  display: flex;
  position: absolute;
  width: 160px;
  height: 160px;
  top: 24px;
  left: 12px;
  transform: rotate(-11deg);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.16), 3px 3px 6px rgba(0, 0, 0, 0.23);
  z-index: -1;
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
`;

const PlusIcon = styled.div`
  font-size: 60px;
  color: #333;
`;

const NoteAndMoodContainer = styled.div`
  display: flex;
  margin: 24px 72px;
`;
const MoodSelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  margin-top: 24px;
`;

const MoodSelectorContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const MoodSelectorTitle = styled.h2`
  width: 80px;
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
  margin: 12px 10px 0 10px;
  cursor: pointer;
`;

const Mood = styled.img`
  width: 50px;
  height: auto;
`;
const NoteContainer = styled.div`
  width: 50%;
  margin: 24px 10px 0 10px;
`;
const NoteTitle = styled.h2`
  width: 80px;
`;

const NoteImg = styled.img`
  display: none;
  position: absolute;
  height: 100px;
`;

const NoteInput = styled.input`
  height: 50px;
  width: 100%;
  background-color: #dedede;
  border: 3px dashed gray;
  margin-top: 12px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;
export default Diary;

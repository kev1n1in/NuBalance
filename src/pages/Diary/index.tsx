import debounce from "lodash.debounce";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { annotate } from "rough-notation";
import styled from "styled-components";
import BGI from "../../asset/draft.png";
import aweImg from "../../asset/moodsImg/Awe.png";
import eatingHappyImg from "../../asset/moodsImg/Eating_Happy.png";
import rageImg from "../../asset/moodsImg/Rage.png";
import suspiciousImg from "../../asset/moodsImg/Suspicious.png";
import angryImg from "../../asset/moodsImg/angry.png";
import fearImg from "../../asset/moodsImg/fear.png";
import lovingImg from "../../asset/moodsImg/loving.png";
import Button from "../../components/Button";
import DatePicker from "../../components/DatePicker";
import NutrientSelector from "../../components/FoodSelector/FoodSelector";
import MealSelector from "../../components/MealSelector";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import RequiredMark from "../../components/RequiredMark";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Ｍodals/Modal";
import QueryFoodModal from "../../components/Ｍodals/QueryFoodModal";
import MoodSelector from "../../components/ＭoodSelector";
import { auth } from "../../firebase/firebaseConfig";
import {
  addDiaryEntry,
  uploadImageToStorage,
} from "../../firebase/firebaseServices";
import useAlert from "../../hooks/useAlertMessage";
import { useFoodStore } from "../../stores/foodStore";
import { MealItem } from "../../types/mealTypes";
import breakImg from "./mealsImg/breakfast.png";
import breakSelectImg from "./mealsImg/breakfast_select.png";
import dinnerImg from "./mealsImg/dinner.png";
import dinnerSelectImg from "./mealsImg/dinner_select.png";
import lunchImg from "./mealsImg/lunch.png";
import lunchSelectImg from "./mealsImg/lunch_select.png";
import snackImg from "./mealsImg/snack.png";
import snackSelectImg from "./mealsImg/snack_select.png";
import polaroid from "./polaroid.png";

type FoodItem = {
  id: string;
  food_name: string;
  food_info: string[];
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
  { id: "awe", name: "驚訝", imgSrc: aweImg },
  { id: "happy", name: "開心", imgSrc: eatingHappyImg },
  { id: "rage", name: "憤怒", imgSrc: rageImg },
  { id: "suspicious", name: "懷疑", imgSrc: suspiciousImg },
  { id: "fear", name: "恐懼", imgSrc: fearImg },
  { id: "love", name: "好愛", imgSrc: lovingImg },
  { id: "angry", name: "生氣", imgSrc: angryImg },
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
          setImageFile(null);
          setImagePreview(null);

          if (noteRef.current) noteRef.current.value = "";

          if (state?.fromUserInfo) {
            navigate("../userInfo");
          }
        }, 500);
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
  const debouncedSubmit = debounce(handleSubmit, 1000);
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
        <MobileImageUploadContainer>
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
        </MobileImageUploadContainer>
        <MealSelectorWrapper>
          <MealSelectorTitle
            ref={(el) => (titleRefs.current[0] = el)}
            onMouseEnter={() => handleMouseEnter(0)}
            onMouseLeave={() => handleMouseLeave(0)}
          >
            Meal Selector <RequiredMark />
          </MealSelectorTitle>
          <MealSelector
            meals={meals}
            selectedMeal={selectedMeal}
            handleMealClick={handleMealClick}
          ></MealSelector>
        </MealSelectorWrapper>
        <FoodAndTimePickerWrapper>
          <FoodPickerContainer>
            <FoodSelectorTitle
              ref={(el) => (titleRefs.current[1] = el)}
              onMouseEnter={() => handleMouseEnter(1)}
              onMouseLeave={() => handleMouseLeave(1)}
            >
              Food Selector
              <RequiredMark />
            </FoodSelectorTitle>
            <NutrientSelector
              selectedFood={selectedFood}
              onClick={() => setIsModalOpen(true)}
            />
          </FoodPickerContainer>
          <TimePickerWrapper>
            <TimePickerTitle
              ref={(el) => (titleRefs.current[2] = el)}
              onMouseEnter={() => handleMouseEnter(2)}
              onMouseLeave={() => handleMouseLeave(2)}
            >
              Time
              <RequiredMark />
            </TimePickerTitle>
            <DatePicker
              initialTime={selectedTime.toISOString()}
              onDateChange={setSelectedTime}
            />
          </TimePickerWrapper>
        </FoodAndTimePickerWrapper>

        <NoteAndMoodContainer>
          <MoodSelectorWrapper>
            <MoodSelectorTitle
              ref={(el) => (titleRefs.current[3] = el)}
              onMouseEnter={() => handleMouseEnter(3)}
              onMouseLeave={() => handleMouseLeave(3)}
            >
              Mood
            </MoodSelectorTitle>
            <MoodSelector
              moods={moods}
              selectedMood={selectedMood}
              setSelectedMoodClick={setSelectedMood}
            />
          </MoodSelectorWrapper>
          <NoteContainer>
            <NoteTitle
              ref={(el) => (titleRefs.current[4] = el)}
              onMouseEnter={() => handleMouseEnter(4)}
              onMouseLeave={() => handleMouseLeave(4)}
            >
              Note
            </NoteTitle>
            <NoteInput ref={noteRef} />
          </NoteContainer>
        </NoteAndMoodContainer>
        <ButtonContainer>
          <Button strokeColor="gray" label="Save" onClick={debouncedSubmit} />
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
  position: relative;
  flex-direction: column;
  width: 90%;
  margin: 50px auto 72px auto;
  padding: 24px 24px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  @media (max-width: 1280px) {
    margin: 50px 100px 72px 50px;
  }
  @media (max-width: 768px) {
    margin: 50px 50px 72px 50px;
  }
  @media (max-width: 480px) {
    margin: 12px auto;
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 48px;
  @media (max-width: 1280px) {
    text-align: start;
  }
  @media (max-width: 360px) {
    font-size: 36px;
  }
`;
const MealSelectorWrapper = styled.div`
  width: auto;
  margin: 0 72px;
  @media (max-width: 1280px) {
    margin: 48px 36px;
  }
  @media (max-width: 480px) {
    margin: 8px;
  }
`;
const MealSelectorTitle = styled.h2`
  width: 230px;
`;

const FoodAndTimePickerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 90%;
  margin: 0 72px;
  @media (max-width: 1280px) {
    margin: 0 36px;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 48px;
  }
  @media (max-width: 480px) {
    margin: 60px 8px 8px 8px;
  }
  @media (max-width: 360px) {
    margin: 20px 8px 8px 8px;
  }
`;
const FoodPickerContainer = styled.div`
  width: 65%;
  margin-right: 48px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FoodSelectorTitle = styled.h2`
  width: 250px;
  margin: 24px 0;
`;

const TimePickerWrapper = styled.div`
  display: flex;
  margin-top: 24px;
  @media (max-width: 768px) {
    margin-top: 140px;
    width: 100%;
  }
`;

const TimePickerTitle = styled.h2`
  height: 50px;
  width: 80px;
`;

const MobileImageUploadContainer = styled.div`
  display: none;
  position: absolute;
  top: 4px;
  right: 48px;
  transform: rotate(10deg);
  @media (max-width: 1280px) {
    display: flex;
    top: 0px;
    right: 80px;
    transform: rotate(20deg);
  }
  @media (max-width: 768px) {
    display: none;
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

const NoteAndMoodContainer = styled.div`
  display: flex;
  width: 90%;
  justify-content: space-between;
  margin: 24px 72px;
  @media (max-width: 1280px) {
    flex-direction: column;
    margin: 0 36px;
  }
  @media (max-width: 480px) {
    margin: 8px;
  }
`;
const MoodSelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  margin-top: 24px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MoodSelectorTitle = styled.h2`
  width: 80px;
`;

const NoteContainer = styled.div`
  width: 50%;
  margin: 24px 10px 0 20px;
  @media (max-width: 1280px) {
    width: 100%;
    margin: 24px 0;
  }
`;
const NoteTitle = styled.h2`
  width: 80px;
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
  width: 90%;
  margin: 0 auto;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;
export default Diary;

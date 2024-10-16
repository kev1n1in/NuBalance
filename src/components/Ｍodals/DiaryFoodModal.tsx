import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Button from "../Button";
import { useQuery, useQueryClient } from "react-query";
import {
  fetchDiaryEntryById,
  updateDiaryEntry,
} from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import Modal from "./Modal";
import QueryFoodModal from "./QueryFoodModal";
import { useFoodStore } from "../../stores/foodStore";
import aweImg from "../../asset/moodsImg/Awe.png";
import eatingHappyImg from "../../asset/moodsImg/Eating_Happy.png";
import rageImg from "../../asset/moodsImg/Rage.png";
import suspiciousImg from "../../asset/moodsImg/Suspicious.png";
import fearImg from "../../asset/moodsImg/angry.png";
import lovingImg from "../../asset/moodsImg/loving.png";
import angryImg from "../../asset/moodsImg/angry.png";
import { motion } from "framer-motion";
import breakImg from "./mealsImg/breakfast.png";
import breakSelectImg from "./mealsImg/breakfast_select.png";
import lunchImg from "./mealsImg/lunch.png";
import lunchSelectImg from "./mealsImg/lunch_select.png";
import dinnerImg from "./mealsImg/dinner.png";
import dinnerSelectImg from "./mealsImg/dinner_select.png";
import snackImg from "./mealsImg/snack.png";
import snackSelectImg from "./mealsImg/snack_select.png";
import useAlert from "../../hooks/useAlertMessage";
import tape from "./tape.png";
import polaroid from "./polaroid.png";
import { useDropzone } from "react-dropzone";
import { annotate } from "rough-notation";
import AlertMessage from "../AlertMessage";

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
  { id: "awe", name: "驚訝", imgSrc: aweImg },
  { id: "happy", name: "開心", imgSrc: eatingHappyImg },
  { id: "rage", name: "憤怒", imgSrc: rageImg },
  { id: "suspicious", name: "懷疑", imgSrc: suspiciousImg },
  { id: "fear", name: "恐懼", imgSrc: fearImg },
  { id: "love", name: "好愛", imgSrc: lovingImg },
  { id: "angry", name: "生氣", imgSrc: angryImg },
];

const DiaryFoodModal: React.FC<{
  onClose: () => void;
  entryId: string;
  selectedDate: Date;
}> = ({ onClose, entryId, selectedDate }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedFood, setSelectedFood } = useFoodStore();
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodItem | null>(null);
  const [currentFood, setCurrentFood] = useState<FoodItem | null>(null);
  const [note, setNote] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const foodSelectorRef = useRef<HTMLDivElement | null>(null);
  const { addAlert, AlertMessage } = useAlert();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const moodRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [moodAnnotations, setMoodAnnotations] = useState<Array<any>>([]);

  const annotationRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const currentUser = auth.currentUser;
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImageFile(file);
      setIsImageUploaded(true);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);

        console.log(`我是圖片預覽：`, imageFile);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    },
  });
  useEffect(() => {
    if (imagePreview) {
      console.log("圖片已成功加載並預覽:", imagePreview); // 這裡應該能正確打印預覽的圖片 URL
    }
  }, [imagePreview]);
  useEffect(() => {
    if (foodSelectorRef.current) {
      const element = foodSelectorRef.current;

      // 如果有已存在的 annotation，移除舊的
      if (annotationRef.current) {
        annotationRef.current.remove();
      }

      // 創建新的 rough-notation 注解並展示
      annotationRef.current = annotate(element, {
        type: "underline",
        color: "#f9c74f",
        strokeWidth: 2,
        iterations: 2,
      });
      annotationRef.current.show();
    }
  }, [currentFood]);
  // Fetch diary entry and set initial state values
  const {
    data: diaryEntry,
    isLoading,
    error,
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
        console.log(data);
        if (!isModalOpen) {
          setSelectedMeal(meals.find((meal) => meal.id === data.meal) || null);
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

          // Set imageUrl and imagePreview for displaying the image
          setImageUrl(data.imageUrl || "");
          if (!isImageUploaded) {
            // 如果用戶還沒有上傳新圖片，顯示原來的圖片
            setImagePreview(data.imageUrl || "");
          }
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
    // 簡單地更新或清除選中的心情
    setSelectedMood((prevMood) =>
      prevMood && prevMood.id === mood.id ? null : mood
    );
  };

  useEffect(() => {
    // 清除所有心情的標記
    moodAnnotations.forEach((annotation) => {
      if (annotation) {
        annotation.hide();
      }
    });
    setMoodAnnotations(new Array(moods.length).fill(null));

    // 如果有選中的心情，則添加標記
    if (selectedMood) {
      const index = moods.findIndex((mood) => mood.id === selectedMood.id);
      if (index !== -1) {
        const annotation = annotate(moodRefs.current[index] as HTMLElement, {
          type: "circle",
          color: "#709a46", // 選擇你喜歡的顏色
          padding: 8,
        });
        annotation.show();
        const newAnnotations = [...moodAnnotations];
        newAnnotations[index] = annotation;
        setMoodAnnotations(newAnnotations);
      }
    }
  }, [selectedMood]); // 監聽 selectedMood 的變化

  useEffect(() => {
    // 清理標記
    return () => {
      moodAnnotations.forEach((annotation) => {
        if (annotation) {
          annotation.remove();
        }
      });
    };
  }, []);

  const handleSave = async () => {
    if (!currentUser) {
      console.error("請先登入");
      return;
    }
    const finalImage = isImageUploaded ? imagePreview : imageUrl;
    const updatedData = {
      food: currentFood?.food_name || "",
      meal: selectedMeal?.id || "",
      mood: selectedMood?.name || "",
      note: note || "",
      imageUrl: finalImage || "",
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

      addAlert("編輯成功");
      queryClient.invalidateQueries(["diaryEntries", selectedDate]);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("更新日記條目失敗:", error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (selectedFood) {
      setCurrentFood(selectedFood);
    }
  }, [selectedFood]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <Wrapper>
      <AlertMessage />
      <Container>
        <FoodSelectorWrapper>
          <MealSelectorContainer>
            {meals.map((meal) => (
              <MealContainer
                key={meal.id}
                onClick={() => handleMealClick(meal)}
              >
                <Meal
                  isSelected={selectedMeal?.id === meal.id}
                  src={
                    selectedMeal?.id === meal.id
                      ? meal.selectImgSrc
                      : meal.imgSrc
                  }
                  alt={meal.name}
                />
                <MealName isSelected={selectedMeal?.id === meal.id}>
                  {meal.name}
                </MealName>
              </MealContainer>
            ))}
          </MealSelectorContainer>
          <FoodSelectorContainer>
            <NutritionContainer>
              <TapeContainer>
                <TapeImg src={tape} />
                <BoxShadowTape />
              </TapeContainer>
              <FoodSelector ref={foodSelectorRef} onClick={openModal}>
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
            </NutritionContainer>

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
          </FoodSelectorContainer>
        </FoodSelectorWrapper>

        <MoodSelectorContainer>
          {moods.map((mood, index) => (
            <MoodContainer
              key={mood.id}
              onClick={() => handleMoodClick(mood)}
              isSelected={selectedMood?.id === mood.id}
              ref={(el) => (moodRefs.current[index] = el)}
            >
              <Mood src={mood.imgSrc} alt={mood.name} />
            </MoodContainer>
          ))}
        </MoodSelectorContainer>

        <NoteContainer>
          <NoteTextarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </NoteContainer>

        {isModalOpen && (
          <Modal title={""} onClose={closeModal}>
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
          <Button strokeColor="gray" label="Save" onClick={handleSave} />
        </ButtonContainer>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 80vh;
  margin-top: 100px;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  margin: 0 auto;
`;

const MealSelectorContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 150px;
  width: 100%;
  align-items: center;
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
  @media (max-width: 768px) {
    width: 100px;
  }
`;

const MealName = styled.span<{ isSelected: boolean }>`
  margin-top: 8px;
  font-size: 20px;
  text-align: center;
  color: ${({ isSelected }) => (isSelected ? "#a23419" : "black")};
`;
const FoodSelectorWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
`;
const NutritionContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
`;
const PlusIcon = styled.div`
  font-size: 60px;
  color: #333;
`;
const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;
const FoodSelectorContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: space-evenly;
  background-color: white;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
  height: 100%;
  width: 100%;
  padding: 24px;
  margin-top: 24px;
  @media (max-width: 768px) {
    margin-top: 100px;
  }
  @media (max-width: 480px) {
    height: 450px;
    justify-content: start;
  }
`;
const TapeContainer = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  width: 140px;
  z-index: 1;
`;
const TapeImg = styled.img`
  transform: translateX(-50%);
  width: 140px;
  height: auto;
`;
const BoxShadowTape = styled.div`
  display: flex;
  position: absolute;
  width: 110px;
  height: 15px;
  top: 20px;
  right: 90px;
  transform: rotate(0deg);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.16), 3px 3px 6px rgba(0, 0, 0, 0.23);
  z-index: -1;
`;
const FoodSelector = styled.div`
  width: 200px;
  height: 40px;
  font-size: 24px;
  font-weight: 700;
  margin: 24px 0;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Nutrition = styled.div`
  margin-top: 12px;
  width: 180px;
`;
const ImageUploadContainer = styled.div`
  display: flex;
  position: absolute;
  top: 4px;
  right: 48px;
  transform: rotate(10deg);
  @media (max-width: 768px) {
    right: -9px;
    transform: rotate(56deg);
  }
  @media (max-width: 480px) {
    top: auto;
    bottom: 40px;
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
const FoodInfo = styled.p``;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  text-align: center;
`;

const NoteTextarea = styled.textarea`
  color: #000;
  font-size: 20px;
  background-color: #dedede;
  border: 3px dashed gray;
`;

const ButtonContainer = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  margin: 20px 0;
`;

const MoodSelectorContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 12px 0;
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: start;
  }
`;

const MoodContainer = styled(motion.div).attrs<{ isSelected: boolean }>(
  ({ isSelected }) => ({
    initial: { scale: 1 },
    animate: { scale: isSelected ? 1.5 : 1 },
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
  width: 64px;
  height: auto;
  @media (max-width: 480px) {
    width: 40px;
  }
`;

export default DiaryFoodModal;

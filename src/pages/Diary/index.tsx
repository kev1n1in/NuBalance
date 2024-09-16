import styled from "styled-components";
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
import { useState } from "react";
import Modal from "../../components/Modal";
import QueryFoodModal from "../../components/QueryFoodModal";
const Diary = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Wrapper>
      <Sidebar />
      <Container>
        <Title>Diary</Title>
        <MealSelectorContainer>
          <Meal src={breakImg}></Meal>
          <Meal src={lunchImg}></Meal>
          <Meal src={dinnerImg}></Meal>
          <Meal src={snackImg}></Meal>
        </MealSelectorContainer>
        <FoodSelectorWrapper>
          <FoodSelectorTitle>吃了啥？</FoodSelectorTitle>
          <FoodSelectorContainer>
            <FoodSelector onClick={openModal}></FoodSelector>
            <Nutrition></Nutrition>
          </FoodSelectorContainer>
        </FoodSelectorWrapper>
        <TimePicker>
          <TimePickerTitle>時間</TimePickerTitle>
        </TimePicker>
        <MoodSelectorWrapper>
          <MoodSelectorTitle>心情如何？</MoodSelectorTitle>
          <MoodSelectorContainer>
            <Mood src={aweImg}></Mood>
            <Mood src={eatingHappyImg}></Mood>
            <Mood src={rageImg}></Mood>
            <Mood src={suspiciousImg}></Mood>
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
            <QueryFoodModal></QueryFoodModal>
          </Modal>
        )}
      </Container>
    </Wrapper>
  );
};
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
`;

const Meal = styled.img`
  width: 100px;
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
`;

const FoodSelectorTitle = styled.h2`
  width: 100%;
`;

const FoodSelector = styled.input``;

const Nutrition = styled.div`
  width: 200px;
`;

const TimePicker = styled.div``;

const TimePickerTitle = styled.h2``;

const MoodSelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const MoodSelectorContainer = styled.div`
  display: flex;
`;

const MoodSelectorTitle = styled.h2``;

const Mood = styled.img`
  width: 24px;
  height: 24px;
  margin: 12px;
`;

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
export default Diary;

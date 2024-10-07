import Sidebar from "../../components/Sidebar";
import styled from "styled-components";
import Button from "../../components/Button";
import { Line } from "rc-progress";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import {
  getUserHistory,
  getDiaryEntry,
  deleteDiaryEntry,
} from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import userImg from "./userImg.png";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import trashImg from "./trash.png";
import DiaryFoodModal from "../../components/Ｍodals/DiaryFoodModal";
import Modal from "../../components/Modal";
import BGI from "../../asset/draft.png";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import Loader from "../../components/Loader";
import calculatorImg from "./calculator.png";
import createImg from "./create.png";
import searchImg from "./search.png";
import report from "./report.png";
import useConfirmDialog from "../../hooks/useConfirmDialog";

interface DiaryEntry {
  id: string;
  food?: string;
  meal?: string;
  nutrition?: {
    calories?: string;
    carbohydrates?: string;
    protein?: string;
    fat?: string;
  };
}

const UserInfo = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ConfirmDialogComponent, openDialog } = useConfirmDialog();

  const {
    data: latestTDEE = { tdee: 1800 },
    isLoading: isLoadingTDEE,
    error: errorTDEE,
  } = useQuery("latestTDEE", async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("用戶未登入");
    }
    const latestHistory = await getUserHistory(currentUser, true);
    return latestHistory;
  });

  const {
    data: diaryEntries = [],
    isLoading: isLoadingDiary,
    error: errorDiary,
  } = useQuery<DiaryEntry[]>(["diaryEntries", selectedDate], async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("用戶未登入");
    }
    const formattedDate = selectedDate.toLocaleDateString("sv-SE");
    return await getDiaryEntry(currentUser, formattedDate);
  });

  const extractNumberFromString = (str: string): number => {
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const todayNutrition = diaryEntries.reduce((total, entry) => {
    const caloriesStr = entry.nutrition?.calories || "0";
    return total + extractNumberFromString(caloriesStr);
  }, 0);

  const tdee = latestTDEE.tdee;
  const remainingCalories = tdee - todayNutrition;
  const percentage = (todayNutrition / tdee) * 100;

  if (errorTDEE || errorDiary) {
    const errorMessageTDEE = (errorTDEE as Error)?.message || "未知的錯誤";
    const errorMessageDiary = (errorDiary as Error)?.message || "未知的錯誤";

    return <div>Error: {errorMessageTDEE || errorMessageDiary}</div>;
  }
  const handleDeleteClick = (entryId: string, entryFood: string) => {
    openDialog(entryFood, () => handleDelete(entryId));
  };
  const handleDelete = async (id: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("用戶未登入");
      }

      await deleteDiaryEntry(currentUser, id);
      queryClient.invalidateQueries(["diaryEntries", selectedDate]);
    } catch (error) {
      console.error("刪除日記失敗:", error);
    }
  };

  const meals = {
    breakfast: diaryEntries.filter((entry) => entry.meal === "早餐"),
    lunch: diaryEntries.filter((entry) => entry.meal === "午餐"),
    dinner: diaryEntries.filter((entry) => entry.meal === "晚餐"),
    snack: diaryEntries.filter((entry) => entry.meal === "點心"),
  };

  const MealSection = ({
    title,
    entries,
  }: {
    title: string;
    entries: DiaryEntry[];
  }) => (
    <MealSectionContainer>
      <Loader isLoading={isLoadingTDEE || isLoadingDiary} />
      <DiaryTitle>{title}</DiaryTitle>
      {entries.length > 0 ? (
        entries.map((entry) => (
          <DiaryItem key={entry.id} onClick={() => handleEdit(entry.id)}>
            <FoodName>{entry.food}</FoodName>
            <FoodNutrition>
              <FoodCal>{entry.nutrition?.calories || "未知"} | </FoodCal>
              <FoodCarbo>
                {entry.nutrition?.carbohydrates || "未知"} |
              </FoodCarbo>
              <FoodProtein>{entry.nutrition?.protein || "未知"} | </FoodProtein>
              <FoodFat>{entry.nutrition?.fat || "未知"}</FoodFat>
            </FoodNutrition>
            <DeleteButtonContainer>
              <DeleteButton
                src={trashImg}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(entry.id, entry.food || "此項目");
                }}
              />
            </DeleteButtonContainer>
          </DiaryItem>
        ))
      ) : (
        <EmptyList>No entries yet</EmptyList>
      )}
    </MealSectionContainer>
  );

  const handleEdit = (entryId: string) => {
    setSelectedEntryId(entryId);
    setIsModalOpen(true);
  };
  const handleMenuToggle = () => {
    setToggleMenu((prev) => !prev);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntryId(null);
  };

  return (
    <Wrapper>
      {ConfirmDialogComponent}
      {toggleMenu && <Overlay onClick={handleMenuToggle} />}
      <HamburgerIcon onClick={handleMenuToggle} />
      <Sidebar toggleMenu={toggleMenu} />
      <Container>
        <Title>Diary Summary</Title>
        <InfoWrapper>
          <InfoContainer>
            <UserInfoCotainer>
              <UserImage src={userImg} />
              <TotalTarget>
                <RemainCaloriesContainer>
                  <TotalTargetTitle>Calories Remaining</TotalTargetTitle>
                  <HandwrittenContainer>
                    <RemainCalories>
                      {remainingCalories
                        ? remainingCalories.toFixed(0)
                        : "2141"}
                    </RemainCalories>
                  </HandwrittenContainer>
                </RemainCaloriesContainer>
                <ButtonsContainer>
                  <ButtonContainer>
                    <ButtonImg src={calculatorImg} />
                    <Button
                      label="Calculate TDEE"
                      justifyContent={"flex-start"}
                      onClick={() =>
                        navigate("../calculator", {
                          state: { fromUserInfo: true },
                        })
                      }
                    />
                  </ButtonContainer>
                  <ButtonContainer>
                    <ButtonImg src={searchImg} />
                    <Button
                      label="Search Food"
                      justifyContent={"flex-start"}
                      onClick={() =>
                        navigate("../food", { state: { fromUserInfo: true } })
                      }
                    />
                  </ButtonContainer>
                  <ButtonContainer>
                    <ButtonImg src={createImg} />
                    <Button
                      label="Create Diary"
                      justifyContent={"flex-start"}
                      onClick={() =>
                        navigate("../diary", { state: { fromUserInfo: true } })
                      }
                    />
                  </ButtonContainer>
                  <ButtonContainer>
                    <ButtonImg src={report} />
                    <Button
                      label="Check Report"
                      justifyContent={"flex-start"}
                      onClick={() =>
                        navigate("../report", { state: { fromUserInfo: true } })
                      }
                    />
                  </ButtonContainer>
                </ButtonsContainer>
                <TodayTargetWrapper>
                  <TodayTargetContainer>
                    <TargetProgressContainer>
                      <Line
                        percent={Math.max(0, Math.min(percentage, 100))}
                        strokeWidth={4}
                        strokeColor={todayNutrition > 0 ? "green" : "gray"}
                        trailWidth={10}
                        trailColor="#d3d3d3"
                        strokeLinecap="butt"
                      />
                      <IndicatorWrapper
                        style={{
                          left: `${Math.max(0, Math.min(percentage, 100))}%`,
                        }}
                      >
                        <Progress>
                          {todayNutrition ? todayNutrition.toFixed(0) : 0} Cal
                        </Progress>
                        <TriangleIndicator />
                      </IndicatorWrapper>
                      <ProgressNumbers>
                        <span>0</span>
                        <span>{tdee ? tdee : 0}</span>
                      </ProgressNumbers>
                    </TargetProgressContainer>
                  </TodayTargetContainer>
                </TodayTargetWrapper>
              </TotalTarget>
            </UserInfoCotainer>
          </InfoContainer>
        </InfoWrapper>
        <DiaryList>
          <DiaryTitle>Today I ate</DiaryTitle>
          <DatePickerContainer>
            <Flatpickr
              value={selectedDate}
              onChange={(date: Date[]) => setSelectedDate(date[0])}
              options={{ dateFormat: "Y-m-d" }}
            />
          </DatePickerContainer>

          <MealSection title="Breakfast" entries={meals.breakfast} />
          <MealSection title="Lunch" entries={meals.lunch} />
          <MealSection title="Dinner" entries={meals.dinner} />
          <MealSection title="Snack" entries={meals.snack} />
        </DiaryList>
        {isModalOpen && selectedEntryId && (
          <Modal onClose={closeModal}>
            <DiaryFoodModal onClose={closeModal} entryId={selectedEntryId} />
          </Modal>
        )}
      </Container>
    </Wrapper>
  );
};

export default UserInfo;

const Wrapper = styled.div`
  display: flex;
  background-image: url(${BGI});
  margin: 0 0 0 150px;
  z-index: 0;

  @media (max-width: 1000px) {
    margin: 0;
  }
`;
const MealSectionContainer = styled.div`
  margin: 12px 0;
  @media (max-width: 1000px) {
    width: 100%;
    margin: 0 auto;
  }
`;

const EmptyList = styled.div`
  color: gray;
`;
const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  margin: 50px auto 72px auto;
  width: 90%;
  background-color: #fff;
  padding: 24px 24px;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  z-index: 2;
  @media (max-width: 1000px) {
    margin: 50px 100px 72px 50px;
  }
`;

const Title = styled.h1`
  @media (max-width: 1000px) {
    text-align: center;
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (max-width: 1000px) {
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
  }
`;
const InfoContainer = styled.div`
  display: flex;
  width: 100%;
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;
const UserInfoCotainer = styled.div`
  display: flex;
  width: 100%;
  margin: 0;
  @media (max-width: 1000px) {
    flex-direction: column;
    justify-content: center;
    align-items: start;
    width: 90%;
  }
  @media (max-width: 480px) {
    align-items: center;
  }
`;

const UserImage = styled.img`
  height: 280px;
  @media (max-width: 1000px) {
    width: 250px;
  }
  @media (max-width: 768px) {
    width: 250px;
  }
  @media (max-width: 480px) {
    width: 120px;
  }
`;
const RemainCaloriesContainer = styled.div`
  display: flex;
`;
const TodayTargetWrapper = styled.div`
  position: relative;
  bottom: 48px;
  display: flex;
  flex-direction: column;
  @media (max-width: 480px) {
    position: absolute;
    top: 140px;
    right: 24px;
    width: 85%;
  }
  @media (max-width: 480px) {
    position: absolute;
    top: 160px;
    right: 24px;
    width: 85%;
  }
  @media (max-width: 360px) {
    position: absolute;
    top: 200px;
    right: 24px;
    width: 85%;
  }
`;
const TotalTarget = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  font-size: 18px;

  @media (max-width: 480px) {
    margin-top: 48px;
  }
`;
const TotalTargetTitle = styled.span`
  position: relative;
  top: 24px;
  width: 350px;
  font-size: 30px;
  @media (max-width: 1000px) {
    left: 0;
    text-align: center;
    letter-spacing: 16px;
    font-weight: 700;
  }
  @media (max-width: 480px) {
    width: 100%;
    letter-spacing: 0;
  }
`;
const HandwrittenContainer = styled.div`
  position: relative;
  display: flex;
  width: auto;
  top: 12px;
  right: 24px;
  @media (max-width: 1000px) {
    left: 36px;
    width: 85%;
  }
  @media (max-width: 480px) {
    left: 24px;
  }
`;
const RemainCalories = styled.div`
  font-size: 48px;
  color: #6db96d;
`;
const TodayTargetContainer = styled.div`
  position: relative;
  display: flex;
  width: auto;
  align-items: center;
  @media (max-width: 1000px) {
    padding: 0 12px;
  }
  @media (max-width: 480px) {
    padding: 0 0;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: left;
  position: relative;
  width: 100%;
  gap: 10px;
  margin-top: 20px;
  @media (max-width: 1000px) {
    display: flex;
    right: 30px;
    top: 120px;
    flex-direction: column;
    width: 40%;
    gap: 48px;
    margin: 0 auto;
  }
  @media (max-width: 768px) {
    gap: 48px;
  }
  @media (max-width: 480px) {
    top: 0;
    right: 0;
    width: 100%;
    gap: 12px;
  }
`;
const ButtonImg = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;
const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  width: 170px;
`;
const DeleteButtonContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  z-index: 10;
`;
const DeleteButton = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
`;

const TargetProgressContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 100px;
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  top: -38px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
`;

const TriangleIndicator = styled.div`
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 15px solid green;
`;

const Progress = styled.span`
  font-size: 12px;
  margin-bottom: 5px;
`;
const ProgressNumbers = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  span {
    font-size: 14px;
    color: gray;
  }
`;
const DatePickerContainer = styled.div``;
const DiaryList = styled.div`
  margin: 0;
  @media (max-width: 1000px) {
    width: 100%;
    margin: 60px 12px 0 12px;
  }
  @media (max-width: 480px) {
    margin: 24px 0;
  }
`;

const DiaryTitle = styled.h2``;
const DiaryItem = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  margin: 12px 0;
  padding: 4px 40px 4px 4px;
  border: 1px solid gray;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
`;
const FoodName = styled.span`
  font-size: 24px;
`;

const FoodNutrition = styled.div``;
const FoodCal = styled.span``;
const FoodCarbo = styled.span``;
const FoodProtein = styled.span``;
const FoodFat = styled.span``;

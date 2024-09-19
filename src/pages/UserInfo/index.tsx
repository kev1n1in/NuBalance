import Sidebar from "../../components/Sidebar";
import styled from "styled-components";
import Button from "../../components/Button";
import { Line } from "rc-progress";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { getLatestTDEE, getDiaryEntry } from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import userImg from "./userImg.png";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { deleteDiaryEntry } from "../../firebase/firebaseServices";
import trashImg from "./trash.png";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: latestTDEE,
    isLoading: isLoadingTDEE,
    error: errorTDEE,
  } = useQuery(
    "latestTDEE",
    async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("用戶未登入");
      }
      return await getLatestTDEE(currentUser);
    },
    {
      onSuccess: (data) => {
        console.log("獲取的 TDEE:", data);
      },
      onError: (error) => {
        console.error("獲取 TDEE 失敗:", error);
      },
    }
  );

  const {
    data: diaryEntries = [],
    isLoading: isLoadingDiary,
    error: errorDiary,
  } = useQuery<DiaryEntry[]>(
    ["diaryEntries", selectedDate],
    async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("用戶未登入");
      }
      const formattedDate = selectedDate.toLocaleDateString("sv-SE");
      return await getDiaryEntry(currentUser, formattedDate);
    },
    {
      onSuccess: (data) => {
        const formattedDate = selectedDate.toLocaleDateString("sv-SE");
        console.log("日期:", formattedDate);
        console.log("獲取的日記條目:", data);
      },
      onError: (error) => {
        console.error("獲取日記條目失敗:", error);
      },
    }
  );
  const extractNumberFromString = (str: string): number => {
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const todayNutrition = diaryEntries
    ? diaryEntries.reduce((total, entry) => {
        const caloriesStr = entry.nutrition
          ? entry.nutrition.calories || "0"
          : "0";
        const calories = extractNumberFromString(caloriesStr);
        console.log(`Entry: ${entry.food}, Calories extracted: ${calories}`);
        return total + calories;
      }, 0)
    : 0;

  console.log(`Total calories consumed today: ${todayNutrition}`);

  const tdee = latestTDEE || 1800;
  const remainingCalories = tdee - todayNutrition;
  const percentage = (todayNutrition / tdee) * 100;

  if (isLoadingTDEE || isLoadingDiary) return <div>Loading...</div>;

  if (errorTDEE || errorDiary) {
    const errorMessageTDEE = (errorTDEE as Error)?.message || "未知的錯誤";
    const errorMessageDiary = (errorDiary as Error)?.message || "未知的錯誤";

    return <div>Error: {errorMessageTDEE || errorMessageDiary}</div>;
  }

  const handleNavigation = (path: string) => {
    navigate(path);
  };
  const handleDelete = async (id: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("用戶未登入");
      }

      await deleteDiaryEntry(currentUser, id);
      console.log(`日记 ${id} 已删除`);
      queryClient.invalidateQueries(["diaryEntries", selectedDate]);
    } catch (error) {
      console.error("刪除日記失敗:", error);
    }
  };

  const MealSection = ({
    title,
    entries,
  }: {
    title: string;
    entries: DiaryEntry[];
  }) => (
    <MealSectionContainer>
      <DiaryTitle>{title}</DiaryTitle>
      {entries.length > 0 ? (
        entries.map((entry) => (
          <DiaryItem key={entry.id}>
            <FoodName>{entry.food}</FoodName>
            <FoodNutrition>
              <FoodCal>{entry.nutrition?.calories || "未知"} | </FoodCal>
              <FoodCarbo>
                {entry.nutrition?.carbohydrates || "未知"} |{" "}
              </FoodCarbo>
              <FoodProtein>{entry.nutrition?.protein || "未知"} | </FoodProtein>
              <FoodFat>{entry.nutrition?.fat || "未知"}</FoodFat>
            </FoodNutrition>
            <DeleteButton
              src={trashImg}
              onClick={() => handleDelete(entry.id)}
            />
          </DiaryItem>
        ))
      ) : (
        <EmptyList>尚未新增</EmptyList>
      )}
    </MealSectionContainer>
  );
  const meals = {
    breakfast: diaryEntries.filter((entry) => entry.meal === "早餐"),
    lunch: diaryEntries.filter((entry) => entry.meal === "午餐"),
    dinner: diaryEntries.filter((entry) => entry.meal === "晚餐"),
    snack: diaryEntries.filter((entry) => entry.meal === "點心"),
  };
  return (
    <Wrapper>
      <Sidebar />
      <Container>
        <Title>您的每日摘要</Title>
        <InfoWrapper>
          <UserInfoCotainer>
            <UserImage src={userImg} />
            {/* <WeightTarget>3kg</WeightTarget> */}
          </UserInfoCotainer>
          <TodayTargetWrapper>
            <TodayTargetContainer>
              <TotalTarget>
                剩餘熱量
                <br />
                {remainingCalories.toFixed(0)} 大卡
              </TotalTarget>
              <ButtonContainer>
                <Button
                  label="更改熱量估計"
                  onClick={() => handleNavigation("../calculator")}
                  margin="12px 0"
                ></Button>
                <Button
                  label="新增飲食"
                  onClick={() => handleNavigation("../diary")}
                  margin="12px 0"
                ></Button>
              </ButtonContainer>
            </TodayTargetContainer>
            <TodayTargetContainer>
              <TargetProgressContainer>
                <Line
                  percent={Math.max(0, Math.min(percentage, 100))}
                  strokeWidth={4}
                  strokeColor="green"
                  trailWidth={10}
                  trailColor="#d3d3d3"
                  strokeLinecap="butt"
                />
                <IndicatorWrapper
                  style={{ left: `${Math.max(0, Math.min(percentage, 100))}%` }}
                >
                  <Progress>{todayNutrition.toFixed(0)} 大卡</Progress>
                  <TriangleIndicator />
                </IndicatorWrapper>
                <ProgressNumbers>
                  <span>0</span>
                  <span>{tdee}</span>
                </ProgressNumbers>
              </TargetProgressContainer>
            </TodayTargetContainer>
          </TodayTargetWrapper>
        </InfoWrapper>
        <DiaryList>
          <DatePickerContainer>
            <Flatpickr
              value={selectedDate}
              onChange={(date: Date[]) => setSelectedDate(date[0])}
              options={{
                dateFormat: "Y-m-d",
              }}
            />
          </DatePickerContainer>
          <DiaryTitle>今天吃ㄌ</DiaryTitle>
          <MealSection title="早餐" entries={meals.breakfast} />
          <MealSection title="午餐" entries={meals.lunch} />
          <MealSection title="晚餐" entries={meals.dinner} />
          <MealSection title="點心" entries={meals.snack} />
        </DiaryList>
      </Container>
    </Wrapper>
  );
};

export default UserInfo;

const Wrapper = styled.div`
  margin: 50px 0 0 150px;
`;
const MealSectionContainer = styled.div`
  margin: 12px 0;
`;

const EmptyList = styled.div`
  color: gray;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 80%;
`;

const Title = styled.h1``;

const InfoWrapper = styled.div`
  display: flex;
`;

const UserInfoCotainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto 24px auto 0;
`;

const UserImage = styled.img`
  width: 120px;
`;

const WeightTarget = styled.div``;

const TodayTargetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const TodayTargetContainer = styled.div`
  display: flex;
  height: 100px;
  align-items: center;
`;

const TotalTarget = styled.div`
  width: 150px;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 20px;
`;
const DeleteButton = styled.img`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const TargetProgressContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 60px;
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
  margin: 24px 0;
`;

const DiaryTitle = styled.h2``;
const DiaryItem = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  margin: 12px 0;
  padding: 4px;
  border: 1px solid gray;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08);
`;
const FoodName = styled.span``;

const FoodNutrition = styled.div``;
const FoodCal = styled.span``;
const FoodCarbo = styled.span``;
const FoodProtein = styled.span``;
const FoodFat = styled.span``;

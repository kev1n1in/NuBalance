import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getUserHistory, getDiaryEntry } from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import RoughBarChart from "../../components/RoughCharts.tsx/Bar";
import RoughPieChart from "../../components/RoughCharts.tsx/Pie";
import Overlay from "../../components/Overlay";
import HamburgerIcon from "../../components/MenuButton";
import { onAuthStateChanged, User } from "firebase/auth";
import HandwrittenText from "../../components/HandWrittenText";

interface HistoryItem {
  clientUpdateTime: { seconds: number };
  weight: number;
  bmi: number;
  date: string;
  bodyFat: number;
}
interface NutritionData {
  fat: string;
  calories: string;
  carbohydrates: string;
  protein: string;
}

interface DiaryEntry {
  id: string;
  nutrition?: NutritionData;
}

const Report: React.FC = () => {
  const [weightChartData, setWeightChartData] = useState<
    { date: string; weight: number }[]
  >([]);
  const [nutritionData, setNutritionData] = useState<{
    calories: number;
    carbohydrates: number;
    protein: number;
    fat: number;
  } | null>(null);
  const [latestBodyFat, setLatestBodyFat] = useState<number | null>(null);
  const [latestBMI, setLatestBMI] = useState<number | null>(null);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const {
    data: allHistory = [],
    isLoading: isLoadingTDEE,
    error: errorTDEE,
  } = useQuery(
    ["userHistory", user],
    async () => {
      if (!user) {
        throw new Error("用戶未登入");
      }
      const allHistory = await getUserHistory(user);
      return allHistory.map((item: HistoryItem) => ({
        date: new Date(item.clientUpdateTime.seconds * 1000)
          .toISOString()
          .split("T")[0],
        weight: item.weight,
        bodyFat: item.bodyFat,
        bmi: item.bmi,
      }));
    },
    { enabled: !!user }
  );

  useEffect(() => {
    if (allHistory.length > 0) {
      const weightData = allHistory.map((item: HistoryItem) => ({
        date: item.date.slice(5),
        weight: item.weight,
      }));
      const latestEntry = allHistory[allHistory.length - 1];
      setLatestBodyFat(latestEntry.bodyFat);
      setLatestBMI(latestEntry.bmi);
      setWeightChartData(weightData);
    }
  }, [allHistory]);

  useEffect(() => {
    const fetchNutritionData = async () => {
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        const diaryEntries: DiaryEntry[] = await getDiaryEntry(user, today);

        if (diaryEntries.length === 0) {
          setNutritionData(null);
          return;
        }

        let totalCalories = 0;
        let totalCarbohydrates = 0;
        let totalProtein = 0;
        let totalFat = 0;

        diaryEntries.forEach((entry) => {
          if (entry.nutrition) {
            totalCalories +=
              parseFloat(entry.nutrition.calories.replace(/[^\d.-]/g, "")) || 0;
            totalCarbohydrates +=
              parseFloat(
                entry.nutrition.carbohydrates.replace(/[^\d.-]/g, "")
              ) || 0;
            totalProtein +=
              parseFloat(entry.nutrition.protein.replace(/[^\d.-]/g, "")) || 0;
            totalFat +=
              parseFloat(entry.nutrition.fat.replace(/[^\d.-]/g, "")) || 0;
          }
        });

        setNutritionData({
          calories: totalCalories,
          carbohydrates: totalCarbohydrates,
          protein: totalProtein,
          fat: totalFat,
        });
      }
    };

    fetchNutritionData();
  }, [user]);

  if (isLoadingTDEE) {
    return <div>Loading...</div>;
  }

  if (errorTDEE) {
    const errorMessage = (errorTDEE as Error).message;
    return <div>Error: {errorMessage}</div>;
  }

  const roughData = {
    labels: weightChartData.map((item) => item.date),
    values: weightChartData.map((item) => item.weight),
  };

  return (
    <Wrapper>
      {toggleMenu && <Overlay onClick={() => setToggleMenu(false)} />}
      <HamburgerIcon onClick={() => setToggleMenu(!toggleMenu)} />
      <Sidebar toggleMenu={toggleMenu} />
      <Container>
        <Title>分析報告</Title>
        <HandwrittenText
          text={`BMI: ${latestBMI ? latestBMI.toFixed(2) : "無資料"}`}
          roughness={0}
          color="black"
          fill="green"
          fontSize={75}
        />

        <HandwrittenText
          text={`BodyFat: ${
            latestBodyFat ? latestBodyFat.toFixed(2) + "%" : "無資料"
          }`}
          roughness={0}
          color="black"
          fill="green"
          fontSize={75}
        />
        <ChartContainer>
          <ChartTitle>體重變化</ChartTitle>
          <RoughBarChart data={roughData} />
        </ChartContainer>
        <ChartContainer>
          <ChartTitle>營養素總和</ChartTitle>
          {nutritionData ? (
            <CenteredChartContainer>
              <RoughPieChart
                data={{
                  labels: ["熱量", "碳水化合物", "蛋白質", "脂肪"],
                  values: [
                    nutritionData.calories,
                    nutritionData.carbohydrates,
                    nutritionData.protein,
                    nutritionData.fat,
                  ],
                }}
              />
            </CenteredChartContainer>
          ) : (
            <p>今天沒有營養素記錄</p>
          )}
        </ChartContainer>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  background-color: #f0f0f0;
  margin: 0 0 0 150px;
  @media (max-width: 1000px) {
    margin: 0;
  }
`;

const Container = styled.div`
  width: 80%;
  margin: 0 auto;
`;

const ChartContainer = styled.div`
  margin: 24px 0;
  padding: 12px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

const CenteredChartContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 600px;
  overflow: hidden;
`;

const ChartTitle = styled.h2``;

const Title = styled.h1`
  text-align: center;
  font-size: 30px;
`;

export default Report;

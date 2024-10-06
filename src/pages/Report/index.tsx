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
import Loader from "../../components/Loader";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

interface HistoryItem {
  clientUpdateTime: { seconds: number };
  weight: number;
  bmi: number;
  date: string;
  bodyFat: number;
}
interface NutritionData {
  fat: string;
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
    carbohydrates: number;
    protein: number;
    fat: number;
  } | null>(null);
  const [latestBodyFat, setLatestBodyFat] = useState<number | null>(null);
  const [latestBMI, setLatestBMI] = useState<number | null>(null);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  ); // 單一日期選擇

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
    ["userHistory", user, selectedDate],
    async () => {
      if (!user) {
        throw new Error("用戶未登入");
      }

      const allHistory = await getUserHistory(user, false, selectedDate);

      return allHistory.map((item: HistoryItem) => ({
        date: new Date(item.clientUpdateTime.seconds * 1000)
          .toISOString()
          .split("T")[0],
        weight: item.weight,
        bodyFat: item.bodyFat,
        bmi: item.bmi,
      }));
    },
    { enabled: !!user && !!selectedDate }
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
    } else {
      setWeightChartData([]);
      setLatestBodyFat(null);
      setLatestBMI(null);
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

        let totalCarbohydrates = 0;
        let totalProtein = 0;
        let totalFat = 0;

        diaryEntries.forEach((entry) => {
          if (entry.nutrition) {
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

        const adjustedCarbohydrates = totalCarbohydrates * 4;
        const adjustedProtein = totalProtein * 4;
        const adjustedFat = totalFat * 9;

        setNutritionData({
          carbohydrates: adjustedCarbohydrates,
          protein: adjustedProtein,
          fat: adjustedFat,
        });
      }
    };

    fetchNutritionData();
  }, [user]);

  if (errorTDEE) {
    const errorMessage = (errorTDEE as Error).message;
    return <div>Error: {errorMessage}</div>;
  }

  const roughData = {
    labels: weightChartData.map((item) => item.date),
    values: weightChartData.map((item) => item.weight),
  };
  const handleDateChange = (selectedDates: Date[]) => {
    const newDate = selectedDates[0];
    setSelectedDate(newDate);
  };

  return (
    <Wrapper>
      <Loader isLoading={isLoadingTDEE} />
      {toggleMenu && <Overlay onClick={() => setToggleMenu(false)} />}
      <HamburgerIcon onClick={() => setToggleMenu(!toggleMenu)} />
      <Sidebar toggleMenu={toggleMenu} />
      <Container>
        <Title>Report</Title>
        <BMIWrittenContainer>
          <BMIText>{`BMI: ${
            typeof latestBMI === "number" ? latestBMI.toFixed(2) : "0"
          }`}</BMIText>
        </BMIWrittenContainer>
        <BodyFatWrittenContainer>
          <BodyFatText>{`BodyFat: ${
            typeof latestBodyFat === "number"
              ? latestBodyFat.toFixed(2) + "%"
              : "0"
          }`}</BodyFatText>
        </BodyFatWrittenContainer>

        <ChartContainer>
          <ChartHeaderContainer>
            <ChartTitle>Weight change for the 7 days before</ChartTitle>
            <DatePickerContainer>
              <Flatpickr
                value={selectedDate}
                onChange={handleDateChange}
                options={{ dateFormat: "Y-m-d" }}
                style={{ fontFamily: "KG Second Chances", width: "100px" }}
              />
            </DatePickerContainer>
          </ChartHeaderContainer>

          {weightChartData.length > 0 ? (
            <RoughBarChart data={roughData} />
          ) : (
            <p>沒有體重變化的歷史資料</p>
          )}
        </ChartContainer>
        <ChartContainer>
          <ChartTitle>Today total nutrients</ChartTitle>
          {nutritionData ? (
            <CenteredChartContainer>
              <RoughPieChart
                data={{
                  labels: ["Carbohydrates", "Protein", "Fat"],
                  values: [
                    nutritionData.carbohydrates,
                    nutritionData.protein,
                    nutritionData.fat,
                  ],
                }}
              />
            </CenteredChartContainer>
          ) : (
            <p>No nutrient records for today.</p>
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
const ChartHeaderContainer = styled.div`
  display: flex;
`;
const BMIWrittenContainer = styled.div`
  width: 45%;
`;
const BMIText = styled.p`
  color: #4ea34e;
`;

const BodyFatText = styled.p`
  color: #4ea34e;
`;
const BodyFatWrittenContainer = styled.div`
  width: 60%;
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

const ChartTitle = styled.h2`
  margin-right: 12px;
`;
const DatePickerContainer = styled.div`
  margin-top: 4px;
`;
const Title = styled.h1`
  text-align: center;
  font-size: 30px;
`;

export default Report;

import { onAuthStateChanged, User } from "firebase/auth";
import "flatpickr/dist/flatpickr.min.css";
import { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import { useQuery } from "react-query";
import styled from "styled-components";
import RoughBarChart from "../../components/Charts.tsx/Bar";
import RoughPieChart from "../../components/Charts.tsx/Pie";
import Loader from "../../components/Loader";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import Sidebar from "../../components/Sidebar";
import { auth } from "../../firebase/firebaseConfig";
import { getDiaryEntry, getUserHistory } from "../../firebase/firebaseServices";
import { ReportDiaryEntry, ReportHistoryItem } from "../../types/Pages";

const Report = () => {
  const [weightChartData, setWeightChartData] = useState<
    { date: string; weight: number }[]
  >([]);
  const [nutritionData, setNutritionData] = useState<{
    carbohydrates: number;
    protein: number;
    fat: number;
  } | null>(null);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [activeTab, setActiveTab] = useState<string>("Weight");

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

      return allHistory.map((item: ReportHistoryItem) => ({
        date: new Date(item.clientUpdateTime.seconds * 1000)
          .toISOString()
          .split("T")[0],
        weight: item.weight,
        bodyFat: item.bodyFat,
      }));
    },
    { enabled: !!user && !!selectedDate }
  );

  useEffect(() => {
    if (allHistory.length > 0) {
      const weightData = allHistory.map((item: ReportHistoryItem) => ({
        date: item.date.slice(5),
        weight: item.weight,
      }));
      setWeightChartData(weightData);
    } else {
      setWeightChartData([]);
    }
  }, [allHistory]);

  useEffect(() => {
    const fetchNutritionData = async () => {
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        const diaryEntries: ReportDiaryEntry[] = await getDiaryEntry(
          user,
          today
        );

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
        <BarChartContainer
          isActive={activeTab === "Weight"}
          style={{ display: activeTab === "Weight" ? "block" : "none" }}
        >
          <ChartHeaderContainer>
            <BarFolderTab onClick={() => setActiveTab("Nutrients")}>
              Nutrients
            </BarFolderTab>
            <ChartTitle>Weight change for the 7 entries before</ChartTitle>
            <DatePickerContainer>
              <Flatpickr
                value={selectedDate}
                onChange={handleDateChange}
                options={{ dateFormat: "Y-m-d" }}
                style={{
                  fontFamily: "KG Second Chances",
                  width: "100px",
                  borderRadius: "4px",
                }}
              />
            </DatePickerContainer>
          </ChartHeaderContainer>

          {weightChartData.length > 0 ? (
            <RoughBarChart data={roughData} />
          ) : (
            <p>No body weight records</p>
          )}
        </BarChartContainer>
        <PieChartContainer
          isActive={activeTab === "Weight"}
          style={{ display: activeTab === "Nutrients" ? "block" : "none" }}
        >
          <PieFolderTab onClick={() => setActiveTab("Weight")}>
            Weight
          </PieFolderTab>
          <ChartTitle>Today total nutrients (%)</ChartTitle>
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
        </PieChartContainer>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  background-color: #f0f0f0;
  height: 110vh;
  margin: 0 0 0 150px;
  @media (max-width: 1000px) {
    margin: 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  margin: 0 auto;
  z-index: 0;
`;
const ChartHeaderContainer = styled.div`
  display: flex;
`;

const BarChartContainer = styled.div<{ isActive: boolean }>`
  position: relative;
  margin: 24px 0;
  padding: 12px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  &:after {
    content: "";
    position: absolute;
    top: -5px;
    left: 16px;
    width: 200px;
    height: 20px;
    background-color: #fff;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    z-index: 1;
    @media (max-width: 768px) {
      width: 120px;
    }
  }
  &:before {
    content: "Weight";
    position: absolute;
    top: -40px;
    left: 16px;
    width: 200px;
    height: 60px;
    font-size: 24px;
    text-align: center;
    padding-right: 4px;
    background-color: #fff;
    border: 1px solid black;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    z-index: -1;
    color: ${({ isActive }) => (isActive ? "#a23419" : "gray")};
    @media (max-width: 768px) {
      width: 120px;
    }
  }
`;
const BarFolderTab = styled.div`
  display: flex;
  position: absolute;
  top: -40px;
  left: 220px;
  width: 200px;
  height: 60px;
  font-size: 24px;
  justify-content: center;
  padding-right: 4px;
  background-color: #fff;
  border: 1px solid black;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  z-index: -2;
  cursor: pointer;
  @media (max-width: 768px) {
    left: 140px;
    width: 120px;
  }
`;

const PieChartContainer = styled.div<{ isActive: boolean }>`
  position: relative;
  margin: 24px 0;
  padding: 12px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  &:after {
    content: "";
    position: absolute;
    top: -5px;
    left: 220px;
    width: 200px;
    height: 20px;
    background-color: #fff;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    z-index: 1;
    @media (max-width: 768px) {
      left: 140px;
      width: 120px;
    }
  }
  &:before {
    content: "Nutrients";
    position: absolute;
    top: -40px;
    left: 220px;
    width: 200px;
    height: 60px;
    font-size: 24px;
    text-align: center;
    padding-right: 4px;
    background-color: #fff;
    border: 1px solid black;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    z-index: -1;
    color: ${({ isActive }) => (isActive ? "gray" : "#a23419")};
    @media (max-width: 768px) {
      left: 140px;
      width: 120px;
    }
  }
`;

const PieFolderTab = styled.div`
  display: flex;
  position: absolute;
  top: -40px;
  left: 16px;
  width: 200px;
  height: 60px;
  font-size: 24px;
  justify-content: center;
  padding-right: 4px;
  background-color: #fff;
  border: 1px solid black;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  z-index: -2;
  cursor: pointer;
  @media (max-width: 768px) {
    width: 120px;
  }
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
  font-size: 40px;
  margin: 24px 0;
`;

export default Report;

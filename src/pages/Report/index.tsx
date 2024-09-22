import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useQuery } from "react-query";
import { getUserHistory, getDiaryEntry } from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { useEffect, useState } from "react";

interface HistoryItem {
  clientUpdateTime: { seconds: number };
  height: number;
  weight: number;
}

interface NutritionData {
  protein: string;
  carbohydrates: string;
  fat: string;
}

interface DiaryEntry {
  id: string;
  nutrition?: NutritionData;
}

interface FormattedNutritionData {
  id: string;
  label: string;
  value: number;
}

const getCurrentFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Report = () => {
  const currentDate = getCurrentFormattedDate();
  const [heightChartData, setHeightChartData] = useState<
    { id: string; data: { x: string; y: number }[] }[]
  >([]);
  const [weightChartData, setWeightChartData] = useState<
    { id: string; data: { x: string; y: number }[] }[]
  >([]);
  const [nutritionData, setNutritionData] = useState<FormattedNutritionData[]>(
    []
  );

  // 查詢使用者歷史數據
  const {
    data: allHistory = [],
    isLoading: isLoadingTDEE,
    error: errorTDEE,
  } = useQuery(
    "userHistory",
    async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("用戶未登入");
      }
      const allHistory = await getUserHistory(currentUser);

      return allHistory.map((item: HistoryItem) => ({
        date: new Date(item.clientUpdateTime.seconds * 1000),
        height: item.height,
        weight: item.weight,
      }));
    },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (allHistory.length > 0) {
      const nivoHeightData = [
        {
          id: "Height",
          data: allHistory.map((item: { date: Date; height: number }) => ({
            x: item.date.toISOString().split("T")[0],
            y: item.height,
          })),
        },
      ];

      const nivoWeightData = [
        {
          id: "Weight",
          data: allHistory.map((item: { date: Date; weight: number }) => ({
            x: item.date.toISOString().split("T")[0],
            y: item.weight,
          })),
        },
      ];

      setHeightChartData(nivoHeightData);
      setWeightChartData(nivoWeightData);
    }
  }, [allHistory]);

  // 查詢營養數據
  const fetchNutritionData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const diaryEntries: DiaryEntry[] = await getDiaryEntry(
      currentUser,
      currentDate
    );
    if (diaryEntries.length > 0) {
      const nutrition = diaryEntries[0].nutrition;

      if (nutrition) {
        // 確保解析數值是合法的數字，並且給定預設值
        const protein = parseFloat(
          nutrition.protein.match(/[\d.]+/)?.[0] || "0"
        );
        const carbs = parseFloat(
          nutrition.carbohydrates.match(/[\d.]+/)?.[0] || "0"
        );
        const fat = parseFloat(nutrition.fat.match(/[\d.]+/)?.[0] || "0");

        const formattedData: FormattedNutritionData[] = [
          { id: "蛋白質", label: "蛋白質", value: protein },
          { id: "碳水化合物", label: "碳水化合物", value: carbs },
          { id: "脂肪", label: "脂肪", value: fat },
        ];

        setNutritionData(formattedData);
      }
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, []);

  if (isLoadingTDEE) {
    return <div>Loading...</div>;
  }

  if (errorTDEE) {
    const errorMessageTDEE = (errorTDEE as Error)?.message || "未知的錯誤";
    return <div>Error: {errorMessageTDEE}</div>;
  }

  return (
    <Wrapper>
      <Sidebar />
      <h1>我是分析報告</h1>

      <Title>身高</Title>
      <div style={{ height: "400px" }}>
        {heightChartData.length > 0 ? (
          <ResponsiveLine
            data={heightChartData}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: true,
              reverse: false,
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickValues: "every 1 day",
              legend: "日期",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickValues: 5,
              legend: "高度 (cm)",
              legendOffset: -40,
              legendPosition: "middle",
            }}
            colors={{ scheme: "category10" }}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
          />
        ) : (
          <p>沒有可用的身高歷史記錄。</p>
        )}
      </div>

      <Title>體重</Title>
      <div style={{ height: "400px", marginTop: "50px" }}>
        {weightChartData.length > 0 ? (
          <ResponsiveLine
            data={weightChartData}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: true,
              reverse: false,
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickValues: "every 1 day",
              legend: "日期",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickValues: 10,
              legend: "体重 (kg)",
              legendOffset: -40,
              legendPosition: "middle",
            }}
            colors={["#FFA500"]}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
          />
        ) : (
          <p>沒有可用的歷史紀錄</p>
        )}
      </div>

      <Title>今日營養素</Title>
      <div style={{ height: "400px", marginTop: "50px" }}>
        {nutritionData.length > 0 ? (
          <ResponsivePie
            data={nutritionData}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: "nivo" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            enableArcLinkLabels={true}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#333333"
            arcLabel={(d) =>
              `${d.value} (${(
                (d.value / nutritionData.reduce((a, b) => a + b.value, 0)) *
                100
              ).toFixed(2)}%)`
            }
          />
        ) : (
          <p>沒有可用的營養素記錄。</p>
        )}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 150px;
`;

const Title = styled.h2``;

export default Report;

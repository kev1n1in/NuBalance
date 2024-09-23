import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useQuery } from "react-query";
import { getUserHistory, getDiaryEntry } from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { RoughNotation } from "react-rough-notation";

interface HistoryItem {
  clientUpdateTime: { seconds: number };
  height: number;
  weight: number;
  bmi: number;
  bodyFat: number;
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

const COLORS = ["#FFA07A", "#20B2AA", "#FFD700"];

const Report = () => {
  const currentDate = getCurrentFormattedDate();
  const [weightChartData, setWeightChartData] = useState<
    { date: string; weight: number }[]
  >([]);
  const [bodyFatChartData, setBodyFatChartData] = useState<
    { date: string; bodyFat: number }[]
  >([]);
  const [nutritionData, setNutritionData] = useState<FormattedNutritionData[]>(
    []
  );
  const [latestBMI, setLatestBMI] = useState<number | null>(0);

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
      console.log("歷史數據:", allHistory);
      return allHistory.map((item: HistoryItem) => ({
        date: new Date(item.clientUpdateTime.seconds * 1000)
          .toISOString()
          .split("T")[0],
        weight: item.weight,
        bmi: item.bmi,
        bodyFat: item.bodyFat,
      }));
    },
    { refetchOnWindowFocus: false }
  );

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
        const protein = parseFloat(
          nutrition.protein.match(/[\d.]+/)?.[0] || "0"
        );
        const carbs = parseFloat(
          nutrition.carbohydrates.match(/[\d.]+/)?.[0] || "0"
        );
        const fat = parseFloat(nutrition.fat.match(/[\d.]+/)?.[0] || "0");
        const total = protein + carbs + fat;
        const formattedData: FormattedNutritionData[] = [
          { id: "蛋白質", label: "蛋白質", value: (protein / total) * 100 },
          {
            id: "碳水化合物",
            label: "碳水化合物",
            value: (carbs / total) * 100,
          },
          { id: "脂肪", label: "脂肪", value: (fat / total) * 100 },
        ];
        setNutritionData(formattedData);
      }
    }
  };

  useEffect(() => {
    if (allHistory.length > 0) {
      const sortedHistory = [...allHistory].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const weightData = sortedHistory.map((item) => ({
        date: item.date.slice(5),
        weight: item.weight,
      }));
      setWeightChartData(weightData);

      const bodyFatData = sortedHistory
        .filter((item, index) => index % 3 === 0)
        .map((item) => ({
          date: item.date.slice(5),
          bodyFat: item.bodyFat,
        }));

      setBodyFatChartData(bodyFatData);
      setLatestBMI(Number(sortedHistory[sortedHistory.length - 1].bmi ?? 0));
    }
  }, [allHistory]);

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

  const BMICategory = ({ currentBMI }: { currentBMI: number }) => {
    const getCategory = (bmi: number) => {
      if (bmi < 18.5) return "過輕";
      if (bmi >= 18.5 && bmi < 24.0) return "正常";
      if (bmi >= 24.0 && bmi < 27.0) return "過重";
      return "肥胖";
    };

    const category = getCategory(currentBMI);

    return (
      <RoughNotation
        type="underline"
        show={true}
        color="red"
        animationDelay={500}
      >
        <span style={{ fontFamily: "Caveat", fontSize: "36px", width: "auto" }}>
          BMI: {currentBMI.toFixed(1)}
        </span>
      </RoughNotation>
    );
  };

  return (
    <Wrapper>
      <Sidebar />
      <h1>我是分析報告</h1>

      {latestBMI !== null ? (
        <BMICategory currentBMI={latestBMI} />
      ) : (
        <p>無法取得 BMI 數據</p>
      )}

      <Title>體重變化</Title>
      <div style={{ height: "400px", width: "700px", marginTop: "50px" }}>
        {weightChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={weightChartData}
              barSize={40}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="weight"
                fill="#82ca9d"
                stroke="#000"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>沒有可用的歷史紀錄</p>
        )}
      </div>

      <Title>今日營養素比例</Title>
      <div style={{ height: "400px", width: "550px", marginLeft: "50px" }}>
        {nutritionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={nutritionData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                stroke="#000"
                strokeWidth={2}
              >
                {nutritionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>沒有可用的營養素記錄。</p>
        )}
      </div>
      <Title>體脂率變化</Title>
      <div style={{ height: "400px", width: "700px", marginTop: "50px" }}>
        {bodyFatChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={bodyFatChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="bodyFat"
                stroke="#8884d8"
                fill="#8884d8"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p>沒有可用的歷史體脂率紀錄</p>
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

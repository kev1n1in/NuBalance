import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useQuery } from "react-query";
import { getUserHistory, getDiaryEntry } from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import { ResponsiveLine } from "@nivo/line"; // 从 Nivo 导入折线图组件
import { ResponsivePie } from "@nivo/pie"; // 从 Nivo 导入圆饼图组件
import { useEffect, useState } from "react";

const getCurrentFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Report = () => {
  const currentDate = getCurrentFormattedDate();
  const [heightChartData, setHeightChartData] = useState([]); // 使用 state 来存储身高图表数据
  const [weightChartData, setWeightChartData] = useState([]); // 使用 state 来存储体重图表数据
  const [nutritionData, setNutritionData] = useState([]); // 存储营养素数据

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

      return allHistory.map((item) => ({
        date: new Date(item.clientUpdateTime.seconds * 1000),
        height: item.height,
        weight: item.weight, // 添加体重数据
      }));
    },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (allHistory.length > 0) {
      // 处理身高数据以匹配 Nivo 的格式
      const nivoHeightData = [
        {
          id: "Height", // 数据集的 id
          data: allHistory.map((item) => ({
            x: item.date.toISOString().split("T")[0], // 使用日期字符串作为 x 轴数据
            y: item.height, // 高度为 y 轴数据
          })),
        },
      ];

      // 处理体重数据以匹配 Nivo 的格式
      const nivoWeightData = [
        {
          id: "Weight", // 数据集的 id
          data: allHistory.map((item) => ({
            x: item.date.toISOString().split("T")[0], // 使用日期字符串作为 x 轴数据
            y: item.weight, // 体重为 y 轴数据
          })),
        },
      ];

      setHeightChartData(nivoHeightData); // 更新身高图表数据
      setWeightChartData(nivoWeightData); // 更新体重图表数据
    }
  }, [allHistory]);

  // 获取当天的营养素数据并格式化
  const fetchNutritionData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const diaryEntries = await getDiaryEntry(currentUser, currentDate);
    if (diaryEntries.length > 0) {
      const nutrition = diaryEntries[0].nutrition || {};

      // 使用正則表達式提取數字
      const protein = parseFloat(nutrition.protein?.match(/[\d.]+/)) || 1;
      const carbs = parseFloat(nutrition.carbohydrates?.match(/[\d.]+/)) || 1;
      const fat = parseFloat(nutrition.fat?.match(/[\d.]+/)) || 1;

      const formattedData = [
        { id: "蛋白质", label: "蛋白质", value: protein },
        { id: "碳水化合物", label: "碳水化合物", value: carbs },
        { id: "脂肪", label: "脂肪", value: fat },
      ];

      console.log("Formatted Nutrition Data:", formattedData); // Log to check data

      setNutritionData(formattedData); // 更新营养素数据
    }
  };

  useEffect(() => {
    fetchNutritionData(); // 在页面加载时获取营养数据
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
              orient: "bottom",
              legend: "日期",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              orient: "left",
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
              orient: "bottom",
              legend: "日期",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              orient: "left",
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
          <p>沒有可用的体重歷史記錄。</p>
        )}
      </div>

      {/* 圆饼图展示营养素 */}
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
              `${d.value} (${((d.value / d.data.value) * 100).toFixed(2)}%)`
            } // 显示数值和百分比
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

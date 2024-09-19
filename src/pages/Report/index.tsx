import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useQuery } from "react-query";
import { getUserHistory, getDiaryEntry } from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";

const getCurrentFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Report = () => {
  const currentDate = getCurrentFormattedDate();
  const {
    data: allHistory,
    isLoading: isLoadingTDEE,
    error: errorTDEE,
  } = useQuery("userHistory", async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("用戶未登入");
    }
    const allHistory = await getUserHistory(currentUser);
    console.log("所有歷史紀錄:", allHistory);
    return allHistory;
  });

  const {
    data: todayDiary,
    isLoading: isLoadingDiary,
    error: errorDiary,
  } = useQuery(["diaryEntries", currentDate], async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("用戶未登入");
    }
    return await getDiaryEntry(currentUser, currentDate);
  });

  if (allHistory) {
    console.log("最新的 TDEE:", allHistory);
  }
  if (todayDiary) {
    // 遍历每条日记数据并打印营养素
    todayDiary.forEach((entry: any) => {
      const { calories, carbohydrates, protein, fat } = entry.nutrition || {
        calories: "未知",
        carbohydrates: "未知",
        protein: "未知",
        fat: "未知",
      };

      console.log(`熱量: ${calories}`);
      console.log(`碳水化合物: ${carbohydrates}`);
      console.log(`蛋白質: ${protein}`);
      console.log(`脂肪: ${fat}`);
    });
  }

  if (isLoadingTDEE || isLoadingDiary) {
    return <div>Loading...</div>;
  }

  if (errorTDEE || errorDiary) {
    const errorMessageTDEE = (errorTDEE as Error)?.message || "未知的錯誤";
    const errorMessageDiary = (errorDiary as Error)?.message || "未知的錯誤";

    return <div>Error: {errorMessageTDEE || errorMessageDiary}</div>;
  }

  return (
    <Wrapper>
      <Sidebar />
      <h1>我是分析報告</h1>
    </Wrapper>
  );
};
const Wrapper = styled.div`
  margin-left: 150px;
`;
export default Report;

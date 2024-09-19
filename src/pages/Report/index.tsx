import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useQuery } from "react-query";
import { getLatestTDEE, getDiaryEntry } from "../../firebase/firebaseServices";
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
    data: latestTDEE,
    isLoading: isLoadingTDEE,
    error: errorTDEE,
  } = useQuery("latestTDEE", async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("用戶未登入");
    }
    return await getLatestTDEE(currentUser);
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

  if (latestTDEE) {
    console.log("最新的 TDEE:", latestTDEE);
  }
  if (todayDiary) {
    console.log("今天的日記:", todayDiary);
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

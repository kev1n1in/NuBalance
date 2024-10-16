import Sidebar from "../../components/Sidebar";
import styled from "styled-components";
import Button from "../../components/Button";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import {
  getUserHistory,
  getDiaryEntry,
  deleteDiaryEntry,
  fetchUserName,
} from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import userImg from "./userImg.png";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import trashImg from "./trash.png";
import DiaryFoodModal from "../../components/Ｍodals/DiaryFoodModal";
import Modal from "../../components/Ｍodals/Modal";
import BGI from "../../asset/draft.png";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import Loader from "../../components/Loader";
import calculatorImg from "./calculator.png";
import createImg from "./create.png";
import searchImg from "./search.png";
import report from "./report.png";
import useConfirmDialog from "../../hooks/useConfirmDialog";
import HandDrawnProgress from "../../components/ProgressBar/HandDrawnProgress";
import useAlert from "../../hooks/useAlertMessage";
import mobileUserImg from "./userImg-mobile.png";
import ReactJoyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface DiaryEntry {
  id: string;
  food?: string;
  meal?: string;
  bmi?: string;
  bodyFat?: string;
  nutrition?: {
    calories?: string;
    carbohydrates?: string;
    protein?: string;
    fat?: string;
  };
}
interface RemainCaloriesProps {
  isExceeded: boolean;
}
const UserInfo = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ConfirmDialogComponent, openDialog } = useConfirmDialog();
  const { addAlert, AlertMessage } = useAlert();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data as { status: "finished" | "skipped" | "error" };
    if (["finished", "skipped"].includes(status)) {
      setRun(false);
    }
  };

  useEffect(() => {
    const checkElement = setInterval(() => {
      if (document.getElementById("calculate-tdee-button")) {
        setRun(true);
        clearInterval(checkElement);
      }
    }, 500);
  }, []);
  useEffect(() => {
    setSteps([
      {
        target: ".calculate-tdee-button",
        content:
          "Click here to calculate your Total Daily Energy Expenditure (TDEE).",
        placement: "top",
        spotlightPadding: 10, // 添加聚焦區域的間距
      },
      {
        target: ".search-food-button",
        content: "Click here to search for food nutrients and calories.",
        placement: "top",
        spotlightPadding: 10,
      },
      {
        target: ".create-diary-button",
        content: "Click here to create a new diary entry.",
        placement: "top",
        spotlightPadding: 10,
      },
      {
        target: ".check-report-button",
        content: "Click here to check your detailed progress report.",
        placement: "top",
        spotlightPadding: 10,
      },
    ]);
    setRun(false);
  }, []); // 依賴於日記條目的數量

  const {
    data: latestTDEE = { tdee: 1800, bmi: 0, bodyFat: 0 },
    isLoading: isLoadingTDEE,
    error: errorTDEE,
  } = useQuery("latestTDEE", async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("用戶未登入");
    }
    const latestHistory = await getUserHistory(currentUser, true);
    const tdee = latestHistory?.tdee || 1800;
    const bmi = latestHistory?.bmi || 0;
    const bodyFat = latestHistory?.bodyFat || 0;

    console.log("最新歷史紀錄:", latestHistory);

    return { tdee, bmi, bodyFat };
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
  const {
    data: userName,
    isLoading: isLoadingUserName,
    error: userNameError,
  } = useQuery(
    "fetchUserName",
    () => {
      if (auth.currentUser) {
        console.log("成功", auth.currentUser);

        return fetchUserName(auth.currentUser);
      }
      throw new Error("尚未登入");
    },
    {
      enabled: !!auth.currentUser, // 只有當 currentUser 存在時才啟用這個查詢
    }
  );
  const displayName = auth.currentUser
    ? auth.currentUser.displayName
    : "未設定用戶名";
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
  const isExceeded = remainingCalories < 0;
  const latestBMI = latestTDEE.bmi;
  const latestBodyFat = latestTDEE.bodyFat;
  if (errorTDEE || errorDiary || userNameError) {
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
      addAlert("Deleted Successfully");
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
      <Loader
        isLoading={isLoadingTDEE || isLoadingDiary || isLoadingUserName}
      />
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
      <AlertMessage />
      {ConfirmDialogComponent}
      {toggleMenu && <Overlay onClick={handleMenuToggle} />}
      <HamburgerIcon onClick={handleMenuToggle} />
      <Sidebar toggleMenu={toggleMenu} />
      <Container>
        <ReactJoyride
          continuous={true}
          run={run}
          steps={steps}
          callback={handleJoyrideCallback}
          showSkipButton={true}
          showProgress={true}
          styles={{
            options: {
              zIndex: 10000,
              arrowColor: "#eee", // 箭頭顏色
              backgroundColor: "#fff", // 提示框背景色
              overlayColor: "rgba(54, 54, 54, 0.4)", // 遮罩背景色
              primaryColor: "#ff0000", // 改變點點（或引導步驟的顏色）
              textColor: "#333",
              spotlightShadow: "0 0 15px rgba(255, 0, 0, 0.8)", // 聚焦區域的陰影顏色
            },
          }}
        />

        <JoyrideButton onClick={() => setRun(true)}>Start Tour</JoyrideButton>
        <MobileJoyrideButton onClick={() => setRun(true)}>
          ?
        </MobileJoyrideButton>
        <Header>
          <Title>Diary Summary</Title>
        </Header>

        <InfoWrapper>
          <InfoContainer>
            <UserInfoCotainer>
              <UserContainer>
                <UserImage src={mobileUserImg} />
                <UserName>{displayName}</UserName>
                <MobileUserName>Hello!{displayName}</MobileUserName>
              </UserContainer>
              <TotalTarget>
                <RemainCaloriesContainer>
                  <TotalTargetTitle>
                    {isExceeded ? "Calories Exceeded" : "Calories Remaining"}
                  </TotalTargetTitle>
                  <HandwrittenContainer>
                    <RemainCalories isExceeded={isExceeded}>
                      {Math.abs(remainingCalories)}
                    </RemainCalories>
                  </HandwrittenContainer>
                  <BodyDataContainer>
                    <BMIText>{`BMI: ${
                      typeof latestBMI === "number" ? latestBMI.toFixed(2) : "0"
                    }`}</BMIText>
                    <BodyFatText>{`BodyFat: ${
                      typeof latestBodyFat === "number"
                        ? latestBodyFat.toFixed(2) + "%"
                        : "0"
                    }`}</BodyFatText>
                  </BodyDataContainer>
                </RemainCaloriesContainer>

                <ButtonsContainer>
                  <ButtonContainer className="calculate-tdee-button">
                    <Button
                      label="Calculate TDEE"
                      icon={calculatorImg}
                      justifyContent={"flex-start"}
                      onClick={() =>
                        navigate("../calculator", {
                          state: { fromUserInfo: true },
                        })
                      }
                    />
                  </ButtonContainer>
                  <ButtonContainer className="search-food-button">
                    <Button
                      label="Search Food"
                      icon={searchImg}
                      justifyContent={"flex-start"}
                      onClick={() =>
                        navigate("../food", { state: { fromUserInfo: true } })
                      }
                    />
                  </ButtonContainer>
                  <ButtonContainer className="create-diary-button">
                    <Button
                      label="Create Diary"
                      icon={createImg}
                      justifyContent={"flex-start"}
                      onClick={() =>
                        navigate("../diary", { state: { fromUserInfo: true } })
                      }
                    />
                  </ButtonContainer>
                  <ButtonContainer className="check-report-button">
                    <Button
                      label="Check Report"
                      icon={report}
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
                      <HandDrawnProgress percentage={percentage} />
                      <IndicatorWrapper
                        style={{
                          left: `${Math.max(0, Math.min(percentage, 100))}%`,
                        }}
                      >
                        <Progress>
                          {todayNutrition ? todayNutrition.toFixed(0) : 0} Cal
                        </Progress>
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
            <StyledFlatpickr
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
          <Modal title={"Today I ate"} onClose={closeModal}>
            <DiaryFoodModal
              onClose={closeModal}
              entryId={selectedEntryId}
              selectedDate={selectedDate}
            />
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
`;
const JoyrideButton = styled.button`
  position: absolute;
  background-color: #000;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  top: 60px;
  right: 24px;
  @media (max-width: 1000px) {
    top: 48px;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;
const MobileJoyrideButton = styled.button`
  display: none;
  position: absolute;
  color: red;
  padding: 8px;
  font-size: 48px;
  border-radius: 4px;
  right: 24px;
  @media (max-width: 768px) {
    display: flex;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const Title = styled.h1`
  font-size: 48px;
  @media (max-width: 1000px) {
    text-align: left;
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
  @media (max-width: 480px) {
  }
`;

const BodyDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 8px;
  font-size: 18px;
  color: #555;
  @media (max-width: 1280px) {
    flex-direction: row;
    padding: 20px 0 0 0;
  }
`;

const BMIText = styled.span`
  font-weight: bold;
`;

const BodyFatText = styled.span`
  font-weight: bold;
`;

const UserContainer = styled.div`
  @media (max-width: 768px) {
    display: flex;
  }
`;
const UserImage = styled.img`
  height: 280px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.p`
  position: relative;
  bottom: 24px;
  text-align: center;
  font-size: 36px;
  @media (max-width: 768px) {
    display: none;
  }
`;
const MobileUserName = styled.p`
  display: none;
  font-size: 36px;
  margin-top: 24px;
  @media (max-width: 768px) {
    display: inline-block;
  }
`;

const RemainCaloriesContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  @media (max-width: 1280px) {
    display: flex;
    flex-wrap: wrap;
    width: 80%;
    margin: 20px auto 0 0;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TodayTargetWrapper = styled.div`
  position: relative;
  bottom: 48px;
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    position: absolute;
    top: 160px;
    width: 100%;
  }
  @media (max-width: 360px) {
    position: absolute;
    top: 200px;
    width: 100%;
  }
`;

const TotalTarget = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  font-size: 18px;

  @media (max-width: 480px) {
  }
`;

const TotalTargetTitle = styled.span`
  position: relative;
  width: auto;
  margin-right: 12px;
  font-size: 30px;
  top: 4px;
  @media (max-width: 1000px) {
    left: 0;
    font-weight: 700;
    width: auto;
    margin-right: 12px;
  }
  @media (max-width: 768px) {
    font-size: 24px;
  }
  @media (max-width: 480px) {
    width: 100%;
    margin-bottom: 12px;
  }
`;

const HandwrittenContainer = styled.div`
  position: relative;
  display: flex;
  width: auto;
  top: 12px;
  margin-right: 12px;
  @media (max-width: 1000px) {
    top: 0px;
    right: 0px;
  }
  @media (max-width: 480px) {
  }
`;

const RemainCalories = styled.div<RemainCaloriesProps>`
  font-size: 52px;
  color: ${(props) => (props.isExceeded ? "red" : "#6db96d")};
  @media (max-width: 1000px) {
    height: 52px;
    line-height: 52px;
  }
  @media (max-width: 768px) {
    font-size: 32px;
    height: 32px;
    line-height: 32px;
  }
`;

const TodayTargetContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
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
  margin-top: 30px;
  @media (max-width: 1280px) {
    display: flex;
    flex-wrap: wrap;
    width: 68%;
    margin: 20px auto 0 0;
  }
  @media (max-width: 768px) {
    width: 87%;
  }
  @media (max-width: 480px) {
    top: 0;
    right: 0;
    width: 100%;
    gap: 12px;
    margin-top: 140px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  width: 180px;
`;

const DeleteButtonContainer = styled.div`
  position: absolute;
  top: 50%;
  right: 8px;
  width: 30px;
  height: 30px;
  z-index: 10;
  transform: translateY(-50%);
`;

const DeleteButton = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
`;
const StyledFlatpickr = styled(Flatpickr)`
  font-family: "KG Second Chances", sans-serif;

  width: 150px;
`;
const TargetProgressContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 80px;
  @media (max-width: 480px) {
    margin-top: 0;
  }
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  top: -38px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
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
    margin-top: 60px;
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
  padding: 4px 40px 8px 8px;
  border: 2px solid gray;
  border-radius: 4px;
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

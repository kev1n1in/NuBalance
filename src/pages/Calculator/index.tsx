import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import TDEECalculator from "../../services/TDEECalculator";
import Button from "../../components/Button";
import {
  updateTDEEHistory,
  getUserHistory,
} from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import Loader from "../../components/Loader";
import Slider from "../../components/Slider";
import { Select, MenuItem } from "@mui/material";
import BGI from "../../asset/draft.png";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import { Timestamp } from "firebase/firestore";

const Calculator = () => {
  const [userData, setUserData] = useState({
    age: 34,
    gender: "male",
    weight: 60,
    height: 175,
    activityLevel: "Moderate",
    bodyFat: 17,
    totalCalories: 2141,
  });

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [reloadFlag, setReloadFlag] = useState(false);
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const updateCalculation = () => {
    const newTDEE = TDEECalculator.calculateTDEE(
      userData.weight,
      userData.height,
      userData.age,
      userData.gender,
      userData.activityLevel
    );
    setUserData((prevState) => ({
      ...prevState,
      totalCalories: newTDEE,
    }));
  };

  // 自動更新 TDEE 計算
  useEffect(() => {
    updateCalculation();
  }, [
    userData.age,
    userData.gender,
    userData.weight,
    userData.height,
    userData.activityLevel,
  ]);

  // 從 Firebase 中獲取最新的 TDEE 數據
  const { data: latestTDEE, isLoading } = useQuery(
    "latestTDEE",
    async () => {
      if (!currentUser) {
        throw new Error("用戶未登入");
      }
      const latestHistory = await getUserHistory(currentUser, true);
      return latestHistory;
    },
    {
      enabled: !!currentUser,
      onSuccess: (latestHistory) => {
        if (latestHistory) {
          setUserData((prevState) => ({
            ...prevState,
            age: latestHistory.age || 34,
            gender: latestHistory.gender || "male",
            weight: latestHistory.weight || 60,
            height: latestHistory.height || 175,
            activityLevel: latestHistory.activityLevel || "Moderate",
            bodyFat: latestHistory.bodyFat || 17,
            totalCalories: latestHistory.tdee || 2141,
          }));
        }
      },
    }
  );

  const mutation = useMutation(
    async () => {
      if (!currentUser) {
        throw new Error("請先登入");
      }
      const bmi = TDEECalculator.calculateBMI(userData.weight, userData.height);
      console.log("正在計算的 BMI:", bmi);

      // 獲取當前的時間戳
      const clientUpdateTime = Timestamp.fromDate(new Date());

      await updateTDEEHistory(
        currentUser,
        userData.totalCalories,
        userData.age,
        userData.weight,
        userData.height,
        userData.gender,
        userData.activityLevel,
        userData.bodyFat,
        bmi,
        clientUpdateTime // 傳遞 clientUpdateTime
      );
    },
    {
      onSuccess: () => {
        alert("TDEE 和 BMI 計算已保存到 Firebase");

        if (location.state?.fromSidebar) {
          setReloadFlag(true);
          setTimeout(() => {
            setReloadFlag(false);
          }, 500);
        } else {
          navigate("/userinfo");
        }
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          alert(`保存 TDEE 計算失敗: ${error.message}`);
        } else {
          alert("保存 TDEE 計算失敗: 未知錯誤");
        }
      },
    }
  );

  const handleSave = () => {
    mutation.mutate();
  };

  const handleInputChange = (field: string, value: any) => {
    setUserData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleMenuToggle = () => {
    setToggleMenu((prev) => !prev);
  };

  return (
    <Wrapper>
      {toggleMenu && <Overlay onClick={handleMenuToggle} />}
      <HamburgerIcon onClick={handleMenuToggle} />
      <Sidebar toggleMenu={toggleMenu} />
      <Container>
        <Title>TDEE Calculator</Title>
        <TdeeContainer>
          <Form>
            {/* <ManImg src={manImg}></ManImg> */}
            <FormItem>
              <FormTitle>Gender</FormTitle>
              <GenderContainer>
                <GenderText
                  isSelected={userData.gender === "male"}
                  isMale={true}
                  onClick={() => handleInputChange("gender", "male")}
                >
                  Male
                </GenderText>
                <GenderText
                  isSelected={userData.gender === "female"}
                  isMale={false}
                  onClick={() => handleInputChange("gender", "female")}
                >
                  Female
                </GenderText>
              </GenderContainer>
            </FormItem>

            <FormItem>
              <FormTitle>Age</FormTitle>
              <SliderWrapper>
                <Slider
                  value={userData.age}
                  min={0}
                  max={100}
                  onChange={(e) =>
                    handleInputChange("age", Number(e.target.value))
                  }
                />
              </SliderWrapper>
              <Input
                type="text"
                value={userData.age}
                onChange={(e) =>
                  handleInputChange(
                    "age",
                    Number(e.target.value.replace(/[^0-9]/g, ""))
                  )
                }
              />
            </FormItem>

            <FormItem>
              <FormTitle>Weight</FormTitle>
              <SliderWrapper>
                <Slider
                  value={userData.weight}
                  min={0}
                  max={200}
                  onChange={(e) =>
                    handleInputChange("weight", Number(e.target.value))
                  }
                />
              </SliderWrapper>
              <Input
                type="text"
                value={userData.weight}
                onChange={(e) =>
                  handleInputChange(
                    "weight",
                    Number(e.target.value.replace(/[^0-9]/g, ""))
                  )
                }
              />
            </FormItem>

            <FormItem>
              <FormTitle>Height</FormTitle>
              <SliderWrapper>
                <Slider
                  value={userData.height}
                  min={100}
                  max={250}
                  onChange={(e) =>
                    handleInputChange("height", Number(e.target.value))
                  }
                />
              </SliderWrapper>
              <Input
                type="text"
                value={userData.height}
                onChange={(e) =>
                  handleInputChange(
                    "height",
                    Number(e.target.value.replace(/[^0-9]/g, ""))
                  )
                }
              />
            </FormItem>

            <FormItem>
              <FormTitle>Body Fat</FormTitle>
              <SliderWrapper>
                <Slider
                  value={userData.bodyFat}
                  min={0}
                  max={50}
                  onChange={(e) =>
                    handleInputChange("bodyFat", Number(e.target.value))
                  }
                />
              </SliderWrapper>
              <Input
                type="text"
                value={userData.bodyFat}
                onChange={(e) =>
                  handleInputChange(
                    "bodyFat",
                    Number(e.target.value.replace(/[^0-9]/g, ""))
                  )
                }
              />
            </FormItem>
            <FormItem>
              <FormTitle>Activity</FormTitle>
              <Select
                label="Activity Level"
                value={userData.activityLevel}
                onChange={(e) =>
                  handleInputChange("activityLevel", e.target.value)
                }
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                style={{ width: "90%" }}
              >
                <MenuItem value="Sedentary">Sedentary</MenuItem>
                <MenuItem value="Light">Light</MenuItem>
                <MenuItem value="Moderate">Moderate</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Very Active">Very Active</MenuItem>
              </Select>
            </FormItem>
          </Form>
          <CaloriesContainer>
            <TotalCalories>
              {userData.totalCalories
                ? userData.totalCalories.toFixed(0)
                : "2000"}
            </TotalCalories>
            <CaloriesText>calories/day</CaloriesText>
            <ButtonContainer>
              <Button label="保存" onClick={handleSave}></Button>
            </ButtonContainer>
          </CaloriesContainer>
        </TdeeContainer>
      </Container>
      <Loader isLoading={isLoading} />
    </Wrapper>
  );
};
const Wrapper = styled.div`
  display: flex;
  background-image: url(${BGI});
  margin: 0 0 0 150px;
  z-index: 0;
  @media (max-width: 1000px) {
    margin: 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  height: 800px;
  margin: 50px auto 72px auto;
  padding: 24px 24px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  @media (max-width: 1000px) {
    margin: 50px 100px 72px 50px;
  }
  @media (max-width: 768px) {
    height: 1200px;
  }
`;

const Title = styled.h1`
  @media (max-width: 1000px) {
    text-align: center;
  }
  @media (max-width: 360px) {
    width: 120px;
    margin: 0 auto;
  }
`;
const TdeeContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 90%;
  height: 500px;
  margin: 0 auto;
  align-items: flex-end;
`;

const ManImg = styled.img`
  position: absolute;
  left: -80px;
  top: 300px;
  @media (max-width: 1000px) {
    height: 300px;
    left: -70px;
    top: 350px;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const Form = styled.div`
  width: 100%;
`;

const FormItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
  width: 100%;
  gap: 24px;
  @media (max-width: 768px) {
    align-items: start;
    flex-direction: column;
  }
`;

const SliderWrapper = styled.div`
  flex-grow: 1;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FormTitle = styled.span`
  font-size: 36px;
  width: 140px;
`;

const Input = styled.input`
  width: 100px;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
`;

const CaloriesContainer = styled.div`
  display: flex;
  position: relative;

  @media (max-width: 1000px) {
    flex-direction: column;
    right: -36px;
  }
  @media (max-width: 768px) {
    top: -36px;
  }
  @media (max-width: 480px) {
    top: -30px;
    left: 8px;
  }
  @media (max-width: 360px) {
    top: -30px;
    left: 4px;
  }
`;

const CaloriesText = styled.div`
  display: flex;
  position: absolute;
  top: 48px;
  left: 164px;
  font-size: 20px;
  font-weight: 700;
  @media (max-width: 1000px) {
    top: 0px;
    left: 120px;
  }
  @media (max-width: 768px) {
    top: -24px;
  }
  @media (max-width: 480px) {
    top: -16px;
    left: 60px;
  }
  @media (max-width: 360px) {
    top: -16px;
    left: 12px;
  }
`;

const ButtonContainer = styled.div`
  position: relative;
  margin: 24px 0 0 160px;
  width: 250px;
  @media (max-width: 1000px) {
    width: 100%;
  }
  @media (max-width: 768px) {
    top: -24px;
  }
`;
const TotalCalories = styled.div`
  font-size: 64px;
  color: #71b271;
`;

const GenderContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const GenderText = styled.span<{ isSelected: boolean; isMale: boolean }>`
  font-size: 30px;
  cursor: pointer;
  color: ${({ isSelected, isMale }) =>
    isSelected ? (isMale ? "#92bde2" : "pink") : "gray"};
  font-weight: ${({ isSelected }) => (isSelected ? "bold" : "normal")};
  transition: color 0.3s ease;

  &:hover {
    color: ${({ isSelected, isMale }) =>
      isSelected ? (isMale ? "#92bde2" : "#FFB6C1") : "#BDBDBD"};
  }
`;

export default Calculator;

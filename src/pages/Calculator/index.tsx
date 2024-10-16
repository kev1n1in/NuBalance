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
import RequiredMark from "../../components/RequiredMark";
import useAlert from "../../hooks/useAlertMessage";
import pointer from "./pointer.png";

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
  const { addAlert, AlertMessage } = useAlert();

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
      console.log("最新歷史物件", latestHistory);
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
        clientUpdateTime
      );
    },
    {
      onSuccess: () => {
        addAlert("Saved successfully");

        setTimeout(() => {
          if (location.state?.fromSidebar) {
            setReloadFlag(true);
            setTimeout(() => {
              setReloadFlag(false);
            }, 500);
          } else {
            navigate("/userinfo");
          }
        }, 1000);
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          addAlert(`保存 TDEE 計算失敗: ${error.message}`);
        } else {
          addAlert("保存 TDEE 計算失敗: 未知錯誤");
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
      <AlertMessage />
      {toggleMenu && <Overlay onClick={handleMenuToggle} />}
      <HamburgerIcon onClick={handleMenuToggle} />
      <Sidebar toggleMenu={toggleMenu} />
      <Container>
        <Title>TDEE Calculator</Title>
        <TdeeContainer>
          <Form>
            <HeadFormItem>
              <GenderWrapper>
                <FormTitle>
                  Gender
                  <RequiredMark />
                </FormTitle>
                <GenderContainer>
                  {" "}
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
              </GenderWrapper>

              <ActiveContainer>
                <FormTitle>
                  Activity
                  <RequiredMark />
                </FormTitle>
                <SelectContainer>
                  <Select
                    label="Activity Level"
                    value={userData.activityLevel}
                    onChange={(e) =>
                      handleInputChange("activityLevel", e.target.value)
                    }
                    sx={{
                      "& .MuiSelect-select": {
                        fontFamily: "KG Second Chances",
                        fontSize: "24px",
                        padding: "8px 4px 4px 8px",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "3px solid gray",
                        borderRadius: "12px",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "gray",
                      },
                      "& fieldset": {
                        legend: {
                          display: "none",
                        },
                      },
                    }}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    style={{ width: "100%" }}
                    IconComponent={() => null}
                  >
                    <MenuItem
                      sx={{ fontFamily: "KG Second Chances" }}
                      value="Sedentary"
                    >
                      Sedentary
                    </MenuItem>
                    <MenuItem
                      sx={{ fontFamily: "KG Second Chances" }}
                      value="Light"
                    >
                      Light
                    </MenuItem>
                    <MenuItem
                      sx={{ fontFamily: "KG Second Chances" }}
                      value="Moderate"
                    >
                      Moderate
                    </MenuItem>
                    <MenuItem
                      sx={{ fontFamily: "KG Second Chances" }}
                      value="Active"
                    >
                      Active
                    </MenuItem>
                    <MenuItem
                      sx={{ fontFamily: "KG Second Chances" }}
                      value="Very Active"
                    >
                      Very Active
                    </MenuItem>
                  </Select>
                  <Pointer src={pointer} />
                </SelectContainer>
              </ActiveContainer>
            </HeadFormItem>

            <FormItem>
              <FormTitle>
                Age
                <RequiredMark />
              </FormTitle>
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
              <FormTitle>
                Weight
                <RequiredMark />
              </FormTitle>
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
              <FormTitle>
                Height
                <RequiredMark />
              </FormTitle>
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
          </Form>
          <CaloriesContainer>
            <TotalCaloriesContainer>
              <TotalCalories>
                {userData.totalCalories
                  ? userData.totalCalories.toFixed(0)
                  : "2000"}
              </TotalCalories>
              <CaloriesText>calories/day</CaloriesText>
            </TotalCaloriesContainer>

            <ButtonContainer>
              <Button
                strokeColor="black"
                label="Save"
                onClick={handleSave}
              ></Button>
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
  height: 90vh;
  margin: 50px auto 72px auto;
  padding: 24px 24px 0 24px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  @media (max-width: 1000px) {
    height: 100vh;
    margin: 50px 100px 72px 50px;
  }
  @media (max-width: 768px) {
    height: 1350px;
  }
`;

const Title = styled.h1`
  font-size: 40px;

  @media (max-width: 480px) {
    font-size: 32px;
  }
`;
const TdeeContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  height: 500px;
  margin: 0 auto;
  align-items: flex-end;
`;

const Form = styled.div`
  width: 100%;
`;
const HeadFormItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  width: 100%;
  gap: 24px;
  @media (max-width: 1280px) {
    flex-direction: column;
    align-items: start;
  }
`;
const GenderWrapper = styled.div`
  display: flex;
  width: 50%;
  gap: 20px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
const GenderContainer = styled.div``;

const GenderText = styled.span<{ isSelected: boolean; isMale: boolean }>`
  font-size: 30px;
  margin: 8px 12px 0 8px;
  cursor: pointer;
  color: ${({ isSelected, isMale }) =>
    isSelected ? (isMale ? "#92bde2" : "pink") : "#bdbdbd"};
  font-weight: ${({ isSelected }) => (isSelected ? "bold" : "normal")};
  transition: color 0.3s ease;

  &:hover {
    color: ${({ isSelected, isMale }) =>
      isSelected ? (isMale ? "#92bde2" : "#FFB6C1") : "#BDBDBD"};
  }
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ActiveContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: end;
  width: 50%;
  @media (max-width: 1280px) {
    justify-content: start;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: start;
  }
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
  margin-right: 24px;
  width: 170px;
  color: black;
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Input = styled.input`
  width: 100px;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  font-family: "KG Second Chances";
`;

const CaloriesContainer = styled.div`
  display: flex;
  position: relative;
  @media (max-width: 1280px) {
    flex-direction: column;
  }
`;
const TotalCaloriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 24px;
`;
const TotalCalories = styled.div`
  display: flex;
  align-self: end;
  width: 150px;
  font-size: 64px;
  color: #71b271;
`;
const CaloriesText = styled.div`
  display: flex;
  position: relative;
  align-self: end;
  right: 12px;
  bottom: 12px;
  font-size: 20px;
  font-weight: 700;
`;

const ButtonContainer = styled.div`
  position: relative;
  margin-top: 24px;
  width: 150px;
`;
const SelectContainer = styled.div`
  position: relative;
  width: 50%;
  @media (max-width: 1280px) {
    min-width: 200px;
    margin-left: 24px;
  }
  @media (max-width: 768px) {
    margin: 24px 0 0 0;
  }
`;
const Pointer = styled.img`
  position: absolute;
  width: 36px;
  top: 0;
  right: 12px;
  transform: rotate(60deg);
  pointer-events: none;
`;
export default Calculator;

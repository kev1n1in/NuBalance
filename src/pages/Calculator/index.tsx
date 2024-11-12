import { MenuItem, Select } from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BGI from "../../asset/draft.png";
import Button from "../../components/Button";
import FormItem from "../../components/CalculatorInput/FormItem";
import Loader from "../../components/Loader";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import RequiredMark from "../../components/RequiredMark";
import Sidebar from "../../components/Sidebar";
import { auth } from "../../firebase/firebaseConfig";
import {
  getUserHistory,
  updateTDEEHistory,
} from "../../firebase/firebaseServices";
import useAlert from "../../hooks/useAlertMessage";
import { CalculatorPageProps } from "../../types/Pages";
import TDEECalculator from "../../utils/TDEECalculator";
import pointer from "./pointer.png";

const Calculator = () => {
  const [userData, setUserData] = useState<CalculatorPageProps>({
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
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const { addAlert, AlertMessage } = useAlert();

  const activityLevels = [
    "Sedentary",
    "Light",
    "Moderate",
    "Active",
    "Very Active",
  ];
  const formItems = [
    { title: "Age", field: "age", min: 0, max: 150, required: true },
    { title: "Weight", field: "weight", min: 0, max: 200, required: true },
    { title: "Height", field: "height", min: 100, max: 250, required: true },
    { title: "Body Fat", field: "bodyFat", min: 0, max: 150, required: false },
  ];
  const getUserDataProps = (userData: CalculatorPageProps) => {
    return {
      weight: userData.weight,
      height: userData.height,
      age: userData.age,
      gender: userData.gender,
      activityLevel: userData.activityLevel,
    };
  };
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
    const { weight, height, age, gender, activityLevel } =
      getUserDataProps(userData);
    const newTDEE = TDEECalculator.calculateTDEE(
      height,
      weight,
      age,
      gender,
      activityLevel
    );
    setUserData((prevState) => ({
      ...prevState,
      totalCalories: newTDEE,
    }));
  };

  useEffect(() => {
    updateCalculation();
  }, [
    userData.age,
    userData.gender,
    userData.weight,
    userData.height,
    userData.activityLevel,
  ]);

  const { isLoading } = useQuery(
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
            setTimeout(() => {}, 500);
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

  const handleInputChange = (
    field: keyof CalculatorPageProps,
    value: number | string
  ) => {
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
      <Loader isLoading={isLoading} />
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
                <div>
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
                </div>
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
                    {activityLevels.map((level) => (
                      <MenuItem
                        key={level}
                        value={level}
                        sx={{ fontFamily: "KG Second Chances" }}
                      >
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                  <Pointer src={pointer} />
                </SelectContainer>
              </ActiveContainer>
            </HeadFormItem>

            {formItems.map((item) => (
              <FormItem
                key={item.field}
                title={item.title}
                value={userData[item.field] as number}
                min={item.min}
                max={item.max}
                onChange={(value) => handleInputChange(item.field, value)}
                required={item.required}
              ></FormItem>
            ))}
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
  padding: 24px 24px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  @media (max-width: 1000px) {
    height: 100vh;
    margin: 72px auto 72px 50px;
  }
  @media (max-width: 768px) {
    margin: 72px 50px 72px 50px;
    height: 1350px;
  }
  @media (max-width: 480px) {
    margin: 72px 50px 72px 50px;
    height: 1250px;
  }
  @media (max-width: 360px) {
    margin: 72px 24px 72px 24px;
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
  @media (max-width: 480px) {
    font-size: 24px;
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

const FormTitle = styled.span`
  font-size: 36px;
  margin-right: 24px;
  width: 170px;
  color: black;
  @media (max-width: 480px) {
    font-size: 24px;
  }
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

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
import manImg from "./man.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import Loader from "../../components/Loader";
import Slider from "../../components/Slider";
import { Switch, FormControlLabel, Select, MenuItem } from "@mui/material";

const Calculator = () => {
  const [age, setAge] = useState(34);
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState(60);
  const [height, setHeight] = useState(175);
  const [activityLevel, setActivityLevel] = useState("Moderate");
  const [bodyFat, setBodyFat] = useState(17);
  const [totalCalories, setTotalCalories] = useState(0);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [reloadFlag, setReloadFlag] = useState(false);

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
      weight,
      height,
      age,
      gender,
      activityLevel
    );
    setTotalCalories(newTDEE);
  };

  useEffect(() => {
    updateCalculation();
  }, [age, gender, weight, height, activityLevel, bodyFat]);

  const mutation = useMutation(
    async () => {
      if (!currentUser) {
        throw new Error("請先登入");
      }
      const bmi = TDEECalculator.calculateBMI(weight, height);
      console.log("正在計算的 BMI:", bmi);

      await updateTDEEHistory(
        currentUser,
        totalCalories,
        age,
        weight,
        height,
        gender,
        activityLevel,
        bodyFat,
        bmi
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
    }
  );

  useEffect(() => {
    if (latestTDEE && !isLoading) {
      setAge(latestTDEE.age || "25");
      setGender(latestTDEE.gender || "male");
      setWeight(latestTDEE.weight || "60");
      setHeight(latestTDEE.height || "170");
      setActivityLevel(latestTDEE.activityLevel || "Moderate");
      setBodyFat(latestTDEE.bodyFat || "15%");
      setTotalCalories(latestTDEE.tdee);
    }
  }, [latestTDEE, isLoading]);

  return (
    <Wrapper>
      <Sidebar />
      <Container>
        <Title>TDEE 計算機</Title>
        <TdeeContainer>
          <Form>
            <ManImg src={manImg}></ManImg>
            <FormItem>
              <FormTitle>Gender</FormTitle>
              <FormControlLabel
                control={
                  <Switch
                    checked={gender === "male"}
                    onChange={(e) =>
                      setGender(e.target.checked ? "male" : "female")
                    }
                  />
                }
                label={gender === "male" ? "Male" : "Female"}
              />
            </FormItem>
            <FormItem>
              <FormTitle>Age</FormTitle>
              <SliderWrapper>
                <Slider
                  value={age}
                  min={0}
                  max={100}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
              </SliderWrapper>
              <Input
                type="text"
                value={age}
                onChange={(e) => {
                  const value = e.target.value;
                  const newValue = value
                    .replace(/[^0-9]/g, "")
                    .replace(/^0+/, "");
                  setAge(Number(newValue));
                }}
              />
            </FormItem>

            <FormItem>
              <FormTitle>Weight</FormTitle>
              <SliderWrapper>
                <Slider
                  value={weight}
                  min={0}
                  max={200}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </SliderWrapper>
              <Input
                type="text"
                value={weight}
                onChange={(e) => {
                  const value = e.target.value;
                  const newValue = value
                    .replace(/[^0-9]/g, "")
                    .replace(/^0+/, "");
                  setWeight(Number(newValue));
                }}
              />
            </FormItem>
            <FormItem>
              <FormTitle>Height</FormTitle>
              <SliderWrapper>
                <Slider
                  value={height}
                  min={100}
                  max={250}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </SliderWrapper>
              <Input
                type="text"
                value={height}
                onChange={(e) => {
                  const value = e.target.value;
                  const newValue = value
                    .replace(/[^0-9]/g, "")
                    .replace(/^0+/, "");
                  setHeight(Number(newValue));
                }}
              />
            </FormItem>

            <FormItem>
              <FormTitle>Body Fat</FormTitle>
              <SliderWrapper>
                <Slider
                  value={bodyFat}
                  min={0}
                  max={50}
                  onChange={(e) => setBodyFat(Number(e.target.value))}
                />
              </SliderWrapper>
              <Input
                type="text"
                value={bodyFat}
                onChange={(e) => {
                  const value = e.target.value;
                  const newValue = value
                    .replace(/[^0-9]/g, "")
                    .replace(/^0+/, "");
                  setBodyFat(Number(newValue));
                }}
              />
            </FormItem>
            <FormItem>
              <FormTitle>Activity Level</FormTitle>
              <Select
                label="Activity Level"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value="Sedentary">久坐</MenuItem>
                <MenuItem value="Light">輕度活動</MenuItem>
                <MenuItem value="Moderate">中度活動</MenuItem>
                <MenuItem value="Active">活躍</MenuItem>
                <MenuItem value="Very Active">非常活躍</MenuItem>
              </Select>
            </FormItem>
          </Form>
          <CaloriesContainer>
            <TotalCalories>{totalCalories}</TotalCalories>
            <CaloriesText>calories / day</CaloriesText>
          </CaloriesContainer>
          <ButtonContainer>
            <Button label="保存" onClick={handleSave}></Button>
          </ButtonContainer>
        </TdeeContainer>
      </Container>
      <Loader isLoading={isLoading} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 150px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Title = styled.h1``;
const TdeeContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 80%;
  height: 500px;
  margin: 0 auto;
  align-items: flex-end;
`;

const ManImg = styled.img`
  position: absolute;
  left: -48px;
  top: 240px;
`;

const Form = styled.div`
  width: 100%;
`;

const FormItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 24px;
`;

const SliderWrapper = styled.div`
  flex-grow: 1;
`;

const FormTitle = styled.span`
  font-size: 20px;
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
  right: 48px;
`;

const TotalCalories = styled.div`
  font-size: 36px;
  font-weight: bold;
`;

const CaloriesText = styled.div`
  font-size: 16px;
`;

const ButtonContainer = styled.div``;

export default Calculator;

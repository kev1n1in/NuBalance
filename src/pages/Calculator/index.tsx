import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import calculateTDEE from "../../services/TdeeCalculator";
import Button from "../../components/Button";
import {
  updateTDEEHistory,
  getUserHistory,
} from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import manImg from "./man.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import Loader from "../../components/Loader";
import Slider from "../../components/Slider";

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
    const newTDEE = calculateTDEE(weight, height, age, gender, activityLevel);
    setTotalCalories(newTDEE);
  };

  useEffect(() => {
    updateCalculation();
  }, [age, gender, weight, height, activityLevel, bodyFat]);

  const handleSave = async () => {
    if (!currentUser) {
      alert("請先登入");
      return;
    }
    try {
      await updateTDEEHistory(
        currentUser,
        totalCalories,
        age,
        weight,
        height,
        gender,
        activityLevel,
        bodyFat
      );
      alert("TDEE 計算已保存到 Firebase");

      if (location.state?.fromSidebar) {
        setReloadFlag(true);
        setTimeout(() => {
          setReloadFlag(false);
        }, 500);
      } else {
        navigate("/userinfo");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`保存 TDEE 計算失敗: ${error.message}`);
      } else {
        alert("保存 TDEE 計算失敗: 未知錯誤");
      }
    }
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
      setAge(latestTDEE.age);
      setGender(latestTDEE.gender);
      setWeight(latestTDEE.weight);
      setHeight(latestTDEE.height);
      setActivityLevel(latestTDEE.activityLevel);
      setBodyFat(latestTDEE.bodyFat);
      setTotalCalories(latestTDEE.tdee);
    }
  }, [latestTDEE, isLoading]);

  return (
    <Wrapper>
      <Sidebar />
      <Container>
        <Info />
        <TdeeContainer>
          <Form>
            <ManImg src={manImg}></ManImg>

            <FormItem>
              <Title>Age</Title>
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

            {/* Weight with Slider and Input */}
            <FormItem>
              <Title>Weight</Title>
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

            {/* Height with Slider and Input */}
            <FormItem>
              <Title>Height</Title>
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

            {/* Body Fat with Slider and Input */}
            <FormItem>
              <Title>Body Fat</Title>
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

// 樣式
const Wrapper = styled.div`
  margin-left: 150px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Info = styled.div`
  position: relative;
  width: 80%;
  height: 194px;
  background-color: gray;
  margin: 72px auto 36px auto;
`;

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
  top: 120px;
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

const Title = styled.span`
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

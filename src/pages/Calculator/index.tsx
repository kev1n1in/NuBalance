import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import calculateTDEE from "../../services/TdeeCalculator";
import Button from "../../components/Button";
import { updateTDEEHistory } from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import manImg from "./man.png";
import { useNavigate, useLocation } from "react-router-dom";

const Calculator = () => {
  const [age, setAge] = useState(34);
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState(60);
  const [height, setHeight] = useState(175);
  const [activityLevel, setActivityLevel] = useState("Moderate");
  const [bodyFat, setBodyFat] = useState(17);

  const totalCalories = calculateTDEE(
    weight,
    height,
    age,
    gender,
    activityLevel
  );
  const navigate = useNavigate();
  const location = useLocation();

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.log("請先登入");
      return;
    }
    try {
      await updateTDEEHistory(
        user,
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
        window.location.reload();
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
              <DisplayValue>{age}</DisplayValue>
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
              <Title>Gender</Title>
              <DisplayValue>
                <GenderOption
                  isSelected={gender === "male"}
                  onClick={() => setGender("male")}
                >
                  Male
                </GenderOption>
                <GenderOption
                  isSelected={gender === "female"}
                  onClick={() => setGender("female")}
                >
                  Female
                </GenderOption>
              </DisplayValue>
            </FormItem>

            <FormItem>
              <Title>Weight</Title>
              <DisplayValue>{weight}</DisplayValue>
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
              <Title>Height</Title>
              <DisplayValue>{height}</DisplayValue>
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
              <Title>Activity</Title>
              <DisplayValue>{activityLevel}</DisplayValue>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
              >
                <option value="Sedentary">Sedentary</option>
                <option value="Light">Light</option>
                <option value="Moderate">Moderate</option>
                <option value="Active">Active</option>
                <option value="VeryActive">Very Active</option>
              </select>
            </FormItem>

            <FormItem>
              <Title>Body Fat</Title>
              <DisplayValue>{bodyFat}%</DisplayValue>
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
  top: 96px;
`;
const Form = styled.div`
  width: 70%;
`;

const FormItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled.span`
  font-size: 20px;
`;

const DisplayValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Input = styled.input`
  width: 100px;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
`;

const GenderOption = styled.span<{ isSelected: boolean }>`
  font-size: 20px;
  font-weight: ${(props) => (props.isSelected ? "bold" : "normal")};
  color: ${(props) => (props.isSelected ? "black" : "#999")};
  cursor: pointer;
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

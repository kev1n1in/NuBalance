import Sidebar from "../../components/Sidebar";
import styled from "styled-components";
import Button from "../../components/Button";
import { Line } from "rc-progress";
import useStore from "../../useStore";

const UserInfo = () => {
  const tdee = useStore((state) => state.tdee) || 1700;
  const remainingCalories = 1500;
  const progress = tdee - remainingCalories;
  const percentage = ((tdee - remainingCalories) / tdee) * 100;

  return (
    <Wrapper>
      <Sidebar />
      <Container>
        <Title>您的每日摘要</Title>
        <InfoWrapper>
          <UserInfoCotainer>
            <UserImage />
            <WeightTarget>3kg</WeightTarget>
          </UserInfoCotainer>
          <TodayTargetWrapper>
            <TodayTargetContainer>
              <TotalTarget>
                剩餘熱量
                <br />
                {remainingCalories} 大卡
              </TotalTarget>
              <ButtonContainer>
                <Button label="更改熱量估計"></Button>
                <Button label="新增飲食"></Button>
              </ButtonContainer>
            </TodayTargetContainer>
            <TodayTargetContainer>
              <TargetProgressContainer>
                <Line
                  percent={percentage}
                  strokeWidth={4}
                  strokeColor="green"
                  trailWidth={10}
                  trailColor="#d3d3d3"
                  strokeLinecap="butt"
                />
                <IndicatorWrapper style={{ left: `${percentage}%` }}>
                  <TriangleIndicator />
                  <Progress>{progress}</Progress>
                </IndicatorWrapper>
                <ProgressNumbers>
                  <span>0</span>
                  <span>{tdee}</span>
                </ProgressNumbers>
              </TargetProgressContainer>
            </TodayTargetContainer>
          </TodayTargetWrapper>
        </InfoWrapper>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 50px 0 0 150px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 80%;
`;

const Title = styled.h1``;

const InfoWrapper = styled.div`
  display: flex;
`;

const UserInfoCotainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto 24px auto 0;
`;

const UserImage = styled.div`
  width: 120px;
  height: 120px;
  background-color: gray;
`;

const WeightTarget = styled.div``;

const TodayTargetWrapper = styled.div``;

const TodayTargetContainer = styled.div`
  display: flex;
  height: 100px;
  align-items: center;
`;

const TotalTarget = styled.div`
  width: 150px;
  font-size: 18px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 20px;
`;

const TargetProgressContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 20px;
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  bottom: -5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
`;

const TriangleIndicator = styled.div`
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 15px solid green;
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

export default UserInfo;

import styled from "styled-components";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
const LandingPage = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <Wrapper>
      <Header />
      <h1>我是落地頁啦</h1>
      <Banner>
        <LayoutContainer>
          <StoryContainer>
            <Story />
            <ButtonContainer>
              <Button label="Log in" onClick={handleLogin} />
              <Button label="Sign up" />
            </ButtonContainer>
          </StoryContainer>
          <Image />
        </LayoutContainer>
      </Banner>
      <ProductInfo />
      <ProductInfo />
      <ProductInfo />
    </Wrapper>
  );
};
const Wrapper = styled.div``;
const LayoutContainer = styled.div`
  display: flex;
  position: relative;
  width: 90%;
  margin: 0 auto;
`;
const Banner = styled.div`
  display: flex;
  width: 100%;
  height: 400px;
  background-color: ghostwhite;
`;

const StoryContainer = styled.div`
  margin-top: 100px;
  width: 630px;
`;
const Story = styled.div`
  width: 100%;
  height: 150px;
  background-color: gray;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
`;
const Image = styled.div`
  position: absolute;
  top: 148px;
  right: 148px;
  width: 200px;
  height: 100px;
  background-color: #000;
`;
const ProductInfo = styled.div`
  width: 100%;
  height: 400px;
  margin-top: 20px;
  background-color: gray;
`;

export default LandingPage;

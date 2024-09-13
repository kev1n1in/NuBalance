import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { signOutUser } from "../firebase/firebaseAuth";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/");
    } catch (error) {
      console.error("登出失敗", error);
    }
  };

  return (
    <Wrapper>
      <NavBar>
        <Logo />
        <Item onClick={() => handleNavigation("/calculator")}>Calculator</Item>
        <Item onClick={() => handleNavigation("/food")}>Food</Item>
        <Item onClick={() => handleNavigation("/diary")}>Diary</Item>
        <Item onClick={() => handleNavigation("/report")}>Report</Item>
        <Item onClick={handleLogout}>Logout</Item>
      </NavBar>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 150px;
  justify-content: center;
  align-items: center;
`;

const NavBar = styled.div`
  width: 80%;
  border-radius: 40px;
  background-color: gray;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const Item = styled.div`
  cursor: pointer;
  padding: 8px 16px;
  color: white;
`;

const Logo = styled.div`
  margin: 12px;
  height: 48px;
  width: 48px;
  border-radius: 50%;
  background-color: #000;
`;

export default Header;

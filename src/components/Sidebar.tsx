import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { signOutUser } from "../firebase/firebaseAuth";
import Cookies from "js-cookie";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string, state: any = {}) => {
    navigate(path, { state });
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      Cookies.remove("isLoggedIn");
      Cookies.remove("username");
      navigate("/");
    } catch (error) {
      console.error("登出失敗", error);
    }
  };

  return (
    <Wrapper>
      <NavBar>
        <Logo onClick={() => handleNavigation("/landing")} />
        <Item onClick={() => handleNavigation("/userInfo")}>Home</Item>
        <Item
          onClick={() => handleNavigation("/calculator", { fromSidebar: true })}
        >
          Calculator
        </Item>
        <Item onClick={() => handleNavigation("/food")}>Food</Item>
        <Item onClick={() => handleNavigation("/diary")}>Diary</Item>
        <Item onClick={() => handleNavigation("/report")}>Report</Item>
        <Item onClick={handleLogout}>Logout</Item>
      </NavBar>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 150px;
  height: 100%;
  background-color: gray;
  justify-content: center;
  align-items: center;
`;

const NavBar = styled.div`
  height: 80%;
  display: flex;
  flex-direction: column;
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
  cursor: pointer;
`;

export default Sidebar;

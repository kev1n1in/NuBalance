import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { signOutUser } from "../firebase/firebaseAuth";
import Cookies from "js-cookie";
import { annotate } from "rough-notation";

interface SidebarProps {
  toggleMenu: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ toggleMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleNavigation = (path: string, state: any = {}) => {
    navigate(path, { state });
  };

  const handleItemClick = (path: string, index: number) => {
    handleNavigation(path);
    const item = itemRefs.current[index];
    if (item) {
      const annotation = annotate(item, {
        type: "underline",
        color: "blue",
        padding: 5,
        animationDuration: 200,
      });
      annotation.show();
    }
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

  useEffect(() => {
    const currentPath = location.pathname;
    const index = [
      "/userInfo",
      "/calculator",
      "/food",
      "/diary",
      "/report",
    ].indexOf(currentPath);
    if (index !== -1) {
      const item = itemRefs.current[index];
      if (item) {
        const annotation = annotate(item, {
          type: "underline",
          color: "white",
          padding: 5,
          animationDuration: 200,
        });
        annotation.show();
      }
    }
  }, [location]);

  return (
    <Wrapper toggleMenu={toggleMenu}>
      <NavBar>
        <Logo onClick={() => handleNavigation("/")} />
        {["/userInfo", "/calculator", "/food", "/diary", "/report"].map(
          (path, index) => (
            <Item
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={() => handleItemClick(path, index)}
            >
              {index === 0
                ? "用戶資訊"
                : index === 1
                ? "TDEE計算器"
                : index === 2
                ? "食物資料庫"
                : index === 3
                ? "日記"
                : "數據報告"}
            </Item>
          )
        )}
        <Item onClick={handleLogout} ref={(el) => (itemRefs.current[5] = el)}>
          登出
        </Item>
      </NavBar>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ toggleMenu: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 150px;
  height: 100%;
  background-color: #363636;
  justify-content: center;
  align-items: center;
  transition: right 0.3s ease;

  @media (max-width: 1000px) {
    right: ${({ toggleMenu }) => (toggleMenu ? "0" : "-150px")};
    left: auto;
    z-index: 10;
  }
`;

const NavBar = styled.div`
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  @media (max-width: 1000px) {
    margin-top: 48px;
  }
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
  margin-top: 60px;
  border-radius: 50%;
  background-color: #000;
  cursor: pointer;
`;

export default Sidebar;

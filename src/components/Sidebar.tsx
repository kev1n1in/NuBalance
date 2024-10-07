import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { signOutUser } from "../firebase/firebaseAuth";
import Cookies from "js-cookie";
import { annotate } from "rough-notation";
import ConfirmDialog from "./ConfirmDialog";

interface SidebarProps {
  toggleMenu: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ toggleMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
  const handleLogoutClick = () => {
    setIsConfirmOpen(true); // 打開確認對話框
  };
  const handleDialogClose = () => {
    setIsConfirmOpen(false); // 關閉對話框
  };
  const handleLogoutConfirm = async () => {
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
        <Logo onClick={() => handleNavigation("/")}>NuBalance</Logo>
        <ItemContainer>
          {" "}
          {["/userInfo", "/calculator", "/food", "/diary", "/report"].map(
            (path, index) => (
              <Item
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => handleItemClick(path, index)}
              >
                {index === 0
                  ? "User Info"
                  : index === 1
                  ? "Calculator"
                  : index === 2
                  ? "Food"
                  : index === 3
                  ? "Diary"
                  : "Report"}
              </Item>
            )
          )}
        </ItemContainer>

        <LogOutContainer>
          <Item
            onClick={handleLogoutClick}
            ref={(el) => (itemRefs.current[5] = el)}
          >
            Log out
          </Item>
        </LogOutContainer>
      </NavBar>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={handleDialogClose}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        contentText="Are you sure you want to log out?"
        confirmButtonText="Log out"
        cancelButtonText="Cancel"
        confirmButtonColor="red"
      />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ toggleMenu: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 170px;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 1000px) {
    margin-top: 48px;
  }
`;
const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Item = styled.div`
  cursor: pointer;
  padding: 8px 16px;
  color: white;
  margin-top: 24px;
`;

const Logo = styled.div`
  display: flex;
  justify-self: center;
  font-size: 24px;
  height: 48px;
  margin-top: 60px;
  color: white;
  cursor: pointer;
`;
const LogOutContainer = styled.div`
  display: flex;
  padding: 8px;

  & ${Item} {
    transition: transform 0.3s ease, color 0.3s ease;

    &:hover {
      transform: scale(1.2);
      color: #a23419;
    }
  }
`;

export default Sidebar;

import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { annotate } from "rough-notation";
import styled from "styled-components";
import { signOutUser } from "../firebase/firebaseAuth";
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
        color: "white",
        padding: 5,
        animationDuration: 200,
      });
      annotation.show();
    }
  };
  const handleLogoutClick = () => {
    setIsConfirmOpen(true);
  };
  const handleDialogClose = () => {
    setIsConfirmOpen(false);
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
  const isRootPath = location.pathname === "/";

  return (
    <Wrapper toggleMenu={toggleMenu} isRoot={isRootPath}>
      <NavBar isRoot={isRootPath}>
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

const Wrapper = styled.div<{ toggleMenu: boolean; isRoot: boolean }>`
  position: fixed;
  top: 0;
  width: 170px;
  height: 100%;
  background-color: #363636;
  justify-content: center;
  align-items: center;
  transition: left 0.3s ease, right 0.3s ease;

  left: ${({ toggleMenu, isRoot }) => (isRoot && !toggleMenu ? "-200px" : "0")};
  right: ${({ toggleMenu }) => (!toggleMenu ? "-200px" : "0")};

  z-index: 10;
  @media (max-width: 1000px) {
    right: ${({ toggleMenu }) => (toggleMenu ? "0" : "-200px")};
    left: auto;
  }
`;

const NavBar = styled.div<{ isRoot: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 36px;
  margin-top: ${({ isRoot }) => (isRoot ? "40px" : "0")};
  @media (max-width: 1000px) {
    margin-top: 48px;
  }
`;
const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120px;
`;
const Item = styled.div`
  cursor: pointer;
  padding: 8px 16px;
  color: white;
  font-size: 20px;
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

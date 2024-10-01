import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { auth } from "../../firebase/firebaseConfig";
import { gsap } from "gsap";
import GSAPHEAD from "../../components/GSAPHead/Wrapper";
import GSAPMAIN from "../../components/GSAPMain/Wrapper";
import Sidebar from "../../components/Sidebar";
import Overlay from "../../components/Overlay";
import HamburgerIcon from "../../components/MenuButton";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [isTitleInHeader, setIsTitleInHeader] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [user, setUser] = useState(null);

  const titleRef = useRef(null);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const scrollDirection = scrollY > 0 ? "down" : "up";

    if (scrollDirection === "down" && !isTitleInHeader) {
      gsap.to(titleRef.current, {
        y: 0,
        duration: 0,
        ease: "power4.out",
        onComplete: () => setIsTitleInHeader(true),
      });
      setIsAtTop(false);
    } else if (scrollY === 0 && isTitleInHeader) {
      gsap.to(titleRef.current, {
        y: 200,
        duration: 0,
        ease: "power4.out",
        onComplete: () => setIsTitleInHeader(false),
      });
      setIsAtTop(true);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // 組件卸載時取消監聽
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isTitleInHeader]);
  useEffect(() => {
    gsap.set(titleRef.current, { transition: "none" });

    if (window.scrollY === 0) {
      gsap.set(titleRef.current, { y: 200 });
    } else {
      gsap.set(titleRef.current, { y: 0 });
      setIsTitleInHeader(true);
    }

    setTimeout(() => {
      gsap.set(titleRef.current, { transition: "all 0.5s ease" });
    }, 0);

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const handleLogin = () => {
    navigate("/login");
  };
  const handleMenuToggle = () => {
    setToggleMenu((prev) => !prev);
  };
  return (
    <Wrapper>
      <HeaderWrapper ref={headerRef}>
        {toggleMenu && <Overlay onClick={handleMenuToggle} />}
        {user ? (
          <>
            <HamburgerIcon onClick={handleMenuToggle} />
            <Sidebar toggleMenu={toggleMenu} />
          </>
        ) : (
          <LoginButton onClick={handleLogin}>Login</LoginButton>
        )}
        <Title ref={titleRef} isTitleInHeader={isTitleInHeader}>
          NuBalance
        </Title>
      </HeaderWrapper>
      <GSAPHEAD />
      <GSAPMAIN />

      <ProductInfo />
    </Wrapper>
  );
};

// 樣式部分
const Wrapper = styled.div``;

const HeaderWrapper = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  width: 100%;
  height: 140px; /* Header 的高度 */
  justify-content: center;
  align-items: center;
  background-color: transparent;
  z-index: 10;
`;

const Title = styled.p<{ isTitleInHeader: boolean }>`
  position: ${({ isTitleInHeader }) =>
    isTitleInHeader ? "fixed" : "absolute"};
  top: ${({ isTitleInHeader }) => (isTitleInHeader ? "50px" : "50px")};
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${({ isTitleInHeader }) => (isTitleInHeader ? "24px" : "48px")};
  transition: all 0.5s ease;
  color: black;
  width: 100%;
  text-align: center;
`;

const LoginButton = styled.div`
  position: absolute;
  right: 8px;
  top: 24px;
  font-size: 24px;
  cursor: pointer;
  z-index: 11;
`;
const ProductInfo = styled.div`
  width: 100%;
  height: 800px;
  margin-top: 20px;
  background-color: gray;
`;

export default LandingPage;

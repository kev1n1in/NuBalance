import { User } from "firebase/auth";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import GSAPHEAD from "../../components/GSAPHead/Wrapper";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import Sidebar from "../../components/Sidebar";
import { auth } from "../../firebase/firebaseConfig";

const LandingPage = () => {
  const [isTitleInHeader, setIsTitleInHeader] = useState(false);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
    } else if (scrollY === 0 && isTitleInHeader) {
      gsap.to(titleRef.current, {
        y: 200,
        duration: 0,
        ease: "power4.out",
        onComplete: () => setIsTitleInHeader(false),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
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
    <div>
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
      {/* <GSAPMAIN /> */}
    </div>
  );
};

const HeaderWrapper = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  width: 100%;
  height: 140px;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  z-index: 10;
`;

const Title = styled.p<{ isTitleInHeader: boolean }>`
  position: ${({ isTitleInHeader }) =>
    isTitleInHeader ? "fixed" : "absolute"};
  top: 50px;
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
  right: 20px;
  top: 24px;
  font-size: 24px;
  cursor: pointer;
  z-index: 11;
`;
export default LandingPage;

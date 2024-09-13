import { GlobalStyle } from "./GlobalStyle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Calculator from "./pages/Calculator";
import Diary from "./pages/Diary";
import Report from "./pages/Report";
import UserInfo from "./pages/UserInfo";

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/report" element={<Report />} />
          <Route path="/userInfo" element={<UserInfo />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

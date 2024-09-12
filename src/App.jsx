import { GlobalStyle } from "./GlobalStyle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../src/pages/Login";
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
          <Route path="/Calculator" element={<Calculator />} />
          <Route path="/Diary" element={<Diary />} />
          <Route path="/Report" element={<Report />} />
          <Route path="/UserInfo" element={<UserInfo />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

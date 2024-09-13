import { GlobalStyle } from "./GlobalStyle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Calculator from "./pages/Calculator";
import Diary from "./pages/Diary";
import Report from "./pages/Report";
import UserInfo from "./pages/UserInfo";
import PrivateRoute from "./components/PrivateRoute";
import Food from "../src/pages/Food";

//這邊阻擋有點重複

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/calculator"
            element={<PrivateRoute element={<Calculator />} />}
          />
          <Route path="/diary" element={<PrivateRoute element={<Diary />} />} />
          <Route
            path="/report"
            element={<PrivateRoute element={<Report />} />}
          />
          <Route
            path="/userInfo"
            element={<PrivateRoute element={<UserInfo />} />}
          />
          <Route path="/food" element={<PrivateRoute element={<Food />} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

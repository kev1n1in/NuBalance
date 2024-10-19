import { QueryClient, QueryClientProvider } from "react-query";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Food from "../src/pages/Food";
import PrivateRoute from "./components/PrivateRoute";
import { GlobalStyle } from "./GlobalStyle";
import Calculator from "./pages/Calculator";
import Diary from "./pages/Diary";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Report from "./pages/Report";
import UserInfo from "./pages/UserInfo";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/calculator"
              element={<PrivateRoute element={<Calculator />} />}
            />
            <Route
              path="/diary"
              element={<PrivateRoute element={<Diary />} />}
            />
            <Route
              path="/report"
              element={<PrivateRoute element={<Report />} />}
            />
            <Route
              path="/userInfo"
              element={<PrivateRoute element={<UserInfo />} />}
            />
            <Route path="*" element={<Navigate to="/userInfo" replace />} />
            <Route path="/food" element={<PrivateRoute element={<Food />} />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </>
  );
}

export default App;

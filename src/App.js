import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import CandleStick from "./pages/CandleStick";
import TradingViewChart from "./pages/TradingViewChart";
import Testing from "./pages/Testing";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IndicatorBuildingListing from "./components/scanner/IndicatorBuilderListing";
import Login from "./pages/auth/login";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
import Signup from "./pages/auth/signup";
import { Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ScannerBuilder from "./pages/scanner/ScannerBuilder";
import CustomIndicator from "./pages/customIndicator/CustomIndicator";
import { AlertsPage, ProfilePage, ScansPage } from "./pages/auth/Profile";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <Routes>
          <Route
            path="/candleStick"
            element={
              <ProtectedRoute>
                <CandleStick />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scannerBuilder"
            element={
              <ProtectedRoute>
                <ScannerBuilder />
              </ProtectedRoute>
            }
          />
          <Route path="/scannerBuilder/:scanSlug" element={<ScannerBuilder />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customIndicator"
            element={
              <ProtectedRoute>
                <CustomIndicator />
              </ProtectedRoute>
            }
          />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/scan_dashboard" element={<ScansPage />} />
          <Route path="/alert_dashboard" element={<AlertsPage />} />

          {/* <Route path="/" element={<Form />} /> */}
          <Route path="/testing" element={<Testing />} />
          <Route path="/tradingview" element={<TradingViewChart />} />
          {/* <Route path="/indiatorSlide" element={<IndiatorSlide />} /> */}

          
          <Route path="/home" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

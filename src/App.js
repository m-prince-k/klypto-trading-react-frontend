import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "./styles/theme.css";
import { ThemeProvider } from "./context/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
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
import Profile, {
  AlertsPage,
  ProfilePage,
  ScansPage,
} from "./pages/auth/Profile";
import StrategyCanvas from "./pages/stretegy-builder/components/builder/StrategyCanvas";
import CryptoEdgeDashboard from "./pages/CryptoEdgeDashboard/CryptoEdgeDashboard";
import SocialIntellingence from "./pages/CryptoEdgeDashboard/socialIntellingence/socialIntellingence";
import CoinMarketDetails from "./pages/CryptoEdgeDashboard/marketData/CoinMarketDetails";

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="App">
          <BrowserRouter>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              theme="colored"
            />
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
              <Route
                path="/scannerBuilder/:scanSlug"
                element={<ScannerBuilder />}
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/customIndicator" element={<CustomIndicator />} />

              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/scan_dashboard" element={<ScansPage />} />
              <Route path="/alert_dashboard" element={<AlertsPage />} />
              <Route path="/strategy-builder" element={<StrategyCanvas />} />
              <Route path="/market/:symbol" element={<CoinMarketDetails />} />

              {/* <Route path="/" element={<Form />} /> */}
              <Route path="/testing" element={<Testing />} />
              <Route path="/tradingview" element={<TradingViewChart />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <CryptoEdgeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social-intelligence"
                element={<SocialIntellingence />}
              />
              {/* <Route path="/indiatorSlide" element={<IndiatorSlide />} /> */}

              <Route path="/home" element={<Home />} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

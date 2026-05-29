import { BrowserRouter, Route, Routes } from "react-router-dom";
import WaveletDashboard from "./pages/wavelet/WaveletDashboard";
import "./App.css";
import "./styles/theme.css";
import { ThemeProvider } from "./context/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
import SocialIntelligence from "./pages/CryptoEdgeDashboard/socialIntellingence/socialIntellingence";

// ── Lazy-loaded routes (each becomes its own JS chunk) ──────────────────────
const CandleStick           = lazy(() => import("./pages/CandleStick"));
const TradingViewChart      = lazy(() => import("./pages/TradingViewChart"));
const Testing               = lazy(() => import("./pages/Testing"));
const IndicatorBuildingListing = lazy(() => import("./components/scanner/IndicatorBuilderListing"));
const Login                 = lazy(() => import("./pages/auth/login"));
const Signup                = lazy(() => import("./pages/auth/signup"));
const Home                  = lazy(() => import("./pages/Home"));
const ScannerBuilder        = lazy(() => import("./pages/scanner/ScannerBuilder"));
const CustomIndicator       = lazy(() => import("./pages/customIndicator/CustomIndicator"));
const Profile               = lazy(() => import("./pages/auth/Profile"));
const ProfilePage           = lazy(() => import("./pages/auth/Profile").then(m => ({ default: m.ProfilePage })));
const AlertsPage            = lazy(() => import("./pages/auth/Profile").then(m => ({ default: m.AlertsPage })));
const ScansPage             = lazy(() => import("./pages/auth/Profile").then(m => ({ default: m.ScansPage })));
const StrategyCanvas        = lazy(() => import("./pages/stretegy-builder/components/builder/StrategyCanvas"));
const CryptoEdgeDashboard   = lazy(() => import("./pages/CryptoEdgeDashboard/CryptoEdgeDashboard"));
const CoinMarketDetails     = lazy(() => import("./pages/CryptoEdgeDashboard/marketData/CoinMarketDetails"));

// Lightweight fallback shown while a route chunk is loading
const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'var(--bg-main, #07090e)',
    color: 'var(--text-muted, #6b7280)', fontSize: '14px', letterSpacing: '0.05em'
  }}>
    Loading…
  </div>
);


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
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/wavelet" element={<WaveletDashboard />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <CryptoEdgeDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/home" element={<Home />} />

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

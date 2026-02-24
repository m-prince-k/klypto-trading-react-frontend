import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import {Form} from './components/tradingModals/Form'
import CandleStick from './pages/CandleStick';
import TradingViewChart from './pages/TradingViewChart';
import IndiatorSlide from './components/indicator/indicatorSlide';
import Testing from './pages/Testing';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import IndicatorBuildingListing from './components/indicator/IndicatorBuilderListing';
import Login from './pages/auth/login';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
      <Routes>
        {/* <Route path="/" element={<Form />} /> */}
        <Route path="/" element={< CandleStick />} />
        <Route path="/testing" element={< Testing />} />
        <Route path="/tradingview" element={< TradingViewChart />} />
        <Route path="/indiatorSlide" element={< IndiatorSlide />} />

        <Route path="/IndicatorBuildingListing" element={< IndicatorBuildingListing />} />
        <Route path="/login" element={< Login />} />


      </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;

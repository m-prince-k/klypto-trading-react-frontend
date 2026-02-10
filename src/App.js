import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import {Form} from './components/tradingModals/Form'
import CandleStick from './pages/CandleStick';
import TradingViewChart from './pages/TradingViewChart';
import IndiatorSlide from './components/indicator/indicatorSlide';
import Testing from './pages/Testing';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/candlestick" element={< CandleStick />} />
        <Route path="/testing" element={< Testing />} />
        <Route path="/tradingview" element={< TradingViewChart />} />
        <Route path="/indiatorSlide" element={< IndiatorSlide />} />

      </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;

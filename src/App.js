import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import {Form} from './pages/form'
import Candlestick from './pages/candleStick';
import TradingViewChart from './pages/TradingViewChart';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/candlestick" element={< Candlestick />} />
        <Route path="/tradingview" element={< TradingViewChart />} />

      </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;

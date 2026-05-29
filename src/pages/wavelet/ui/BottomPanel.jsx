import React from "react";

export default function BottomPanel({ data }) {
  // Try to parse values from data or fallback to defaults
  const stats = data?.dashboard?.summary || {};
  
  const lastTopDate = stats.lastTopDate || "20 Jun 15:00";
  const lastTopPrice = stats.lastTopPrice || "68,900.5";
  
  const lastBottomDate = stats.lastBottomDate || "19 Jun 06:00";
  const lastBottomPrice = stats.lastBottomPrice || "65,210.3";
  
  const nextTopDate = stats.nextTopDate || "21 Jun (Est.)";
  const nextTopConf = stats.nextTopConf || "72%";
  
  const nextBottomDate = stats.nextBottomDate || "22 Jun (Est.)";
  const nextBottomConf = stats.nextBottomConf || "68%";
  
  const marketState = data?.dashboard?.market?.state || "Bullish";
  const momentum = data?.dashboard?.market?.momentum || "Upward Momentum";
  const isBullish = marketState.toUpperCase().includes("BULL") || marketState.toUpperCase().includes("UP");

  return (
    <div className="wavelet-bottom-panel">
      <div className="bottom-card text-red">
        <div className="bottom-card-title">LAST TOP DETECTED</div>
        <div className="bottom-card-value">{lastTopDate}</div>
        <div className="bottom-card-sub">Price: {lastTopPrice}</div>
      </div>
      
      <div className="bottom-card text-green">
        <div className="bottom-card-title">LAST BOTTOM DETECTED</div>
        <div className="bottom-card-value">{lastBottomDate}</div>
        <div className="bottom-card-sub">Price: {lastBottomPrice}</div>
      </div>
      
      <div className="bottom-card text-red">
        <div className="bottom-card-title">NEXT POSSIBLE TOP</div>
        <div className="bottom-card-value">{nextTopDate}</div>
        <div className="bottom-card-sub">Confidence: {nextTopConf}</div>
      </div>
      
      <div className="bottom-card text-green">
        <div className="bottom-card-title">NEXT POSSIBLE BOTTOM</div>
        <div className="bottom-card-value">{nextBottomDate}</div>
        <div className="bottom-card-sub">Confidence: {nextBottomConf}</div>
      </div>
      
      <div className="bottom-card flex-col-center">
        <div className="bottom-card-title">MARKET STATE</div>
        <div className={`bottom-card-value ${isBullish ? "text-green" : "text-red"}`}>
          {marketState}
        </div>
        <div className={`bottom-card-sub ${isBullish ? "text-green" : "text-red"}`}>
          ({momentum})
        </div>
      </div>
    </div>
  );
}

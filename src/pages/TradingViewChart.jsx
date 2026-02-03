import { useEffect, useRef } from "react";

const TradingViewChart = () => {
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!widgetRef.current) return;

    // Clear previous widget (important in React StrictMode)
    widgetRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;

    script.innerHTML = `
      {
        "allow_symbol_change": true,
        "calendar": false,
        "details": true,
        "hide_side_toolbar": false,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "hide_volume": false,
        "hotlist": true,
        "interval": "15",
        "locale": "en",
        "save_image": true,
        "style": "1",
        "symbol": "OANDA:XAUUSD",
        "theme": "dark",
        "timezone": "Asia/Kolkata",
        "backgroundColor": "#0F0F0F",
        "gridColor": "rgba(242, 242, 242, 0.06)",
        "withdateranges": true,
        "range": "12M",
        "compareSymbols": [
          { "symbol": "BITSTAMP:BTCUSD", "position": "SameScale" }
        ],
        "studies": [
          "STD;24h%Volume",
          "STD;Accumulation_Distribution",
          "STD;Advance%1Decline%1Line",
          "STD;Advance%1Decline%1Ratio",
          "STD;Advance_Decline_Ratio_Bars"
        ],
        "autosize": true
      }
    `;

    widgetRef.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      style={{ width: "100%", height: "100%" }}
    >
      {/* ⚠️ ref MUST be attached directly to a DOM element */}
      <div
        ref={widgetRef}
        className="tradingview-widget-container__widget"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default TradingViewChart;

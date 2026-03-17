import React, { useEffect, useRef, useState } from "react";
import { CandlestickSeries, createChart } from "lightweight-charts";
import {MiniChartProprties} from "../../util/common"
/* ---------------- BINANCE HELPERS ---------------- */

const BASE = "https://api.binance.com/api/v3";

async function fetchOHLC(symbol) {
  const res = await fetch(`${BASE}/klines?symbol=${symbol}&interval=5m&limit=40`);
  const data = await res.json();
 

  return data.map(c => ({
    time: c[0] / 1000,
    open: +c[1],
    high: +c[2],
    low: +c[3],
    close: +c[4],
  }));
}
/* ---------------- MINI CHART ---------------- */

export default function MiniChart( {symbol} ) {

console.log(symbol, "selectedddddddddddddddddddd")

  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return; // 🔴 IMPORTANT GUARD

    let isMounted = true;

    fetchOHLC(symbol).then(candles => {
      if (!isMounted || !ref.current) return;

      chartRef.current = createChart(ref.current, MiniChartProprties);

      const series = chartRef.current.addSeries(CandlestickSeries);
      series.setData(candles);
    });

    return () => {
      isMounted = false;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 0,
        left: "120px",
        zIndex: 10,
        width: 220,
        height: 120,
        border: "1px solid #ccc",
        background: "#fff",
      }}
    />
  );
}


/* ---------------- MAIN SCANNER ---------------- */

// export default function Testing() {
//   const [rows, setRows] = useState([]);
//   const [hover, setHover] = useState(null);

//   useEffect(() => {
//     async function scan() {
//       const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];
//       const out = [];

//       for (let s of symbols) {
//         const candles = await fetchOHLC(s);
//         const closes = candles.map(c => c.close);
//         const rsi = calcRSI(closes);

//         if (rsi >= 10) {
//           const last = candles[candles.length - 1];
//           out.push({
//             symbol: s,
//             rsi: rsi.toFixed(2),
//             ...last,
//           });
//          }
//       }
//       setRows(out);
//     }
//     scan();
//   }, []);

//   console.log(rows)

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>RSI ≥ 60 Scanner</h2>

//       <table width="100%" cellPadding="8" border="1">
//         <thead>
//           <tr>
//             <th>Symbol</th>
//             <th>RSI</th>
//             <th>Open</th>
//             <th>High</th>
//             <th>Low</th>
//             <th>Close</th>
//           </tr>
//         </thead>

//         <tbody>
//           {rows?.map(row => (
//             <tr key={row.symbol}>
//               <td
//                 style={{ position: "relative", cursor: "pointer" }}
//                 onMouseEnter={() => setHover(row?.symbol)}
//                 onMouseLeave={() => setHover(null)}
//               >
//                 {row.symbol}

//                 {hover === row.symbol && (
//                   <MiniChart symbol={row.symbol} />
//                 )}
//               </td>

//               <td>{row.rsi}</td>
//               <td>{row.open}</td>
//               <td>{row.high}</td>
//               <td>{row.low}</td>
//               <td>{row.close}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
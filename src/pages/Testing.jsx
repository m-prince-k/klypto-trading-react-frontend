import React, { useEffect, useState } from "react";
import axios from "axios";

export default function OBVTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const symbol = "BTCUSDT";
  const interval = "1m";

  const fetchFullData = async () => {
    setLoading(true);

    let startTime = new Date("2020-08-01").getTime();
    const endTime = Date.now();

    let allData = [];

    try {
      while (startTime < endTime) {
        const url = `https://api.binance.com/api/v3/klines`;

        const res = await axios.get(url, {
          params: {
            symbol,
            interval,
            startTime,
            limit: 1000,
          },
        });

        const chunk = res.data;

        if (!chunk.length) break;

        allData = [...allData, ...chunk];

        // move startTime forward
        startTime = chunk[chunk.length - 1][0] + 1;

        console.log("Fetched:", allData.length);

        // 🔥 prevent UI freeze (important)
        await new Promise((r) => setTimeout(r, 100));
      }

      console.log("Total candles:", allData.length);

      const formatted = formatAndCalculateOBV(allData);
      setData(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ OBV CALCULATION
  const formatAndCalculateOBV = (raw) => {
    let obv = 0;

    return raw.map((candle, i) => {
      const currentClose = parseFloat(candle[4]);
      const volume = parseFloat(candle[5]);

      if (i > 0) {
        const prevClose = parseFloat(raw[i - 1][4]);

        if (currentClose > prevClose) obv += volume;
        else if (currentClose < prevClose) obv -= volume;
      }

      return {
        time: new Date(candle[0]).toLocaleString(),
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
        obv: obv.toFixed(2),
      };
    });
  };

  useEffect(() => {
    fetchFullData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>
        OBV Table ({symbol} - {interval})
      </h2>

      {loading && <p>Loading full history... ⏳</p>}

      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        <table
          border="1"
          cellPadding="6"
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "12px",
          }}
        >
          <thead style={{ position: "sticky", top: 0, background: "#eee" }}>
            <tr>
              <th>Time</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume</th>
              <th>OBV</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.time}</td>
                <td>{row.open}</td>
                <td>{row.high}</td>
                <td>{row.low}</td>
                <td>{row.close}</td>
                <td>{row.volume}</td>
                <td>{row.obv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

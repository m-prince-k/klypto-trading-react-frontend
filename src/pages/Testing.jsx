import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
} from "lightweight-charts";

// ── OHLC data (deterministic seed so pattern always appears) ─────────────────
function generateOHLC(count = 200) {
  let seed = 42;
  const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };

  const data = [];
  let close = 2600;
  const start = 1_700_000_000 - count * 86400;

  for (let i = 0; i < count; i++) {
    const trend = i > 80 && i < 130 ? -0.4 : 0.15;
    const vol = 28 + rng() * 18;
    const open = close;
    close = Math.max(2100, open + trend * vol + (rng() - 0.5) * vol * 2);
    const high = Math.max(open, close) + rng() * vol * 0.5;
    const low  = Math.min(open, close) - rng() * vol * 0.5;
    data.push({ time: start + i * 86400, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
  }

  // Carve first bottom ≈ idx 101
  const base = 2220;
  for (let j = 95; j <= 107; j++) {
    const dist = Math.abs(j - 101);
    const dip  = base + dist * 13;
    data[j].low   = +(dip - 10).toFixed(2);
    data[j].close = +(dip + 7).toFixed(2);
    data[j].open  = +(dip + 10).toFixed(2);
    data[j].high  = +(dip + 20).toFixed(2);
  }
  // Carve second bottom ≈ idx 121
  for (let j = 115; j <= 127; j++) {
    const dist = Math.abs(j - 121);
    const dip  = base + 20 + dist * 13;
    data[j].low   = +(dip - 10).toFixed(2);
    data[j].close = +(dip + 9).toFixed(2);
    data[j].open  = +(dip + 7).toFixed(2);
    data[j].high  = +(dip + 22).toFixed(2);
  }
  // Breakout candle ≈ idx 140
  data[140] = { ...data[140], open: 2512, close: 2568, high: 2585, low: 2505 };

  return data;
}

// ── Pure-JS RSI (tulind-style) ───────────────────────────────────────────────
function calcRSI(closes, period = 14) {
  const out = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return out;
  let ag = 0, al = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    ag += Math.max(d, 0); al += Math.max(-d, 0);
  }
  ag /= period; al /= period;
  out[period] = +(100 - 100 / (1 + ag / (al || 1e-9))).toFixed(2);
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    ag = (ag * (period - 1) + Math.max(d, 0))  / period;
    al = (al * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = +(100 - 100 / (1 + ag / (al || 1e-9))).toFixed(2);
  }
  return out;
}

// ── Pure-JS EMA (tulind-style) ───────────────────────────────────────────────
function calcEMA(closes, period = 20) {
  const out = new Array(closes.length).fill(null);
  if (closes.length < period) return out;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = +ema.toFixed(2);
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    out[i] = +ema.toFixed(2);
  }
  return out;
}

// ── Double Bottom detector ───────────────────────────────────────────────────
function detectDoubleBottom(ohlc) {
  const lows   = ohlc.map(c => c.low);
  const highs  = ohlc.map(c => c.high);
  const closes = ohlc.map(c => c.close);
  const hits   = [];

  for (let i = 10; i < ohlc.length - 40; i++) {
    const s1e = i + 13, s2s = s1e + 4, s2e = s2s + 13;
    if (s2e >= ohlc.length) break;

    let b1v = Infinity, b1i = -1;
    for (let j = i; j <= s1e; j++) if (lows[j] < b1v) { b1v = lows[j]; b1i = j; }
    let b2v = Infinity, b2i = -1;
    for (let j = s2s; j <= s2e; j++) if (lows[j] < b2v) { b2v = lows[j]; b2i = j; }

    if (b1i < 0 || b2i < 0 || b2i <= b1i + 5) continue;
    if (Math.abs(b1v - b2v) / b1v > 0.05) continue;

    let neck = -Infinity;
    for (let j = b1i + 1; j < b2i; j++) if (highs[j] > neck) neck = highs[j];

    let bkI = -1;
    for (let k = b2i + 1; k < Math.min(b2i + 22, ohlc.length); k++) {
      if (closes[k] > neck) { bkI = k; break; }
    }
    if (bkI < 0) continue;

    const depth = (neck - Math.min(b1v, b2v)) / neck;
    const sym   = 1 - Math.abs(b1v - b2v) / b1v / 0.05;
    const conf  = Math.min(0.99, +(0.5 + depth * 3 + sym * 0.25).toFixed(2));
    hits.push({ pattern: "Double Bottom", confidence: conf,
      startIndex: b1i, endIndex: bkI,
      bottom1Index: b1i, bottom2Index: b2i,
      breakoutIndex: bkI, breakoutPrice: closes[bkI],
      neckline: +neck.toFixed(2) });
  }
  return hits.length ? hits.sort((a, b) => b.confidence - a.confidence)[0] : null;
}

// ── Static data (created once outside component) ────────────────────────────
const OHLC = generateOHLC(200);

// ── Component ────────────────────────────────────────────────────────────────
export default function DoubleBottomChart() {
  const mainDiv = useRef(null);
  const rsiDiv  = useRef(null);
  const [pat, setPat]   = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!mainDiv.current || !rsiDiv.current) return;

    const W = mainDiv.current.clientWidth || 900;

    // ── Main chart ─────────────────────────────────────────────────────────
    const mainChart = createChart(mainDiv.current, {
      width:  W,
      height: 400,
      layout: { background: { type: "solid", color: "#0d1117" }, textColor: "#8b949e" },
      grid:   { vertLines: { color: "#1c2333" }, horzLines: { color: "#1c2333" } },
      rightPriceScale: { borderColor: "#30363d" },
      timeScale: { borderColor: "#30363d", timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
    });

    // Candlestick series  ← v5 API: addSeries(CandlestickSeries, opts)
    const candleSeries = mainChart.addSeries(CandlestickSeries, {
      upColor:        "#3fb950",
      downColor:      "#f85149",
      borderUpColor:  "#3fb950",
      borderDownColor:"#f85149",
      wickUpColor:    "#3fb950",
      wickDownColor:  "#f85149",
    });
    candleSeries.setData(OHLC);

    // EMA 20
    const closes  = OHLC.map(c => c.close);
    const ema20   = calcEMA(closes, 20);
    const emaSeries = mainChart.addSeries(LineSeries, {
      color: "#58a6ff", lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false,
    });
    emaSeries.setData(
      OHLC.map((c, i) => ema20[i] != null ? { time: c.time, value: ema20[i] } : null).filter(Boolean)
    );

    // ── RSI chart ──────────────────────────────────────────────────────────
    const rsiChart = createChart(rsiDiv.current, {
      width:  W,
      height: 110,
      layout: { background: { type: "solid", color: "#0d1117" }, textColor: "#8b949e" },
      grid:   { vertLines: { color: "#1c2333" }, horzLines: { color: "#1c2333" } },
      rightPriceScale: { borderColor: "#30363d", scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: "#30363d", timeVisible: false },
      crosshair: { mode: 1 },
    });

    const rsiVals = calcRSI(closes, 14);
    const rsiLine = rsiChart.addSeries(LineSeries, {
      color: "#d2a8ff", lineWidth: 1.5, priceLineVisible: false, lastValueVisible: true,
    });
    rsiLine.setData(
      OHLC.map((c, i) => rsiVals[i] != null ? { time: c.time, value: rsiVals[i] } : null).filter(Boolean)
    );
    // OB / OS reference lines
    [[70, "#f0883e"], [30, "#3fb950"]].forEach(([lvl, col]) => {
      const s = rsiChart.addSeries(LineSeries, { color: col, lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
      s.setData([{ time: OHLC[0].time, value: lvl }, { time: OHLC[OHLC.length - 1].time, value: lvl }]);
    });

    // Sync timescales
    mainChart.timeScale().subscribeVisibleLogicalRangeChange(r => r && rsiChart.timeScale().setVisibleLogicalRange(r));
    rsiChart.timeScale().subscribeVisibleLogicalRangeChange(r => r && mainChart.timeScale().setVisibleLogicalRange(r));

    // ── Pattern detection ──────────────────────────────────────────────────
    const det = detectDoubleBottom(OHLC);
    if (det) {
      const log = { pattern: det.pattern, confidence: det.confidence,
        startIndex: det.startIndex, endIndex: det.endIndex, breakoutPrice: det.breakoutPrice };
      console.log(JSON.stringify(log, null, 2));
      setPat(det);

      // ── Markers via createSeriesMarkers (v5 API) ───────────────────────
      const markers = [
        { time: OHLC[det.bottom1Index].time,  position: "belowBar", color: "#f85149", shape: "arrowUp",   size: 2, text: "① First Bottom"         },
        { time: OHLC[det.bottom2Index].time,  position: "belowBar", color: "#f0883e", shape: "arrowUp",   size: 2, text: "② Second Bottom"        },
        { time: OHLC[det.breakoutIndex].time, position: "aboveBar", color: "#3fb950", shape: "arrowDown", size: 2, text: `⚡ Breakout $${det.breakoutPrice}` },
        { time: OHLC[det.breakoutIndex].time, position: "aboveBar", color: "#58a6ff", shape: "circle",    size: 1, text: "Double Bottom ✓"         },
      ].sort((a, b) => a.time - b.time);

      createSeriesMarkers(candleSeries, markers);

      // Neckline dashed line
      const neckSeries = mainChart.addSeries(LineSeries, {
        color: "#d2a8ff", lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false,
      });
      neckSeries.setData([
        { time: OHLC[det.bottom1Index].time, value: det.neckline },
        { time: OHLC[Math.min(OHLC.length - 1, det.breakoutIndex + 10)].time, value: det.neckline },
      ]);

      // Zoom to pattern region
      mainChart.timeScale().setVisibleRange({
        from: OHLC[Math.max(0, det.startIndex - 12)].time,
        to:   OHLC[Math.min(OHLC.length - 1, det.endIndex + 18)].time,
      });
    }

    // Resize
    const ro = new ResizeObserver(() => {
      const w = mainDiv.current?.clientWidth;
      if (w) { mainChart.applyOptions({ width: w }); rsiChart.applyOptions({ width: w }); }
    });
    ro.observe(mainDiv.current);
    ro.observe(rsiDiv.current);

    return () => {
      ro.disconnect();
      mainChart.remove();
      rsiChart.remove();
    };
  }, []);

  const p = pat;
  return (
    <div style={{ background:"#0d1117", minHeight:"100vh", color:"#c9d1d9",
      fontFamily:"'JetBrains Mono','Fira Code','Courier New',monospace", padding:16, boxSizing:"border-box" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <span style={{ width:8,height:8,borderRadius:"50%",display:"inline-block",
          background:p?"#3fb950":"#f0883e", boxShadow:`0 0 6px ${p?"#3fb950":"#f0883e"}` }}/>
        <span style={{ fontSize:12, color:"#8b949e", letterSpacing:2, textTransform:"uppercase" }}>
          Double Bottom Detector · BTC/USD 1D
        </span>
        {p && <span style={{ marginLeft:"auto", fontSize:11, color:"#3fb950" }}>
          Pattern detected · {(p.confidence*100).toFixed(0)}% confidence
        </span>}
      </div>

      {/* Toolbar chips */}
      <div style={{ background:"#161b22", border:"1px solid #21262d", borderBottom:"none",
        borderRadius:"6px 6px 0 0", padding:"6px 12px", display:"flex", gap:8, flexWrap:"wrap", fontSize:11 }}>
        {[["#58a6ff","EMA 20"],["#d2a8ff","RSI 14"],["#f85149","① First Bottom"],
          ["#f0883e","② Second Bottom"],["#3fb950","⚡ Breakout"],["#d2a8ff","── Neckline"]].map(([c,l])=>(
          <span key={l} style={{ padding:"2px 7px", borderRadius:4, border:`1px solid ${c}55`, color:c, background:`${c}15` }}>{l}</span>
        ))}
      </div>

      {/* Main chart */}
      <div style={{ border:"1px solid #21262d", borderBottom:"none" }}>
        <div ref={mainDiv} style={{ width:"100%" }}/>
      </div>

      {/* RSI label */}
      <div style={{ background:"#161b22", padding:"3px 12px",
        border:"1px solid #21262d", borderBottom:"none", fontSize:10, color:"#6e7681" }}>
        RSI (14) · OB 70 · OS 30
      </div>

      {/* RSI chart */}
      <div style={{ border:"1px solid #21262d", borderRadius:"0 0 6px 6px", overflow:"hidden" }}>
        <div ref={rsiDiv} style={{ width:"100%" }}/>
      </div>

      {/* JSON panel */}
      {p && (
        <div style={{ marginTop:14, border:"1px solid #30363d", borderRadius:6, overflow:"hidden", background:"#161b22" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"8px 14px", cursor:"pointer", borderBottom:open?"1px solid #21262d":"none" }}
            onClick={()=>setOpen(v=>!v)}>
            <span style={{ fontSize:11, color:"#3fb950", fontWeight:700 }}>✓ PATTERN LOG — DOUBLE BOTTOM</span>
            <div style={{ display:"flex", gap:16 }}>
              {[["Conf",`${(p.confidence*100).toFixed(0)}%`,"#3fb950"],
                ["Breakout",`$${p.breakoutPrice}`,"#58a6ff"],
                ["Neckline",`$${p.neckline}`,"#d2a8ff"],
                ["Bars",p.endIndex-p.startIndex,"#f0883e"]].map(([lbl,val,col])=>(
                <div key={lbl} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:9, color:"#6e7681", textTransform:"uppercase" }}>{lbl}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:col }}>{val}</div>
                </div>
              ))}
            </div>
            <span style={{ color:"#6e7681", fontSize:10 }}>{open?"▲":"▼"}</span>
          </div>
          {open && (
            <pre style={{ margin:0, padding:"12px 16px", fontSize:12, lineHeight:1.8,
              background:"#0d1117", overflowX:"auto", color:"#c9d1d9" }}>
{`{\n`}
{`  `}<span style={{color:"#79c0ff"}}>"pattern"</span>{`: `}<span style={{color:"#a5d6ff"}}>{`"${p.pattern}"`}</span>{`,\n`}
{`  `}<span style={{color:"#79c0ff"}}>"confidence"</span>{`: `}<span style={{color:"#f2cc60"}}>{p.confidence}</span>{`,\n`}
{`  `}<span style={{color:"#79c0ff"}}>"startIndex"</span>{`: `}<span style={{color:"#f2cc60"}}>{p.startIndex}</span>{`,\n`}
{`  `}<span style={{color:"#79c0ff"}}>"endIndex"</span>{`: `}<span style={{color:"#f2cc60"}}>{p.endIndex}</span>{`,\n`}
{`  `}<span style={{color:"#79c0ff"}}>"breakoutPrice"</span>{`: `}<span style={{color:"#f2cc60"}}>{p.breakoutPrice}</span>{`\n`}
{`}`}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
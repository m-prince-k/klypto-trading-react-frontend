import React, { useEffect } from "react";

function formatDate(val) {
  if (!val) return null;
  try {
    const d = new Date(typeof val === "number" && val < 1e12 ? val * 1000 : val);
    if (isNaN(d.getTime())) return null;
    const day = d.getDate();
    const mon = d.toLocaleString("en-US", { month: "short" });
    const hh  = String(d.getHours()).padStart(2, "0");
    const mm  = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${mon} ${hh}:${mm}`;
  } catch {
    return null;
  }
}

function formatPrice(val) {
  if (val == null) return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatConf(val) {
  if (val == null) return null;
  if (typeof val === "string" && val.includes("%")) return val;
  const n = Number(val);
  if (isNaN(n)) return null;
  return (n > 1 ? n : n * 100).toFixed(0) + "%";
}

const NA = <span className="rp-na">N/A</span>;

export default function BottomPanel({ data }) {
  const stats = data?.dashboard?.summary || {};

  useEffect(() => {
    console.log("=== data.dashboard.summary ===", stats);
    console.log("=== Full data.dashboard ===", data?.dashboard);
    console.log("=== data keys ===", data ? Object.keys(data) : "no data");
  }, [data]);

  // Every field is null if the backend doesn't supply it — no hardcoded fallbacks
  const lastTopDate =
    formatDate(stats.lastTopDate ?? stats.last_top_date ?? stats.top_time ?? stats.lastTop?.time);
  const lastTopPrice =
    formatPrice(stats.lastTopPrice ?? stats.last_top_price ?? stats.lastTop?.price);

  const lastBottomDate =
    formatDate(stats.lastBottomDate ?? stats.last_bottom_date ?? stats.bottom_time ?? stats.lastBottom?.time);
  const lastBottomPrice =
    formatPrice(stats.lastBottomPrice ?? stats.last_bottom_price ?? stats.lastBottom?.price);

  const nextTopDate =
    formatDate(stats.nextTopDate ?? stats.next_top_date ?? stats.nextTop?.time) ??
    (stats.nextTopEst ? String(stats.nextTopEst) : null);
  const nextTopConf =
    formatConf(stats.nextTopConf ?? stats.next_top_conf ?? stats.nextTopConfidence ?? stats.nextTop?.confidence);

  const nextBottomDate =
    formatDate(stats.nextBottomDate ?? stats.next_bottom_date ?? stats.nextBottom?.time) ??
    (stats.nextBottomEst ? String(stats.nextBottomEst) : null);
  const nextBottomConf =
    formatConf(stats.nextBottomConf ?? stats.next_bottom_conf ?? stats.nextBottomConfidence ?? stats.nextBottom?.confidence);

  return (
    <div className="wavelet-bottom-panel">

      {/* LAST TOP DETECTED */}
      <div className="bottom-stat-card">
        <div className="bottom-stat-label">LAST TOP DETECTED</div>
        <div className="bottom-stat-value text-red">{lastTopDate   ?? NA}</div>
        <div className="bottom-stat-sub  text-red">Price: {lastTopPrice ?? NA}</div>
      </div>

      {/* LAST BOTTOM DETECTED */}
      <div className="bottom-stat-card">
        <div className="bottom-stat-label">LAST BOTTOM DETECTED</div>
        <div className="bottom-stat-value text-green">{lastBottomDate   ?? NA}</div>
        <div className="bottom-stat-sub  text-green">Price: {lastBottomPrice ?? NA}</div>
      </div>

      {/* NEXT POSSIBLE TOP */}
      <div className="bottom-stat-card">
        <div className="bottom-stat-label">NEXT POSSIBLE TOP</div>
        <div className="bottom-stat-value text-red">{nextTopDate ?? NA}</div>
        <div className="bottom-stat-sub text-muted">Confidence: {nextTopConf ?? NA}</div>
      </div>

      {/* NEXT POSSIBLE BOTTOM */}
      <div className="bottom-stat-card" style={{ borderRight: "none" }}>
        <div className="bottom-stat-label">NEXT POSSIBLE BOTTOM</div>
        <div className="bottom-stat-value text-green">{nextBottomDate ?? NA}</div>
        <div className="bottom-stat-sub text-muted">Confidence: {nextBottomConf ?? NA}</div>
      </div>

    </div>
  );
}

import React from "react";

const OverallMarketSentiment = ({ data = {}, getColorClass }) => {
  // ✅ Safe data access
  const score = data?.overall?.score ?? 0;
  const label = data?.overall?.label ?? "Neutral";
  const history = data?.overall?.history ?? [];

  // ✅ Accurate arc calculation
  const RADIUS = 80;
  const ARC_LENGTH = Math.PI * RADIUS;
  const dash = (score / 100) * ARC_LENGTH;

  // ✅ Needle rotation
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="col-lg-4">
      <div className="binance-card h-100">
        {/* HEADER */}
        <div className="card-header d-flex align-items-center">
          <span className="title">Overall Market Sentiment</span>
          <i className="bi bi-info-circle ms-2 info-icon"></i>
        </div>

        {/* BODY */}
        <div
          className="card-body d-flex pt-0 align-items-center"
          style={{ minHeight: "200px", gap: "12px" }}
        >
          {/* GAUGE */}
          <div className="gauge-container position-relative flex-grow-1 d-flex justify-content-center align-items-center">
            <svg
              viewBox="0 0 200 110"
              className="gauge-svg"
              style={{ width: "100%", maxWidth: "180px" }}
            >
              <defs>
                <linearGradient id="gaugeGradient">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* TRACK */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="var(--gauge-track)"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* PROGRESS ARC */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="18"
                strokeDasharray={`${dash} ${ARC_LENGTH}`}
                strokeLinecap="round"
              />

              {/* NEEDLE */}
              <g transform={`rotate(${rotation}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="38"
                  stroke="white"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="#374151"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="9" fill="white" />
                <circle cx="100" cy="100" r="6" fill="#374151" />
              </g>
            </svg>

            {/* CENTER VALUE */}
            <div
              className="position-absolute text-center"
              style={{
                top: "-30%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`display-5 fw-bold ${getColorClass(label)}`}
                style={{ lineHeight: "1" }}
              >
                {score}
              </div>
              <div className={`${getColorClass(label)} fs-6 mt-1`}>
                {label}
              </div>
            </div>

            {/* LEFT / RIGHT LABELS */}
            <div
              className="gauge-labels position-absolute w-100 d-flex justify-content-between px-3"
              style={{ bottom: "-40px" }}
            >
              <div className="text-center">
                <div className="small fw-medium" style={{ color: "var(--ms-text-main)" }}>
                  0
                </div>
                <div className="text-danger extremely-small">Extreme Fear</div>
              </div>

              <div className="text-center">
                <div className="small fw-medium" style={{ color: "var(--ms-text-main)" }}>
                  100
                </div>
                <div className="text-success extremely-small">Extreme Greed</div>
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div
            className="sentiment-history ps-3 border-start d-flex flex-column justify-content-center"
            style={{
              minWidth: "110px",
              maxWidth: "110px",
              borderColor: "var(--border-color)",
            }}
          >
            {history.map((h, i) => (
              <div className="mb-3" key={i}>
                <div className="text-muted extremely-small mb-1">
                  {h.time}
                </div>
                <div className={`${getColorClass(h.label)} small fw-medium`}>
                  {h.score} {h.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallMarketSentiment;
export const ChartProprties =  {
      width: 1200,
      height: 400,

      layout: {
        background: { type: "solid", color: "#0f172a" },
        textColor: "#cbd5e1",
        fontSize: 12,
        fontFamily: "Inter, sans-serif",
      },

      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#334155",
        fixLeftEdge: true,
        fixRightEdge: true,
      },

      rightPriceScale: {
        borderColor: "#334155",
        scaleMargins: { top: 0.2, bottom: 0.2 },
      },

      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },

      crosshair: {
        mode: 1,
        vertLine: { color: "#64748b" },
        horzLine: { color: "#64748b" },
      },
    };
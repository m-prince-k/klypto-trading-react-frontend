import { useEffect, useState } from "react";
export const ChartProprties = {
  width: 1200,
  height: 400,

  layout: {
    background: { type: "solid", color: "#fff" },
    textColor: "#334155",
    fontSize: 12,
    fontFamily: "Inter, sans-serif",
  },

  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    borderColor: "#cbd5e1",
    fixLeftEdge: true,
    fixRightEdge: true,
  },

  rightPriceScale: {
    borderColor: "#cbd5e1",
    scaleMargins: { top: 0.2, bottom: 0.2 },
  },

  grid: {
    vertLines: { color: "#cbd5e1" },
    horzLines: { color: "#cbd5e1" },
  },

  crosshair: {
    mode: 1,
    vertLine: { color: "#64748b" },
    horzLine: { color: "#64748b" },
  },
};

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after a delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if the value changes again within the delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Rerun effect if value or delay changes

  return debouncedValue;
}

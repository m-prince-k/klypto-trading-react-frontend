import { useEffect, useRef } from "react";
import { LineSeries } from "lightweight-charts";

export default function ZIGZAGPlot({
  result,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart,
  indicatorConfigs,
}) {
  const labelLayerRef = useRef(null);
  const seriesRef = useRef(null);
  const prevStyleRef = useRef({});

  const getChart = () => chart?.current || chart;

  const createLabelLayer = () => {
    const chartInstance = getChart();
    if (!chartInstance) return null;

    const container =
      chartInstance?.chartElement?.() ||
      chartInstance?.container ||
      document.querySelector("#tv-chart");

    let layer = container?.querySelector("#zigzag-labels");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "zigzag-labels";
      layer.style.position = "absolute";
      layer.style.top = 0;
      layer.style.left = 0;
      layer.style.pointerEvents = "none";
      layer.style.zIndex = 10;
      container.appendChild(layer);
    }
    return layer;
  };

  const renderLabels = (series, pivotData) => {
    const chartInstance = getChart();
    const layer = labelLayerRef.current;
    if (!chartInstance?.timeScale || !series || !layer) return;

    layer.innerHTML = "";
    pivotData.forEach((p) => {
      const y = series.priceToCoordinate(p.price);
      const x = chartInstance.timeScale().timeToCoordinate(p.time);
      if (x == null || y == null) return;

      const isHigh = p.type === "high";
      const el = document.createElement("div");

      el.style.position = "absolute";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = isHigh
        ? "translate(-50%, -110%)"
        : "translate(-50%, 10%)";
      el.style.background = isHigh ? "#16a34a" : "#dc2626";
      el.style.color = "#fff";
      el.style.fontSize = "11px";
      el.style.padding = "4px 6px";
      el.style.borderRadius = "4px";
      el.style.textAlign = "center";
      el.innerHTML = `
        <div style="font-weight:600">${p.price?.toFixed(2)}</div>
        <div>(${p.change > 0 ? "+" : ""}${p.change?.toFixed(2)})</div>
        <div style="font-size:10px">${(p.volume / 1e6)?.toFixed(2)}M</div>
      `;
      layer.appendChild(el);
    });
  };

  // ================= MAIN PLOTTING =================
  useEffect(() => {
    if (!result?.data) return;

    const zigzagData = result.data.zigzagLine ?? [];
    const pivotData = result.data.paneLabels ?? [];
    const style = indicatorStyle?.ZIGZAG?.z;

    if (!seriesRef.current) {
      seriesRef.current = addSeries("ZIGZAG", LineSeries, {
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle ?? 0,
        visible: style.visible ?? true,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
      });

      indicatorSeriesRef.current.ZIGZAG = {
        zigzagLine: seriesRef.current,
        data: zigzagData,
        pivotData,
      };
    }

    // Set data
    seriesRef.current.setData(zigzagData);

    // Create labels
    labelLayerRef.current = createLabelLayer();
    renderLabels(seriesRef.current, pivotData);

    // Subscribe to chart pan/zoom
    const chartInstance = getChart();
    const handleUpdate = () => renderLabels(seriesRef.current, pivotData);
    chartInstance?.timeScale?.()?.subscribeVisibleTimeRangeChange(handleUpdate);

    return () => {
      chartInstance
        ?.timeScale?.()
        ?.unsubscribeVisibleTimeRangeChange(handleUpdate);
    };
  }, [result]);

  // ================= LIVE STYLE UPDATE =================
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    const style = indicatorStyle?.ZIGZAG?.z || {};
    const prevStyle = prevStyleRef.current || {};

    // Only update if any option changed
    if (
      prevStyle.color !== style.color ||
      prevStyle.width !== style.width ||
      prevStyle.lineStyle !== style.lineStyle ||
      prevStyle.visible !== style.visible
    ) {
      series.applyOptions({
        color: style.color,
        lineWidth: style.width,
        lineStyle: style.lineStyle ?? 0,
        visible: style.visible ?? true,
      });

      prevStyleRef.current = { ...style };
    }
  }, [
    indicatorStyle?.ZIGZAG?.z?.color,
    indicatorStyle?.ZIGZAG?.z?.width,
    indicatorStyle?.ZIGZAG?.z?.lineStyle,
    indicatorStyle?.ZIGZAG?.z?.visible,
  ]);

  return null;
}
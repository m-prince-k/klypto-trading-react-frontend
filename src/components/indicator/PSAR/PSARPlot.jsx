import { useEffect } from "react";
import { LineSeries, createSeriesMarkers } from "lightweight-charts";

export default function PSARPlot({
  indicator,
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
  chart
}) {
  useEffect(() => {
    const psarData = result?.data ?? [];
    if (!psarData.length) return;

    /* remove previous PSAR series */
    if (indicatorSeriesRef.current?.[indicator]) {
      Object.values(indicatorSeriesRef.current[indicator]).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
            try { chart.removeSeries(s); } catch {}
          } catch {}
        }
      });
      indicatorSeriesRef.current[indicator] = null;
    }

    const groupedSeries = {};
    const rowConfig = rows?.find((r) => r.key === "psar");
    const styleConfig = indicatorStyle?.[indicator]?.psar;

    /* Hidden line series */
    const psarSeries = addSeries(indicator, LineSeries, {
      color: "rgba(41,98,255,0)",
      lineWidth: 0, // hide line
      visible: styleConfig?.visible ?? true,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    if (!psarSeries) return;

    psarSeries.setData(psarData.map((p) => ({ time: p.time, value: p.value })));

    /* Create markers based on trend */
    const markers = psarData.map((p) => ({
      time: p.time,
      position: p.trend === "up" ? "belowBar" : "aboveBar",
      shape: "circle",
      color: "rgba(41,98,255,1)",
      size: 0.3, // visible dot
    }));

    createSeriesMarkers(psarSeries, markers);

    groupedSeries.psar = psarSeries;
    groupedSeries.psarData = psarData;
    indicatorSeriesRef.current[indicator] = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */
  useEffect(() => {
    const psarGroup = indicatorSeriesRef.current?.[indicator];
    if (!psarGroup) return;

    const styleConfig = indicatorStyle?.[indicator]?.psar;
    if (psarGroup.psar) {
      psarGroup.psar.applyOptions({
        visible: styleConfig?.visible,
        color: styleConfig?.color,
        lineWidth: 1, // :point_left: thin line
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const markers = psarGroup.psarData.map((p) => ({
        time: p.time,
        position: p.trend === "up" ? "belowBar" : "aboveBar",
        shape: "circle",
        color: p.trend === "up" ? "rgba(22,163,74,1)" : "rgba(239,68,68,1)",
        size: 0.3,
      }));

      createSeriesMarkers(psarGroup.psar, markers);
    }
  }, [indicatorStyle]);

  return null;
}

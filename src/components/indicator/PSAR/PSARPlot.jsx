import { useEffect } from "react";
import { LineSeries, createSeriesMarkers } from "lightweight-charts";

export default function PSARPlot({
  result,
  rows,
  indicatorStyle,
  indicatorSeriesRef,
  addSeries,
}) {
  useEffect(() => {
    const psarData = result?.data ?? [];
    if (!psarData.length) return;

    /* remove previous PSAR series */
    if (indicatorSeriesRef.current?.PSAR) {
      Object.values(indicatorSeriesRef.current.PSAR).forEach((s) => {
        if (s?.setData) {
          try {
            s.setData([]);
          } catch {}
        }
      });
      indicatorSeriesRef.current.PSAR = null;
    }

    const groupedSeries = {};
    const rowConfig = rows?.find((r) => r.key === "psar");
    const styleConfig = indicatorStyle?.PSAR?.psar;

    /* Hidden line series */
    const psarSeries = addSeries("PSAR", LineSeries, {
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
    indicatorSeriesRef.current.PSAR = groupedSeries;
  }, [result]);

  /* ================= STYLE UPDATE ================= */
  useEffect(() => {
    const psarGroup = indicatorSeriesRef.current?.PSAR;
    if (!psarGroup) return;

    const styleConfig = indicatorStyle?.PSAR?.psar;
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

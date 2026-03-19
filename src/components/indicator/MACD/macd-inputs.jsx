export default function MACDInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= MACD ================= */

  const macdData = rows
    .filter((d) => d.macd != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.macd),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= SIGNAL ================= */

  const signalData = rows
    .filter((d) => d.signal != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.signal),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= HISTOGRAM ================= */

  const histogramData = rows
    .filter((d) => d.histogram != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.histogram),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.MACD;

  if (!series) return;

  /* ================= UPDATE SERIES ================= */

  series.macd?.setData(macdData);
  series.signal?.setData(signalData);

  /* 🔥 Histogram with dynamic color */
  series.histogram?.setData(
    histogramData.map((d) => ({
      ...d,
      color: d.value >= 0
        ? "rgba(38,166,154,1)"   // green
        : "rgba(239,83,80,1)", // red
    }))
  );

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.MACD = {
    macd: macdData[macdData.length - 1]?.value ?? null,
    signal: signalData[signalData.length - 1]?.value ?? null,
    histogram: histogramData[histogramData.length - 1]?.value ?? null,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.MACD.result = {
    data: {
      macd: macdData,
      signal: signalData,
      histogram: histogramData,
    },
  };
}
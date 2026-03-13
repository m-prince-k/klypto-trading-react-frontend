export default function EMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= EMA ================= */

  const emaData = rows
    .filter((d) => d.ema != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.ema),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= SMOOTHING MA ================= */

  const smoothingData = rows
    .filter((d) => d.smoothingMA != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.smoothingMA),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.EMA;

  if (!series) return;

  /* ================= UPDATE EMA ================= */

  series.ema?.setData(emaData);

  /* ================= UPDATE SMOOTHING ================= */

  if (maType !== "none") {
    series.smoothingMA?.setData(smoothingData);

    latestIndicatorValuesRef.current.EMA.smoothingMA =
      smoothingData[smoothingData.length - 1]?.value;

  } else {

    /* clear smoothing line */

    series.smoothingMA?.setData([]);

    latestIndicatorValuesRef.current.EMA.smoothingMA = null;
  }

  /* ================= UPDATE HOVER VALUES ================= */

  latestIndicatorValuesRef.current.EMA.ema =
    emaData[emaData.length - 1]?.value;

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.EMA.result = {
    data: {
      ema: emaData,
      smoothingMA: maType !== "none" ? smoothingData : [],
    },
  };
}
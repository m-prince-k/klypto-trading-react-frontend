export default function WMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= WMA ================= */

  const wmaData = rows
    .filter((d) => d.wma != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.wma),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.[indicator];

  if (!series) return;

  /* ================= UPDATE WMA ================= */

  series.wma?.setData(wmaData);

  /* ================= UPDATE HOVER VALUES ================= */

  latestIndicatorValuesRef.current[indicator] = {
    wma: wmaData[wmaData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current[indicator].result = {
    data: {
      wma: wmaData,
    },
  };
}
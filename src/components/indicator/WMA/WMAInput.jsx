export default function WMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= WMA ================= */

  const wmaData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.WMA;

  if (!series) return;

  /* ================= UPDATE WMA ================= */

  series.wma?.setData(wmaData);

  /* ================= UPDATE HOVER VALUES ================= */

  latestIndicatorValuesRef.current.WMA = {
    wma: wmaData[wmaData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.WMA.result = {
    data: {
      wma: wmaData,
    },
  };
}
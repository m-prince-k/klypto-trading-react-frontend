export default function HMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= HMA ================= */

  const hmaData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.HMA;

  if (!series) return;

  /* ================= UPDATE HMA ================= */

  series.hma?.setData(hmaData);

  /* ================= UPDATE HOVER VALUES ================= */

  latestIndicatorValuesRef.current.HMA = {
    hma: hmaData[hmaData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.HMA.result = {
    data: {
      hma: hmaData,
    },
  };
}
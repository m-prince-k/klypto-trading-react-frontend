export default function PSARInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= PSAR ================= */

  const psarData = rows
    .filter((d) => d.sar != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.sar),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.[indicator];

  if (!series) return;

  /* ================= UPDATE PSAR ================= */

  series.psar?.setData(psarData);

  /* ================= UPDATE HOVER VALUE ================= */

  latestIndicatorValuesRef.current[indicator].psar =
    psarData[psarData.length - 1]?.value;

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current[indicator].result = {
    data: {
      psar: psarData,
    },
  };
}
export default function HMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= FORMAT DATA ================= */

  const hmaData = rows
    .filter((d) => d?.hma != null && d?.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.hma),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.[indicator];

  if (!series?.hma) return;

  /* ================= UPDATE SERIES ================= */

  series.hma.setData(hmaData);

  /* ================= UPDATE HOVER VALUE ================= */

  latestIndicatorValuesRef.current[indicator] = {
    hma: hmaData[hmaData.length - 1]?.value,
  };
}
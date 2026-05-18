export default function DEMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= FORMAT DATA ================= */

  const demaData = rows
    .filter((d) => d?.dema != null && d?.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.dema),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.[indicator];

  if (!series?.dema) return;

  /* ================= UPDATE SERIES ================= */

  series.dema.setData(demaData);

  /* ================= STORE HOVER VALUE ================= */

  latestIndicatorValuesRef.current[indicator] = {
    dema: demaData[demaData.length - 1]?.value,
  };
}
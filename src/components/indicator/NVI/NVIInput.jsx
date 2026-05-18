export default function NVIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const nviSeries = indicatorSeriesRef.current?.[indicator]?.nvi;
  const emaSeries = indicatorSeriesRef.current?.[indicator]?.nviEma;

  if (!nviSeries && !emaSeries) return;

  const nviData = rows
    .filter((d) => d.nvi != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.nvi),
    }));

  const emaData = rows
    .filter((d) => d.nviEma != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.nviEma),
    }));

  if (nviSeries) nviSeries.setData(nviData);
  if (emaSeries) emaSeries.setData(emaData);

  latestIndicatorValuesRef.current[indicator] = {
    nvi: nviData[nviData.length - 1]?.value ?? null,
    nviEma: emaData[emaData.length - 1]?.value ?? null,
  };
}

export default function CMOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = response?.data ?? [];

  const cmoSeries = indicatorSeriesRef.current?.[indicator]?.cmoLine;

  if (!cmoSeries) return;

  const cmoData = rows
    .filter((d) => d.cmo != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.cmo),
    }));

  cmoSeries.setData(cmoData);

  latestIndicatorValuesRef.current[indicator] = {
    cmo: cmoData[cmoData.length - 1]?.value ?? null,
  };
}

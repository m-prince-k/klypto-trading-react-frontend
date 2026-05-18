export default function CMFInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {

  const rows = Array.isArray(response?.data)
    ? response.data
    : [];

  const cmfSeries = indicatorSeriesRef.current?.[indicator]?.cmfLine;
  const zeroSeries = indicatorSeriesRef.current?.[indicator]?.zeroLine;

  if (!cmfSeries) return;

  const cmfData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }));

  const zeroValue =
    indicatorSeriesRef.current?.[indicator]?.zeroValue ?? 0;

  const zeroData = cmfData.map((p) => ({
    time: p.time,
    value: zeroValue,
  }));

  cmfSeries.setData(cmfData);

  if (zeroSeries) zeroSeries.setData(zeroData);

  latestIndicatorValuesRef.current[indicator] = {
    cmfLine: cmfData[cmfData.length - 1]?.value ?? null,
  };
}
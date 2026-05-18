export default function ATRInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const atrData = rows
    .filter((d) => d && d.atr != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.atr),
    }));

  const series = indicatorSeriesRef.current?.[indicator];
  if (!series) return;

  series.atr?.setData(atrData);

  latestIndicatorValuesRef.current[indicator] = {
    atr: atrData[atrData.length - 1]?.value,
  };

}
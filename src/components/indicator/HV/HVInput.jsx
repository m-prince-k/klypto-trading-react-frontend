export default function HVInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data)
    ? response.data
    : [];

  const hvSeries = indicatorSeriesRef.current?.HV?.hvLine;

  if (!hvSeries) return;

  const hvData = rows
    .filter((d) => d.historical_Vol != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.historical_Vol),
    }));

  hvSeries.setData(hvData);

  latestIndicatorValuesRef.current.HV = {
    hvLine: hvData[hvData.length - 1]?.value ?? null,
  };
}
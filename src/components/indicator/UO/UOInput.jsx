export default function UOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = Array.isArray(response?.data?.series)
    ? response.data.series
    : [];

  // Process Ultimate Oscillator data
  const uoData = rows
    .filter((d) => d.uo != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.uo),
    }));

  // Store in indicatorSeriesRef for the plotting component
  if (!indicatorSeriesRef.current[indicator]) {
    indicatorSeriesRef.current[indicator] = {};
  }

  indicatorSeriesRef.current[indicator].uoData = uoData;
  indicatorSeriesRef.current[indicator].result = { data: { uo: uoData } };

  // Store latest value
  latestIndicatorValuesRef.current[indicator] = {
    uo: uoData.length ? uoData[uoData.length - 1].value : null,
  };

  return uoData;
}
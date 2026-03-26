export default function UOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
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
  if (!indicatorSeriesRef.current.UO) {
    indicatorSeriesRef.current.UO = {};
  }

  indicatorSeriesRef.current.UO.uoData = uoData;
  indicatorSeriesRef.current.UO.result = { data: { uo: uoData } };

  // Store latest value
  latestIndicatorValuesRef.current.UO = {
    uo: uoData.length ? uoData[uoData.length - 1].value : null,
  };

  return uoData;
}
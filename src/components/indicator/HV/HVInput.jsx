export default function HVInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  // Ensure data exists
  const rows = Array.isArray(response?.data) ? response.data : [];

  // Map the rows to HV data
  const hvData = rows
    .filter((d) => d.historical_Vol != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.historical_Vol),
    }));

  // Store the processed data in indicatorSeriesRef for plotting
  indicatorSeriesRef.current[indicator] = {
    result: response,
    rows,
    hvData, // save the computed HV data for easy access
  };

  // Store the latest HV value for reference or overlays
  latestIndicatorValuesRef.current[indicator] = {
    hvLine: hvData.length ? hvData[hvData.length - 1].value : null,
  };

  return hvData;
}
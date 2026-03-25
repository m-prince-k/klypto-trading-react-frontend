export default function MACDInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  // Ensure rows exist
  const rows = Array.isArray(response?.data) ? response.data : [];

  // Prepare MACD line data
  const macdData = rows
    .filter((d) => d?.macd != null && d?.time != null)
    .map((d) => ({ time: d.time, value: Number(d.macd) }));

  // Prepare Signal line data
  const signalData = rows
    .filter((d) => d?.signal != null && d?.time != null)
    .map((d) => ({ time: d.time, value: Number(d.signal) }));

  // Prepare Histogram data
  const histogramData = rows
    .filter((d) => d?.hist != null && d?.time != null)
    .map((d) => ({ time: d.time, value: Number(d.hist) }));

  // Combine into result object
  const result = {
    data: {
      macd: macdData,
      signal: signalData,
      histogram: histogramData,
    },
  };

  // Store latest values for display / inputs
  latestIndicatorValuesRef.current.MACD = {
    macd: macdData[macdData.length - 1]?.value ?? null,
    signal: signalData[signalData.length - 1]?.value ?? null,
    histogram: histogramData[histogramData.length - 1]?.value ?? null,
  };

  // Store only the data and rows, NOT the series
  // The plot component (MACDPlot) will handle series creation & updates
  indicatorSeriesRef.current.MACD = {
    result,
    rows,
  };

  return result;
}
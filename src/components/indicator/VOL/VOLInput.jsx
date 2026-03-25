export default function VOLInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  // Ensure rows exist
  const rows = Array.isArray(response?.data) ? response.data : [];

  // Prepare Volume bars data
  const volumeData = rows
    .filter((d) => d?.volume != null && d?.time != null)
    .map((d) => ({ time: d.time, value: Number(d.volume) }));

  // Prepare Volume MA line data
  const volumeMAData = rows
    .filter((d) => d?.volumeMA != null && d?.time != null)
    .map((d) => ({ time: d.time, value: Number(d.volumeMA) }));

  // Combine into result object
  const result = {
    data: {
      volume: volumeData,
      volumeMA: volumeMAData,
    },
  };

  // Store latest values for inputs
  latestIndicatorValuesRef.current.VOL = {
    volume: volumeData[volumeData.length - 1]?.value ?? null,
    volumeMA: volumeMAData[volumeMAData.length - 1]?.value ?? null,
  };

  // Store only the data and rows
  // The plot component (VOLPlot) will handle series creation & updates
  indicatorSeriesRef.current.VOL = {
    result,
    rows,
  };

  return result;
}
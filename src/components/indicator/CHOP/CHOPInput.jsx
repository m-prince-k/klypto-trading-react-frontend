export default function CHOPInput(response, indicatorSeriesRef, latestIndicatorValuesRef) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const chopLineData = rows
    .filter((d) => d.chop != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.chop) }));

  const series = indicatorSeriesRef.current?.CHOP;
  if (!series) return;

  // Only update the CHOP line data, DO NOT overwrite the whole result
  series.chopLine?.setData(chopLineData);

  // Store latest CHOP line value
  latestIndicatorValuesRef.current.CHOP = {
    chopLine: chopLineData[chopLineData.length - 1]?.value ?? 50,
  };

  // Update the internal result data for CHOP line only
  if (!indicatorSeriesRef.current.CHOP.result) {
    indicatorSeriesRef.current.CHOP.result = { data: { chopLine: [] } };
  }
  indicatorSeriesRef.current.CHOP.result.data.chopLine = chopLineData;

  // Update chopData used by bands/bg fill
  series.chopData = chopLineData;
}
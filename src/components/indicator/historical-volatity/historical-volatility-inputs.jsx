export default function HistoricalVolatilityInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  if (!indicatorSeriesRef?.current || !latestIndicatorValuesRef?.current) {
    return;
  }

  const rows = Array.isArray(response?.data) ? response.data : [];

  const hvData = rows
    .filter(
      (d) =>
        (d.hv != null || d.historicalVolatility != null) &&
        d.time != null
    )
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.hv ?? d.historicalVolatility),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.HV;

  if (!series) return;

  series.hv?.setData(hvData);

  latestIndicatorValuesRef.current.HV = {
    hv: hvData[hvData.length - 1]?.value ?? null,
  };

  indicatorSeriesRef.current.HV.result = {
    data: {
      hv: hvData,
    },
  };
}
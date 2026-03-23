export default function HVInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  if (!indicatorSeriesRef?.current || !latestIndicatorValuesRef?.current) return;

  const rows = Array.isArray(response?.data) ? response.data : [];

  const hv = rows
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

  const hvSeries = indicatorSeriesRef.current?.HV;
  if (!hvSeries) return;

  hvSeries.hv?.setData(hv);

  latestIndicatorValuesRef.current.HV = {
    hv: hv[hv.length - 1]?.value ?? null,
  };

  indicatorSeriesRef.current.HV.result = {
    data: { hv },
  };
}
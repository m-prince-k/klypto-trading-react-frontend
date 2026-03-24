export default function HVInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
<<<<<<< HEAD
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
=======

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
>>>>>>> 74d4aff7095b3a6b6130baf32d081d88ad4573a8
  };
}
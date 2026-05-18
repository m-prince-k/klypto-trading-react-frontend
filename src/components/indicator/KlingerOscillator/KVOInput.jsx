export default function KVOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const kvoSeries = indicatorSeriesRef.current?.[indicator]?.kvoLine;
  const signalSeries = indicatorSeriesRef.current?.[indicator]?.signalLine;
  const zeroSeries = indicatorSeriesRef.current?.[indicator]?.zeroLine;

  if (!kvoSeries || !signalSeries) return;

  const kvoData = rows
    .filter((d) => d.kvo != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.kvo),
    }));

  const signalData = rows
    .filter((d) => d.signal != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.signal),
    }));

  const zeroValue = indicatorSeriesRef.current?.[indicator]?.zeroValue ?? 0;

  const zeroData = kvoData.map((p) => ({
    time: p.time,
    value: zeroValue,
  }));

  kvoSeries.setData(kvoData);
  signalSeries.setData(signalData);
  if (zeroSeries) zeroSeries.setData(zeroData);

  latestIndicatorValuesRef.current[indicator] = {
    kvo: kvoData[kvoData.length - 1]?.value ?? null,
    signal: signalData[signalData.length - 1]?.value ?? null,
  };
}

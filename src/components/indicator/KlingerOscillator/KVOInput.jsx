export default function KVOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const kvoSeries = indicatorSeriesRef.current?.KVO?.kvoLine;
  const signalSeries = indicatorSeriesRef.current?.KVO?.signalLine;
  const zeroSeries = indicatorSeriesRef.current?.KVO?.zeroLine;

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

  const zeroValue = indicatorSeriesRef.current?.KVO?.zeroValue ?? 0;

  const zeroData = kvoData.map((p) => ({
    time: p.time,
    value: zeroValue,
  }));

  kvoSeries.setData(kvoData);
  signalSeries.setData(signalData);
  if (zeroSeries) zeroSeries.setData(zeroData);

  latestIndicatorValuesRef.current.KVO = {
    kvo: kvoData[kvoData.length - 1]?.value ?? null,
    signal: signalData[signalData.length - 1]?.value ?? null,
  };
}

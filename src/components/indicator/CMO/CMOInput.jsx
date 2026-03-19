export default function CMOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data)
    ? response.data
    : [];

  const cmoSeries = indicatorSeriesRef.current?.CMO?.cmoLine;
  const zeroSeries = indicatorSeriesRef.current?.CMO?.zeroLine;

  if (!cmoSeries) return;

  const cmoData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }));

  const zeroValue =
    indicatorSeriesRef.current?.CMO?.zeroValue ?? 0;

  const zeroData = cmoData.map((p) => ({
    time: p.time,
    value: zeroValue,
  }));

  cmoSeries.setData(cmoData);

  if (zeroSeries) zeroSeries.setData(zeroData);

  latestIndicatorValuesRef.current.CMO = {
    cmoLine: cmoData[cmoData.length - 1]?.value ?? null,
  };
}
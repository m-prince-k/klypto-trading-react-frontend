export default function CMOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
) {
  const rows = response?.data ?? [];

  const cmoSeries = indicatorSeriesRef.current?.CMO?.cmoLine;

  if (!cmoSeries) return;

  const cmoData = rows
    .filter((d) => d.cmo != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.cmo),
    }));

  cmoSeries.setData(cmoData);

  latestIndicatorValuesRef.current.CMO = {
    cmo: cmoData[cmoData.length - 1]?.value ?? null,
  };
}

export default function UOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
) {
  const rows = Array.isArray(response?.data?.series)
    ? response.data.series
    : [];

  const series = indicatorSeriesRef.current?.UO?.uoLine;
  if (!series) return;

  const uoData = rows.map((d) => ({
    time: Number(d.time),
    value: Number(d.uo),
  }));

  series.setData([]);
  series.setData(uoData);

  latestIndicatorValuesRef.current.UO = {
    uo: uoData[uoData.length - 1]?.value ?? null,
  };
}

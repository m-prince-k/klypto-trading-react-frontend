export default function TRIXInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data)
    ? response.data
    : [];

  const trixSeries = indicatorSeriesRef.current?.TRIX?.trixLine;
  const zeroSeries = indicatorSeriesRef.current?.TRIX?.zeroLine;

  if (!trixSeries) return;

  const trixData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }));

  const zeroValue =
    indicatorSeriesRef.current?.TRIX?.zeroValue ?? 0;

  const zeroData = trixData.map((p) => ({
    time: p.time,
    value: zeroValue,
  }));

  trixSeries.setData(trixData);

  if (zeroSeries) zeroSeries.setData(zeroData);

  latestIndicatorValuesRef.current.TRIX = {
    trixLine: trixData[trixData.length - 1]?.value ?? null,
  };
}
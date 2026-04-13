export default function TMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const group = indicatorSeriesRef.current?.TMA;
  if (!group) return;

  const tmaData =
    response?.data
      ?.filter((d) => d.tma != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.tma),
      })) ?? [];

  group.tmaLine?.setData(tmaData);

  latestIndicatorValuesRef.current.TMA = {
    tma: tmaData[tmaData.length - 1]?.value ?? null,
  };
}
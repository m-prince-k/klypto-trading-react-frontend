export default function TMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const group = indicatorSeriesRef.current?.[indicator];
  if (!group) return;

  const tmaData =
    response?.data
      ?.filter((d) => d.tma != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.tma),
      })) ?? [];

  group.tmaLine?.setData(tmaData);

  latestIndicatorValuesRef.current[indicator] = {
    tma: tmaData[tmaData.length - 1]?.value ?? null,
  };
}
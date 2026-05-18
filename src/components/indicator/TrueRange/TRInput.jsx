export default function TRInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const group = indicatorSeriesRef.current?.[indicator];
  if (!group) return;

  const trData =
    response?.data
      ?.filter((d) => d.trueRange != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.trueRange),
      })) ?? [];

  group.trLine?.setData(trData);

  latestIndicatorValuesRef.current[indicator] = {
    tr: trData[trData.length - 1]?.value ?? null,
  };
}
export default function BBPERBInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const group = indicatorSeriesRef.current?.[indicator];
  if (!group) return;

  const percentBData =
    response?.data
      ?.filter((d) => d.percentB != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.percentB),
      })) ?? [];

  group.percentB?.setData(percentBData);

  latestIndicatorValuesRef.current[indicator] = {
    percentB: percentBData[percentBData.length - 1]?.value ?? null,
  };
}
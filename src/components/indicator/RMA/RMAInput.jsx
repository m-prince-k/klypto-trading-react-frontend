export default function RMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const group = indicatorSeriesRef.current?.[indicator];
  if (!group) return;

  const rmaData =
    response?.data
      ?.filter((d) => d.rma != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.rma),
      })) ?? [];

  group.rmaLine?.setData(rmaData);

  latestIndicatorValuesRef.current[indicator] = {
    rma: rmaData[rmaData.length - 1]?.value ?? null,
  };
}
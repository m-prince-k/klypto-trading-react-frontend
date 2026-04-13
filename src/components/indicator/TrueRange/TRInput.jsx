export default function TRInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const group = indicatorSeriesRef.current?.TR;
  if (!group) return;

  const trData =
    response?.data
      ?.filter((d) => d.trueRange != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.trueRange),
      })) ?? [];

  group.trLine?.setData(trData);

  latestIndicatorValuesRef.current.TR = {
    tr: trData[trData.length - 1]?.value ?? null,
  };
}
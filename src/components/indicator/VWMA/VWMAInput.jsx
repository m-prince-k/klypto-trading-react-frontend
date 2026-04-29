export default function VWMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const group = indicatorSeriesRef.current?.VWMA;
  if (!group) return;

  const vwmaData =
    response?.data
      ?.filter((d) => d.vwma != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.vwma),
      })) ?? [];

  group.vwmaLine?.setData(vwmaData);

  latestIndicatorValuesRef.current.VWMA = {
    vwma: vwmaData[vwmaData.length - 1]?.value ?? null,
  };
}
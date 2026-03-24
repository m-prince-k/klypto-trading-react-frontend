export default function BBWInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const group = indicatorSeriesRef.current?.BBW;
  if (!group) return;

  const bbwData =
    response?.data
      ?.filter((d) => d.bbw != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.bbw),
      })) ?? [];

  group.bbwLine?.setData(bbwData);

  latestIndicatorValuesRef.current.BBW = {
    bbw: bbwData[bbwData.length - 1]?.value ?? null,
  };
}
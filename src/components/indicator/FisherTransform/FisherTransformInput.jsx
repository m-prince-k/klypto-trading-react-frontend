export default function FTInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data?.candles)
    ? response.data.candles
    : [];

  const fisherSeries = indicatorSeriesRef.current?.FT?.fisherLine;
  const triggerSeries = indicatorSeriesRef.current?.FT?.triggerLine;

  if (!fisherSeries && !triggerSeries) return;

  const fisherData = rows
    .filter((d) => d.fish != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.fish),
    }));

  const triggerData = rows
    .filter((d) => d.trigger != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.trigger),
    }));

  if (fisherSeries) fisherSeries.setData(fisherData);
  if (triggerSeries) triggerSeries.setData(triggerData);

  latestIndicatorValuesRef.current.FT = {
    fisherLine: fisherData[fisherData.length - 1]?.value ?? null,
    triggerLine: triggerData[triggerData.length - 1]?.value ?? null,
  };
}
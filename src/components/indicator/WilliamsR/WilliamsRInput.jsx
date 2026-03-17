export default function WilliamsRInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = response?.data?.candles ?? [];

  
  const rData = rows
    .filter((d) => d.percentR != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.percentR),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.["WilliamsR"];
  if (!series) return;

  series.r?.setData(rData);

  latestIndicatorValuesRef.current["WilliamsR"] = {
    r: rData[rData.length - 1]?.value,
  };

  indicatorSeriesRef.current["WilliamsR"].result = {
    data: { r: rData },
  };
}
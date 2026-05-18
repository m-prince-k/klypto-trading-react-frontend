export default function ADXInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const adxData = rows
    .filter((d) => d.adx != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.adx),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.[indicator];
  if (!series) return;

  series.adx?.setData(adxData);

  latestIndicatorValuesRef.current[indicator] = {
    adx: adxData[adxData.length - 1]?.value,
  };

  indicatorSeriesRef.current[indicator].result = {
    data: {
      adx: adxData,
    },
  };

}
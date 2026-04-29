export default function AWOInput(response, indicatorSeriesRef, latestIndicatorValuesRef) {
  const rows = Array.isArray(response?.data?.series) ? response.data.series : [];

  const awoData = rows
    .filter((d) => d.ao != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.ao),
    }));

  // Store processed data in indicatorSeriesRef for plotting
  indicatorSeriesRef.current.AWO = {
    ...(indicatorSeriesRef.current.AWO || {}),
    result: response,
    awoData,
  };

  // Store latest value
  latestIndicatorValuesRef.current.AWO = {
    awo: awoData.length ? awoData[awoData.length - 1].value : null,
  };

  return awoData;
}
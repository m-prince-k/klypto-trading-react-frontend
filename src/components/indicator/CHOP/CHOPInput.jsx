export default function CHOPInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const chopData = rows
    .filter((d) => d?.chop != null && d?.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.chop),
    }))
    .sort((a, b) => a.time - b.time);

  return {
    type: "multi",
    data: {
      chopLine: chopData,
    },
  };
}
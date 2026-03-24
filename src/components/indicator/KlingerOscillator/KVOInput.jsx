export default function KVOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const koData = rows
    .filter((d) => d.ko != null && d.time != null)
    .map((d) => ({
      time: d.time,
      value: d.ko,
    }))
    .sort((a, b) => a.time - b.time);

  const signalData = rows
    .filter((d) => d.signal != null && d.time != null)
    .map((d) => ({
      time: d.time,
      value: d.signal,
    }))
    .sort((a, b) => a.time - b.time);


  const result = {
    type: "multi",
    data: {
      ko: koData,
      signal: signalData,
    },
  };

  /* UPDATE CROSSHAIR VALUES */

  latestIndicatorValuesRef.current.KO = {
    ko: koData.length ? koData[koData.length - 1]?.value : null,
    signal: signalData.length ? signalData[signalData.length - 1]?.value : null,
  };

  return result;
}
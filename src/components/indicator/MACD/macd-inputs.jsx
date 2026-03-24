export default function MACDInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const macdData = rows
    .filter((d) => d?.macd != null && d?.time != null)
    .map((d) => ({
      time: d.time,
      value: Number(d.macd),
    }));

  const signalData = rows
    .filter((d) => d?.signal != null && d?.time != null)
    .map((d) => ({
      time: d.time,
      value: Number(d.signal),
    }));

  const histogramData = rows
    .filter((d) => d?.hist != null && d?.time != null)
    .map((d) => ({
      time: d.time,
      value: Number(d.hist),
      color:
        d?.histColor ??
        (Number(d.hist) >= 0
          ? "rgba(38,166,154,1)"
          : "rgba(239,83,80,1)"),
    }));


  const result = {
    data: {
      macd: macdData,
      signal: signalData,
      histogram: histogramData,
    },
  };

  /* store latest values */

  latestIndicatorValuesRef.current.MACD = {
    macd: macdData[macdData.length - 1]?.value ?? null,
    signal: signalData[signalData.length - 1]?.value ?? null,
    histogram: histogramData[histogramData.length - 1]?.value ?? null,
  };

  indicatorSeriesRef.current.MACD = {
    result,
    rows,
  };

  return result;
}
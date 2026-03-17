export default function CCIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const cciData = rows
    .filter((d) => d.cci != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.cci) }))
    .sort((a, b) => a.time - b.time);

  const cciMa = rows
    .filter((d) => d.smoothingMA != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.smoothingMA) }))
    .sort((a, b) => a.time - b.time);

  // Ensure CCI series object exists
  if (!indicatorSeriesRef.current.CCI) {
    indicatorSeriesRef.current.CCI = {
      cciLine: null,
      cciMa: null,
      upperBand: null,
      middleBand: null,
      lowerBand: null,
      bgFill: null,
      result: null,
    };
  }

  const series = indicatorSeriesRef.current.CCI;

  // Update series data if lines exist
  series.cciLine?.setData(cciData);
  series.cciMa?.setData(cciMa);

  // Update hover/latest values
  latestIndicatorValuesRef.current.CCI = {
    cciLine: cciData[cciData.length - 1]?.value,
    cciMa: cciMa[cciMa.length - 1]?.value,
  };

  // Store result data
  series.result = {
    data: {
      cciLine: cciData,
      cciMa: cciMa,
    },
  };
}
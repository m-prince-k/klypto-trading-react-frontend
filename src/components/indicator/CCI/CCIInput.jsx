export default function CCIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const cciData = rows
    .filter((d) => d.cci != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.cci),
    }))
    .sort((a, b) => a.time - b.time);

  const cciMa = rows
    .filter((d) => d.cciMA != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.cciMA),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.CCI;
  if (!series) return;

  series.cciLine?.setData(cciData);
  series.cciMa?.setData(cciMa);

  latestIndicatorValuesRef.current.CCI = {
    cciLine: cciData[cciData.length - 1]?.value,
    cciMa: cciMa[cciMa.length - 1]?.value,
  };

  indicatorSeriesRef.current.CCI.result = {
    data: {
      cciLine: cciData,
      cciMa: cciMa,
    },
  };

}
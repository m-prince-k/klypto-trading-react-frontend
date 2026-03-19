export default function PVOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const pvoData = rows
    .filter((d) => d.pvo != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.pvo) }))
    .sort((a, b) => a.time - b.time);

  const signalData = rows
    .filter((d) => d.signal != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.signal) }))
    .sort((a, b) => a.time - b.time);

  const histData = rows
    .filter((d) => d.hist != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.hist) }))
    .sort((a, b) => a.time - b.time);

  if (!pvoData.length) return;

  const series = indicatorSeriesRef.current?.PVO;

  if (!series) return;

  series.pvo?.setData(pvoData);
  series.signal?.setData(signalData);
  series.hist?.setData(histData);

  latestIndicatorValuesRef.current.PVO = {
    pvo: pvoData[pvoData.length - 1]?.value,
    signal: signalData[signalData.length - 1]?.value,
    hist: histData[histData.length - 1]?.value,
  };

  indicatorSeriesRef.current.PVO.result = {
    data: { pvo: pvoData, signal: signalData, hist: histData },
  };
}
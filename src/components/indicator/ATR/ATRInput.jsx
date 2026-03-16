export default function ATRInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= MAP ATR ================= */

  const atrData = rows
    .filter((d) => d && d.time != null && d.atr != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.atr),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.ATR;
  if (!series) return;

  /* ================= SET DATA ================= */

  series.atr?.setData(atrData);

  /* ================= LATEST VALUE ================= */

  latestIndicatorValuesRef.current.ATR = {
    atr: atrData[atrData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.ATR.result = {
    data: {
      atr: atrData,
    },
  };

}
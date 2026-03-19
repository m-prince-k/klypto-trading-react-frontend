export default function VWAPInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= VWAP ================= */

  const vwapData = rows
    .filter((d) => d.vwap != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.vwap),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.VWAP;

  if (!series) return;

  /* ================= UPDATE VWAP ================= */

  series.vwap?.setData(vwapData);

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.VWAP = {
    vwap: vwapData[vwapData.length - 1]?.value ?? null,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.VWAP.result = {
    data: {
      vwap: vwapData,
    },
  };
}
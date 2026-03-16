export default function MomentumInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= MOMENTUM ================= */

  const momentumData = rows
    .filter((d) => d.momentum != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.momentum),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.Momentum;

  if (!series) return;

  /* ================= UPDATE MOMENTUM ================= */

  series.momentum?.setData(momentumData);

  /* ================= UPDATE HOVER VALUES ================= */

  latestIndicatorValuesRef.current.Momentum.momentum =
    momentumData[momentumData.length - 1]?.value;

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.Momentum.result = {
    data: {
      momentum: momentumData,
    },
  };
}
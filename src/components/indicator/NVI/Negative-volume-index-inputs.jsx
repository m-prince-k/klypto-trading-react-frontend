export default function NVIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= NVI ================= */

  const nviData = rows
    .filter((d) => d.nvi != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.nvi),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.NVI;

  if (!series) return;

  /* ================= UPDATE SERIES ================= */

  series.nvi?.setData(nviData);

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.NVI = {
    nvi: nviData[nviData.length - 1]?.value ?? null,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.NVI.result = {
    data: {
      nvi: nviData,
    },
  };
}
export default function KAMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= FORMAT DATA ================= */

  const kamaData = rows
    .filter((d) => d?.kama != null && d?.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.kama),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.KAMA;

  if (!series?.kama) return;

  /* ================= UPDATE SERIES ================= */

  series.kama.setData(kamaData);

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.KAMA = {
    kama: kamaData[kamaData.length - 1]?.value,
  };
}
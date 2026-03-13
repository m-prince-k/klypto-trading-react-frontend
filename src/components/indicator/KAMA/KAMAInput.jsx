export default function KAMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= KAMA ================= */

  const kamaData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.KAMA;

  if (!series) return;

  /* ================= UPDATE KAMA ================= */

  series.kama?.setData(kamaData);

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.KAMA = {
    kama: kamaData[kamaData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.KAMA.result = {
    data: {
      kama: kamaData,
    },
  };
}
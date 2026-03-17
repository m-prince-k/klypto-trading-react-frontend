export default function TEMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= TEMA ================= */

  const temaData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.TEMA;

  if (!series) return;

  /* ================= UPDATE TEMA ================= */

  series.tema?.setData(temaData);

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.TEMA = {
    tema: temaData[temaData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.TEMA.result = {
    data: {
      tema: temaData,
    },
  };
}
export default function DEMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= DEMA ================= */

  const demaData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.DEMA;

  if (!series) return;

  /* ================= UPDATE DEMA ================= */

  series.dema?.setData(demaData);

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.DEMA = {
    dema: demaData[demaData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.DEMA.result = {
    data: {
      dema: demaData,
    },
  };
}
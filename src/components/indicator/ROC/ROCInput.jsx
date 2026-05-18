export default function ROCInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= ROC DATA ================= */

  const rocData = rows
    .filter((d) => d.roc != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.roc),
    }))
    .sort((a, b) => a.time - b.time);


  const series = indicatorSeriesRef.current?.[indicator];
  if (!series) return;

  /* ================= UPDATE ROC ================= */

  series.roc?.setData(rocData);

  /* ================= UPDATE HOVER VALUES ================= */

  latestIndicatorValuesRef.current[indicator] = {
    roc: rocData[rocData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current[indicator].result = {
    data: {
      roc: rocData,
    },
  };
}
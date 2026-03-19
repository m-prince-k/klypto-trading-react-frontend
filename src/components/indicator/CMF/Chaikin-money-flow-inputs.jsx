export default function ChaikinMoneyFlowInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= CMF ================= */

  const cmfData = rows
    .filter((d) => d.cmf != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
      // cmf:Number(d.cmf)
    }))
    .sort((a, b) => a.time - b.time);


  const series = indicatorSeriesRef.current?.CMF;

  if (!series) return;

  /* ================= UPDATE SERIES ================= */

  series.cmf?.setData(cmfData);

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.CMF = {
    cmf: cmfData[cmfData.length - 1]?.value ?? null,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.CMF.result = {
    data: {
      cmf: cmfData,
    },
  };
}
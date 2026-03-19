export default function CMOInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const cmoData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  if (!cmoData.length) return;

  const series = indicatorSeriesRef.current?.CMO;

  if (!series?.cmo) return;

  /* UPDATE DATA */
  series.cmo.setData(cmoData);

  /* UPDATE HOVER */
  latestIndicatorValuesRef.current.CMO = {
    cmo: cmoData[cmoData.length - 1]?.value,
  };

  /* STORE */
  indicatorSeriesRef.current.CMO.result = {
    data: {
      cmo: cmoData,
    },
  };
}
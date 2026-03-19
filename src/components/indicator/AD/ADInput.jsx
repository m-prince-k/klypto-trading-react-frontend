export default function ADInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= AD ================= */

  const adData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  if (!adData.length) return;

  const series = indicatorSeriesRef.current?.AD;

  if (!series?.ad) return;

  /* UPDATE DATA */
  series.ad.setData(adData);

  /* UPDATE HOVER */
  latestIndicatorValuesRef.current.AD = {
    ad: adData[adData.length - 1]?.value,
  };

  /* STORE */
  indicatorSeriesRef.current.AD.result = {
    data: {
      ad: adData,
    },
  };
}
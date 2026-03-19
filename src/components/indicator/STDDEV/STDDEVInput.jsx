export default function ADInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const adData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.AD;
  if (!series) return;

  /* 🔥 UPDATE */
  series.ad?.setData(adData);

  /* 🔥 VALUES */
  latestIndicatorValuesRef.current.AD = {
    value: adData.at(-1)?.value,
  };

  /* 🔥 STORE */
  indicatorSeriesRef.current.AD.result = {
    data: adData,
  };
}
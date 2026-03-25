export default function ADInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const adData = rows
    .filter((d) => d.ad != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.ad) }));

  // Store in indicatorSeriesRef
  indicatorSeriesRef.current.AD = {
    result: response,
    rows,
  };

  // Store latest value
  latestIndicatorValuesRef.current.AD = {
    value: adData.at(-1)?.value,
  };

  return adData;
}

export default function STOCHInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const kData = rows
    .filter((d) => d?.k != null && d?.time != null)
    .map((d) => ({
      time: d.time,
      value: d.k,
    }));

  const dData = rows
    .filter((d) => d?.d != null && d?.time != null)
    .map((d) => ({
      time: d.time,
      value: d.d,
    }));

  if (kData.length) {
    latestIndicatorValuesRef.current.STOCH = {
      k: kData[kData.length - 1].value,
      d: dData[dData.length - 1]?.value ?? null,
    };
  }

  return {
    kData,
    dData,
    rows,
  };
}
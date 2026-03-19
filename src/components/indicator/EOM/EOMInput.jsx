export default function EOMInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const eomData = response?.data?.eom ?? [];

  if (!Array.isArray(eomData) || !eomData.length) return;

  const safeData = eomData.map((d) => ({
    time: Number(d.time),
    value: Number(d.value || 0) / 10000,
  }));

  const series = indicatorSeriesRef.current?.EOM;

  if (!series?.eom) return;

  series.eom.setData(safeData);

  latestIndicatorValuesRef.current.EOM = {
    eom: safeData[safeData.length - 1]?.value,
  };

  indicatorSeriesRef.current.EOM.result = {
    data: { eom: safeData },
  };
}
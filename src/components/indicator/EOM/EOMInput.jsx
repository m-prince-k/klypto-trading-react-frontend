export default function EOMInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const eomData = rows
    .filter((d) => d.eom != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.eom),
    }));

  const series = indicatorSeriesRef.current?.EOM;
  if (!series) return;

  series.setData(eomData);

  latestIndicatorValuesRef.current.EOM = {
    eom: eomData[eomData.length - 1]?.value ?? 0,
  };

  indicatorSeriesRef.current.EOM.result = eomData;
}
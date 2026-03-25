export default function VOLInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const volumeSeries = indicatorSeriesRef.current?.VOL?.volume;
  const maSeries = indicatorSeriesRef.current?.VOL?.volumeMA;

  if (!volumeSeries) return;

  const volumeData = rows.map((d) => ({
    time: Number(d.time),
    value: Number(d.volume),
    color: d.color || "#26A69A",
  }));

  const maData = rows
    .filter((d) => d.volumeMA != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.volumeMA),
    }));

  volumeSeries.setData(volumeData);
  if (maSeries) maSeries.setData(maData);

  latestIndicatorValuesRef.current.VOL = {
    volume: volumeData[volumeData.length - 1]?.value ?? null,
    volumeMA: maData[maData.length - 1]?.value ?? null,
  };
}

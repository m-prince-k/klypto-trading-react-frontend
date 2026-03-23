export default function VOLInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const group = indicatorSeriesRef.current?.VOL;
  if (!group) return;

  const volume =
    response?.data
      ?.filter((d) => d.volume != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.volume),
        color: d.color || "#26A69A",
      })) ?? [];

  const volumeMA =
    response?.data
      ?.filter((d) => d.volumeMA != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.volumeMA),
      })) ?? [];

  group.volume?.setData(volume);
  group.volumeMA?.setData(volumeMA);

  latestIndicatorValuesRef.current.VOL = {
    volume: volume[volume.length - 1]?.value ?? null,
  };
}
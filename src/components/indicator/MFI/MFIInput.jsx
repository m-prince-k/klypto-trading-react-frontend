export default function MFIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = response?.data ?? [];

  const group = indicatorSeriesRef.current?.[indicator];
  if (!group) return;

  const mfiData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value ?? d.mfi),
    }));

  group.mfiLine?.setData([...mfiData]);

  latestIndicatorValuesRef.current[indicator] = {
    mfi: mfiData[mfiData.length - 1]?.value ?? null,
  };
}

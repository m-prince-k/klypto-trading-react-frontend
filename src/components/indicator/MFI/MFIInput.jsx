export default function MFIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
) {
  const rows = response?.data ?? [];

  const group = indicatorSeriesRef.current?.MFI;
  if (!group) return;

  const mfiData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value ?? d.mfi),
    }));

  group.mfiLine?.setData([...mfiData]);

  latestIndicatorValuesRef.current.MFI = {
    mfi: mfiData[mfiData.length - 1]?.value ?? null,
  };
}

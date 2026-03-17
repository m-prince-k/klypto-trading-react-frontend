export default function MFIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const mfiData = rows
    .filter((d) => d.mfi != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.mfi),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.MFI;
  if (!series) return;

  series.mfiLine?.setData(mfiData);

  latestIndicatorValuesRef.current.MFI = {
    mfiLine: mfiData[mfiData.length - 1]?.value,
  };

  indicatorSeriesRef.current.MFI.result = {
    data: {
      mfiLine: mfiData,
    },
  };
}
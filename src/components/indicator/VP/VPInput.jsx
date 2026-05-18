export default function VPInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const volumeData = rows
    .filter((d) => d.volume != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.volume),
      color:
        d.color ??
        (d.close >= d.open
          ? "rgba(38,166,154,1)"
          : "rgba(239,83,80,1)"),
    }))
    .sort((a, b) => a.time - b.time);

  const maData = rows
    .filter((d) => d.volumeMA != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.volumeMA),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.[indicator];
  if (!series) return;

  /* 🔥 HISTOGRAM */
  series.volume?.setData(volumeData);

  /* 🔥 MA */
  if (maType !== "none") {
    series.volumeMA?.setData(maData);
  } else {
    series.volumeMA?.setData([]);
  }

  /* 🔥 VALUES */
  latestIndicatorValuesRef.current[indicator] = {
    volume: volumeData.at(-1)?.value,
    volumeMA: maType !== "none" ? maData.at(-1)?.value : null,
  };

  /* 🔥 STORE */
  indicatorSeriesRef.current[indicator].result = {
    data: {
      volume: volumeData,
      volumeMA: maType !== "none" ? maData : [],
    },
  };
}
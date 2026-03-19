export default function VOLInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const volumeData = rows
    .filter((d) => d.volume != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.volume),
      color: d.color || "rgba(38,166,154,1)",
    }))
    .sort((a, b) => a.time - b.time);

  const maData = rows
    .filter((d) => d.volumeMA != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.volumeMA),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.VOL;
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
  latestIndicatorValuesRef.current.VOL = {
    volume: volumeData.at(-1)?.value,
    volumeMA: maType !== "none" ? maData.at(-1)?.value : null,
  };

  /* 🔥 STORE */
  indicatorSeriesRef.current.VOL.result = {
    data: {
      volume: volumeData,
      volumeMA: maType !== "none" ? maData : [],
    },
  };
}
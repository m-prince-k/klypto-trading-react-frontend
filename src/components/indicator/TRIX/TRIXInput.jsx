export default function TRIXInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const trixData = rows
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.TRIX;
  if (!series) return;

  /* 🔥 UPDATE */
  series.trix?.setData(trixData);

  /* 🔥 VALUES */
  latestIndicatorValuesRef.current.TRIX = {
    value: trixData.at(-1)?.value,
  };

  /* 🔥 STORE */
  indicatorSeriesRef.current.TRIX.result = {
    data: trixData,
  };
}
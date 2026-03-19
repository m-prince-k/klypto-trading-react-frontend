export default function STOCHRSIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data?.candles)
    ? response.data.candles
    : [];

  console.log(rows, "STOCHRSI rows");

  const kSeries = indicatorSeriesRef.current?.STOCHRSI?.kLine;
  const dSeries = indicatorSeriesRef.current?.STOCHRSI?.dLine;

  if (!kSeries && !dSeries) return;

  const kData = rows
    .filter((d) => d.k != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.k),
    }));

  const dData = rows
    .filter((d) => d.d != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.d),
    }));

  if (kSeries) kSeries.setData(kData);
  if (dSeries) dSeries.setData(dData);

  latestIndicatorValuesRef.current.STOCHRSI = {
    kLine: kData[kData.length - 1]?.value ?? null,
    dLine: dData[dData.length - 1]?.value ?? null,
  };

}
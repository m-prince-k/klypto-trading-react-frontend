export default function STOCHRSIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
) {
  const rows = Array.isArray(response?.data?.candles)
    ? response.data.candles
    : [];

  console.log("STOCHRSI rows:", rows);

  const kData = [];
  const dData = [];

  rows.forEach((d) => {
    if (!d?.time) return;

    const time = Number(d.time);

    if (d.stochRsiK != null) {
      kData.push({
        time,
        value: Number(d.stochRsiK),
      });
    }

    if (d.stochRsiD != null) {
      dData.push({
        time,
        value: Number(d.stochRsiD),
      });
    }
  });

  console.log("STOCHRSI K DATA:", kData.length);
  console.log("STOCHRSI D DATA:", dData.length);

  /* ---------------- SERIES ---------------- */

  const kSeries = indicatorSeriesRef.current?.STOCHRSI?.kLine;
  const dSeries = indicatorSeriesRef.current?.STOCHRSI?.dLine;

  if (kSeries) {
    kSeries.setData(kData);
  }

  if (dSeries) {
    dSeries.setData(dData);
  }

  /* ---------------- LATEST VALUES ---------------- */

  if (!latestIndicatorValuesRef.current) {
    latestIndicatorValuesRef.current = {};
  }

  latestIndicatorValuesRef.current.STOCHRSI = {
    kLine: kData.at(-1)?.value ?? null,
    dLine: dData.at(-1)?.value ?? null,
  };

  /* ---------------- RESULT OBJECT ---------------- */

  const result = {
    data: {
      kData,
      dData,
    },
  };

  /* ---------------- STORE RESULT ---------------- */

  if (!indicatorSeriesRef.current) {
    indicatorSeriesRef.current = {};
  }

  indicatorSeriesRef.current.STOCHRSIData = result;

  /* ---------------- RETURN RESULT ---------------- */

  return {
    ...result,
  };
}

export default function AroonInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const upSeries = response?.data?.aroonUpSeries ?? [];
  const downSeries = response?.data?.aroonDownSeries ?? [];

  console.log(upSeries, downSeries, "serrrrrrrrrrrr")

  /* ---------- SAFETY CHECK ---------- */

  if (!indicatorSeriesRef.current[indicator]) {
    indicatorSeriesRef.current[indicator] = {};
  }

  const series = indicatorSeriesRef.current[indicator];

  /* ---------- UPDATE SERIES ---------- */

  series.aroonUp?.setData(upSeries);
  series.aroonDown?.setData(downSeries);

  /* ---------- UPDATE LATEST VALUE ---------- */

  latestIndicatorValuesRef.current[indicator] = {
    aroonUp: upSeries[upSeries.length - 1]?.value,
    aroonDown: downSeries[downSeries.length - 1]?.value,
  };

  /* ---------- STORE RESULT ---------- */

  series.result = {
    data: {
      aroonUp: upSeries,
      aroonDown: downSeries,
    },
  };
}

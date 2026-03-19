export default function KCInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const kcData = rows
    .filter(
      (d) =>
        d.upper != null &&
        d.middle != null &&
        d.lower != null &&
        d.time != null
    )
    .map((d) => ({
      time: Number(d.time),
      upper: Number(d.upper),
      basis: Number(d.middle),
      lower: Number(d.lower),
    }));

  const series = indicatorSeriesRef.current?.KC;
  if (!series) return;

  const upper = kcData.map((d) => ({ time: d.time, value: d.upper }));
  const basis = kcData.map((d) => ({ time: d.time, value: d.basis }));
  const lower = kcData.map((d) => ({ time: d.time, value: d.lower }));

  series.upper?.setData(upper);
  series.basis?.setData(basis);
  series.lower?.setData(lower);

  /* update cloud data */

  series._data = {
    upper,
    lower,
  };

  latestIndicatorValuesRef.current.KC = {
    upper: kcData[kcData.length - 1]?.upper ?? 0,
    basis: kcData[kcData.length - 1]?.basis ?? 0,
    lower: kcData[kcData.length - 1]?.lower ?? 0,
  };

  indicatorSeriesRef.current.KC.result = kcData;
}
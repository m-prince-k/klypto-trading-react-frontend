export default function BBInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const bbData = rows
    .filter((d) => d.upper != null && d.lower != null && d.basis != null)
    .map((d) => ({
      time: Number(d.time),
      upper: Number(d.upper),
      basis: Number(d.basis),
      lower: Number(d.lower),
    }));

  const series = indicatorSeriesRef.current?.BB;
  if (!series) return;

  const upper = bbData.map((d) => ({ time: d.time, value: d.upper }));
  const basis = bbData.map((d) => ({ time: d.time, value: d.basis }));
  const lower = bbData.map((d) => ({ time: d.time, value: d.lower }));

  series.upper?.setData(upper);
  series.basis?.setData(basis);
  series.lower?.setData(lower);

  series._data = { upper, lower };

  latestIndicatorValuesRef.current.BB = {
    upper: bbData[bbData.length - 1]?.upper,
    basis: bbData[bbData.length - 1]?.basis,
    lower: bbData[bbData.length - 1]?.lower,
  };
}
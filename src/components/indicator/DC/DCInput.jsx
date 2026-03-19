export default function DCInput(response, indicatorSeriesRef, latestIndicatorValuesRef) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const dcData = rows
    .filter(d => d.upper != null && d.basis != null && d.lower != null && d.time != null)
    .map(d => ({
      time: Number(d.time),
      upper: Number(d.upper),
      basis: Number(d.basis),
      lower: Number(d.lower),
    }));

  const series = indicatorSeriesRef.current?.DC;
  if (!series) return;

  const upper = dcData.map(d => ({ time: d.time, value: d.upper }));
  const basis = dcData.map(d => ({ time: d.time, value: d.basis }));
  const lower = dcData.map(d => ({ time: d.time, value: d.lower }));

  series.upper?.setData(upper);
  series.basis?.setData(basis);
  series.lower?.setData(lower);

  /* ⭐ IMPORTANT: update data used by canvas cloud */
  series._data = {
    upper,
    lower,
  };

  latestIndicatorValuesRef.current.DC = {
    upper: dcData[dcData.length - 1]?.upper ?? 0,
    basis: dcData[dcData.length - 1]?.basis ?? 0,
    lower: dcData[dcData.length - 1]?.lower ?? 0,
  };

  indicatorSeriesRef.current.DC.result = dcData;
}
export default function DCInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {

  const group = indicatorSeriesRef.current?.[indicator];
  if (!group) return;

  const upper =
    response?.data
      ?.filter((d) => d.upper != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.upper),
      })) ?? [];

  const lower =
    response?.data
      ?.filter((d) => d.lower != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.lower),
      })) ?? [];

  const basis =
    response?.data
      ?.filter((d) => d.basis != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.basis),
      })) ?? [];

  /* ================= UPDATE SERIES ================= */

  group.upper?.setData(upper);
  group.lower?.setData(lower);
  group.basis?.setData(basis);

  /* ================= STORE CLOUD DATA ================= */

  group.upperData = upper;
  group.lowerData = lower;

  /* ================= CROSSHAIR VALUES ================= */

  latestIndicatorValuesRef.current[indicator] = {
    upper: upper[upper.length - 1]?.value ?? null,
    lower: lower[lower.length - 1]?.value ?? null,
    basis: basis[basis.length - 1]?.value ?? null,
  };
}
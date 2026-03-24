export default function KCInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const group = indicatorSeriesRef.current?.KC;
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

  const middle =
    response?.data
      ?.filter((d) => d.middle != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d.middle),
      })) ?? [];

  group.upper?.setData(upper);
  group.lower?.setData(lower);
  group.middle?.setData(middle);

  latestIndicatorValuesRef.current.KC = {
    upper: upper[upper.length - 1]?.value ?? null,
    lower: lower[lower.length - 1]?.value ?? null,
    middle: middle[middle.length - 1]?.value ?? null,
  };
}
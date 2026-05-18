export default function OBVInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  if (!response?.data?.length) return;

  const obvGroup = indicatorSeriesRef.current?.[indicator];
  if (!obvGroup) return;

  const obv = response.data
    .filter((d) => d.obv != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.obv) }));

  const smoothingMA = response.data
    .filter((d) => d.smoothingMA != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.smoothingMA) }));

  const bbUpper = response.data
    .filter((d) => d.bbUpper != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.bbUpper) }));

  const bbLower = response.data
    .filter((d) => d.bbLower != null && d.time != null)
    .map((d) => ({ time: Number(d.time), value: Number(d.bbLower) }));

  // update series
  obvGroup.obv?.setData(obv);
  obvGroup.smoothingMA?.setData(smoothingMA);
  obvGroup.bbUpper?.setData(bbUpper);
  obvGroup.bbLower?.setData(bbLower);

  latestIndicatorValuesRef.current[indicator] = {
    obv: obv.at(-1)?.value ?? null,
    smoothingMA: smoothingMA.at(-1)?.value ?? null,
    bbUpper: bbUpper.at(-1)?.value ?? null,
    bbLower: bbLower.at(-1)?.value ?? null,
  };
}
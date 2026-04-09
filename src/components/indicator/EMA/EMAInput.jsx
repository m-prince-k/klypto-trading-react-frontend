export default function EMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicatorType, // full key (e.g. EMA or CUSTOM_EMA)
) {
  const indicatorKey = indicatorType || "EMA";
  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= EMA ================= */
  let emaData = rows
    .filter((d) => d.ema != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.ema),
    }))
    .sort((a, b) => a.time - b.time);

  if (typeof emaData === "number") {
    emaData = [{ time: Date.now() / 1000, value: emaData }];
  }

  /* ================= SMOOTHING MA ================= */
  let smoothingData = rows
    .filter((d) => d.smoothingMA != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.smoothingMA),
    }))
    .sort((a, b) => a.time - b.time);

  if (typeof smoothingData === "number") {
    smoothingData = [{ time: Date.now() / 1000, value: smoothingData }];
  }

  /* ================= BOLLINGER BANDS ================= */
  let bbUpperData = [];
  let bbLowerData = [];
  if (maType === "SMA + Bollinger Bands") {
    bbUpperData = rows
      .filter((d) => d.bbUpper != null && d.time != null)
      .map((d) => ({ time: Number(d.time), value: Number(d.bbUpper) }))
      .sort((a, b) => a.time - b.time);

    bbLowerData = rows
      .filter((d) => d.bbLower != null && d.time != null)
      .map((d) => ({ time: Number(d.time), value: Number(d.bbLower) }))
      .sort((a, b) => a.time - b.time);
  }

  /* ================= UPDATE SERIES ================= */
  const series = indicatorSeriesRef.current?.[indicatorKey];
  if (!series) return;

  series.ema?.setData(emaData);

  if (maType !== "none") {
    series.smoothingMA?.setData(smoothingData);
  } else {
    series.smoothingMA?.setData([]);
  }

  if (maType === "SMA + Bollinger Bands") {
    series.bbUpper?.setData(bbUpperData);
    series.bbLower?.setData(bbLowerData);
  }

  /* ================= UPDATE HOVER VALUES ================= */
  latestIndicatorValuesRef.current[indicatorKey] =
    typeof latestIndicatorValuesRef.current[indicatorKey] === "object" &&
    latestIndicatorValuesRef.current[indicatorKey] !== null
      ? latestIndicatorValuesRef.current[indicatorKey]
      : {};

  latestIndicatorValuesRef.current[indicatorKey].ema = emaData[emaData.length - 1]?.value ?? null;
  latestIndicatorValuesRef.current[indicatorKey].smoothingMA =
    smoothingData[smoothingData.length - 1]?.value ?? null;
  latestIndicatorValuesRef.current[indicatorKey].bbUpper = bbUpperData[bbUpperData.length - 1]?.value ?? null;
  latestIndicatorValuesRef.current[indicatorKey].bbLower = bbLowerData[bbLowerData.length - 1]?.value ?? null;

  /* ================= STORE RESULT ================= */
  indicatorSeriesRef.current[indicatorKey].result = {
    data: {
      ema: emaData,
      smoothingMA: maType !== "none" ? smoothingData : [],
      bbUpper: bbUpperData,
      bbLower: bbLowerData,
    },
  };
}
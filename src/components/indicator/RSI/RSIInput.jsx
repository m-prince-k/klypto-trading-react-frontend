export default function RSIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicatorType, // full key (e.g. RSI or CUSTOM_RSI)
) {
  const indicatorKey = indicatorType || "RSI";
  const rows = Array.isArray(response?.data) ? response.data : [];

  const series = indicatorSeriesRef.current?.[indicatorKey];
  if (!series) return;

  /* ================= RSI ================= */

  const rsiData = rows
    .filter((d) => d?.rsi != null && d?.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.rsi),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= SMOOTHING MA ================= */

  const smoothingData = rows
    .filter((d) => d?.smoothingMA != null && d?.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.smoothingMA),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= BB UPPER ================= */

  const bbUpperData = rows
    .filter((d) => d?.bbUpper != null && d?.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.bbUpper),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= BB LOWER ================= */

  const bbLowerData = rows
    .filter((d) => d?.bbLower != null && d?.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.bbLower),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= UPDATE RSI ================= */

  series.rsi?.setData(rsiData);

  /* ================= UPDATE MA ================= */

  if (maType !== "none") {
    series.smoothingMA?.setData(smoothingData);
  } else {
    series.smoothingMA?.setData([]);
  }

  /* ================= BOLLINGER BANDS ================= */

  const latestValues = latestIndicatorValuesRef.current[indicatorKey] || {};

  if (maType === "SMA + Bollinger Bands") {
    series.bbUpper?.setData(bbUpperData);
    series.bbLower?.setData(bbLowerData);

    series.bbUpperData = bbUpperData;
    series.bbLowerData = bbLowerData;

    latestValues.bbUpper = bbUpperData[bbUpperData.length - 1]?.value ?? null;
    latestValues.bbLower = bbLowerData[bbLowerData.length - 1]?.value ?? null;
  } else {
    /* clear BB if MA type changed */

    series.bbUpper?.setData([]);
    series.bbLower?.setData([]);

    series.bbUpperData = [];
    series.bbLowerData = [];

    latestValues.bbUpper = null;
    latestValues.bbLower = null;
  }

  /* ================= UPDATE HOVER VALUES ================= */

  latestValues.rsi = rsiData[rsiData.length - 1]?.value ?? null;
  latestValues.smoothingMA = smoothingData[smoothingData.length - 1]?.value ?? null;

  latestIndicatorValuesRef.current[indicatorKey] = latestValues;

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current[indicatorKey].result = {
    data: {
      rsi: rsiData,
      smoothingMA: maType !== "none" ? smoothingData : [],
      bbUpper: maType === "SMA + Bollinger Bands" ? bbUpperData : [],
      bbLower: maType === "SMA + Bollinger Bands" ? bbLowerData : [],
    },
  };
}
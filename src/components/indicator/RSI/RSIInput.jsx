export default function RSIInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
  indicator
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const series = indicatorSeriesRef.current?.[indicator];
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

  if (maType === "SMA + Bollinger Bands") {
    series.bbUpper?.setData(bbUpperData);
    series.bbLower?.setData(bbLowerData);

    series.bbUpperData = bbUpperData;
    series.bbLowerData = bbLowerData;

    latestIndicatorValuesRef.current[indicator].bbUpper =
      bbUpperData[bbUpperData.length - 1]?.value ?? null;

    latestIndicatorValuesRef.current[indicator].bbLower =
      bbLowerData[bbLowerData.length - 1]?.value ?? null;
  } else {
    /* clear BB if MA type changed */

    series.bbUpper?.setData([]);
    series.bbLower?.setData([]);

    series.bbUpperData = [];
    series.bbLowerData = [];

    latestIndicatorValuesRef.current[indicator].bbUpper = null;
    latestIndicatorValuesRef.current[indicator].bbLower = null;
  }

  /* ================= UPDATE HOVER VALUES ================= */

  latestIndicatorValuesRef.current[indicator].rsi =
    rsiData[rsiData.length - 1]?.value ?? null;

  latestIndicatorValuesRef.current[indicator].smoothingMA =
    smoothingData[smoothingData.length - 1]?.value ?? null;

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current[indicator].result = {
    data: {
      rsi: rsiData,
      smoothingMA: maType !== "none" ? smoothingData : [],
      bbUpper: maType === "SMA + Bollinger Bands" ? bbUpperData : [],
      bbLower: maType === "SMA + Bollinger Bands" ? bbLowerData : [],
    },
  };
}
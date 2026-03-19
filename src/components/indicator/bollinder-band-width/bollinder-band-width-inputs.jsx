export default function BollingerBandWidthInputs(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= RSI ================= */

  const rsiData = rows
    .filter((d) => d.rsi != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.bbw),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= SMOOTHING MA ================= */

  const smoothingData = rows
    .filter((d) => d.smoothingMA != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.smoothingMA),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= BB UPPER ================= */

  const bbUpperData = rows
    .filter((d) => d.bbUpperBand != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.bbUpperBand),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= BB LOWER ================= */

  const bbLowerData = rows
    .filter((d) => d.bbLowerBand != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.bbLowerBand),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.RSI;

  if (!series) return;

  /* ================= UPDATE RSI ================= */

  series.rsi?.setData(rsiData);

  /* ================= UPDATE MA ================= */

  series.smoothingMA?.setData(smoothingData);


  /* ================= BOLLINGER BANDS ================= */
   console.log(maType, "typjndvukhdbvjab")

  if (maType === "SMA + Bollinger Bands") {
    series.bbUpperBand?.setData(bbUpperData);
    series.bbLowerBand?.setData(bbLowerData);

    latestIndicatorValuesRef.current.RSI.bbUpperBand =
      bbUpperData[bbUpperData.length - 1]?.value;

    latestIndicatorValuesRef.current.RSI.bbLowerBand =
      bbLowerData[bbLowerData.length - 1]?.value;
  } else {
    /* clear BB if MA type changed */

    series.bbUpperBand?.setData([]);
    series.bbLowerBand?.setData([]);

    latestIndicatorValuesRef.current.RSI.bbUpperBand = null;
    latestIndicatorValuesRef.current.RSI.bbLowerBand = null;
  }

  /* ================= UPDATE HOVER VALUES ================= */
console.log("RSI MA TYPE:", maType);
  latestIndicatorValuesRef.current.RSI.rsi =
    rsiData[rsiData.length - 1]?.value;

  latestIndicatorValuesRef.current.RSI.smoothingMA =
    smoothingData[smoothingData.length - 1]?.value;

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.RSI.result = {
    data: {
      rsi: rsiData,
      smoothingMA: smoothingData,
      bbUpperBand:
        maType === "SMA + Bollinger Bands" ? bbUpperData : [],
      bbLowerBand:
        maType === "SMA + Bollinger Bands" ? bbLowerData : [],
    },
  };

  
}
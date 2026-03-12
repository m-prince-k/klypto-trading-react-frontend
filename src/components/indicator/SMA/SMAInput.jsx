// src/components/SMA/SMAInput.jsx

export default function SMAInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {
  const rows = response?.data ?? [];

  if (!rows.length) return;

  // -------------------- Map main SMA line --------------------
  const maData = rows
    .filter((d) => d.sma != null && d.time != null)
    .map((d) => ({
      time: d.time,
      value: d.sma,
    }));

  // -------------------- Map smoothingMA line --------------------
  const smoothingData = rows
    .filter((d) => d.smoothingMA != null && d.time != null)
    .map((d) => ({
      time: d.time,
      value: d.smoothingMA,
    }));

  // -------------------- Map Bollinger Bands if present --------------------
  const upperBand = rows
    .filter((d) => d.bbUpper != null && d.time != null)
    .map((d) => ({
      time: d.time,
      value: d.bbUpper,
    }));

  const lowerBand = rows
    .filter((d) => d.bbLower != null && d.time != null)
    .map((d) => ({
      time: d.time,
      value: d.bbLower,
    }));

  const series = indicatorSeriesRef.current?.SMA;
  if (!series) return;

  // -------------------- Update series --------------------
  if (series.ma) series.ma.setData(maData);
  if (series.smoothing) series.smoothing.setData(smoothingData); // <-- new line

  if (series.bbUpper) series.bbUpper.setData(upperBand);
  if (series.bbLower) series.bbLower.setData(lowerBand);

  // -------------------- Update hover/latest value reference --------------------
  indicatorSeriesRef.current.SMA.result = {
    data: {
      sma: maData,
      smoothingMA: smoothingData, // <-- new
      bbUpper: upperBand,
      bbLower: lowerBand,
    },
  };

  latestIndicatorValuesRef.current.SMA = {
    sma: maData[maData.length - 1]?.value,
    smoothingMA: smoothingData[smoothingData.length - 1]?.value, // <-- new
    bbUpper: upperBand[upperBand.length - 1]?.value,
    bbLower: lowerBand[lowerBand.length - 1]?.value,
  };
}
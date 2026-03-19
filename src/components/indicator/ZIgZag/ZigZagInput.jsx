export default function ZIGZAGInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const series = response?.data?.series ?? [];
  const pivots = response?.data?.pivots ?? [];

  const zigzagSeries = indicatorSeriesRef.current?.ZIGZAG?.zigzagLine;

  if (!zigzagSeries) return;

  const lineData = series
    .filter((d) => d.value != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.value),
    }));

  zigzagSeries.setData(lineData);

  const markers = pivots.map((p) => ({
    time: p.time,
    position: p.type === "high" ? "aboveBar" : "belowBar",
    color: "#2962ff",
    shape: "circle",
    text: p.type === "high" ? "H" : "L",
  }));

  zigzagSeries.setMarkers(markers);

  latestIndicatorValuesRef.current.ZIGZAG = {
    zigzagLine: lineData[lineData.length - 1]?.value ?? null,
  };
}
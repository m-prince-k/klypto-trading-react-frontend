export default function AroonOscillatorInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= OSCILLATOR DATA ================= */

  const oscData = rows
    .filter((d) => d.aroonOsc != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.aroonOsc),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.AroonOscillator;
  if (!series) return;

  /* ================= UPDATE OSCILLATOR ================= */

  series.oscillator?.setData(oscData);
  series.oscillatorFill?.setData(oscData);

  /* ================= LEVEL LINES ================= */

  const upper = series.upperLevel?.options?.value ?? 90;
  const center = series.center?.options?.value ?? 0;
  const lower = series.lowerLevel?.options?.value ?? -90;

  const makeLevelData = (value) =>
    oscData.map((p) => ({
      time: p.time,
      value,
    }));

  series.upperLevel?.setData(makeLevelData(upper));
  series.center?.setData(makeLevelData(center));
  series.lowerLevel?.setData(makeLevelData(lower));

  /* ================= HOVER VALUES ================= */

  latestIndicatorValuesRef.current.AroonOscillator = {
    oscillator: oscData[oscData.length - 1]?.value,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.AroonOscillator.result = {
    data: {
      oscillator: oscData,
    },
  };
}
export default function ChandeKrollStopInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  /* ================= LONG STOP ================= */

  const longStopData = rows
    .filter((d) => d.longStop != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.longStop),
    }))
    .sort((a, b) => a.time - b.time);

  /* ================= SHORT STOP ================= */

  const shortStopData = rows
    .filter((d) => d.shortStop != null && d.time != null)
    .map((d) => ({
      time: Number(d.time),
      value: Number(d.shortStop),
    }))
    .sort((a, b) => a.time - b.time);

  const series = indicatorSeriesRef.current?.CKS;

  if (!series) return;

  /* ================= UPDATE SERIES ================= */

  series.longStop?.setData(longStopData);
  series.shortStop?.setData(shortStopData);

  /* ================= HOVER VALUE ================= */

  latestIndicatorValuesRef.current.CKS = {
    longStop: longStopData[longStopData.length - 1]?.value ?? null,
    shortStop: shortStopData[shortStopData.length - 1]?.value ?? null,
  };

  /* ================= STORE RESULT ================= */

  indicatorSeriesRef.current.CKS.result = {
    data: {
      longStop: longStopData,
      shortStop: shortStopData,
    },
  };
}
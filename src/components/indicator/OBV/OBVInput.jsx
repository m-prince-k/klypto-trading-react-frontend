export default function OBVInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType
) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  const mapData = (key) =>
    rows
      .filter((d) => d[key] != null && d.time != null)
      .map((d) => ({
        time: Number(d.time),
        value: Number(d[key]),
      }))
      .sort((a, b) => a.time - b.time);

  const obvData = mapData("value");
  const maData = mapData("smoothingMA");
  const bbUpper = mapData("bbUpper");
  const bbLower = mapData("bbLower");

  const series = indicatorSeriesRef.current?.OBV;
  if (!series) return;

  /* ================= OBV ================= */
  series.obv?.setData(obvData);

  /* ================= MA ================= */
  if (maType !== "none") {
    series.smoothingMA?.setData(maData);
  } else {
    series.smoothingMA?.setData([]);
  }

  /* ================= BB ================= */
  if (maType === "SMA + Bollinger Bands") {
    series.bbUpper?.setData(bbUpper);
    series.bbLower?.setData(bbLower);

    /* 🔥 FILL DATA (IMPORTANT) */
    const fillData = bbUpper.map((u, i) => ({
      time: u.time,
      value: u.value,
      lower: bbLower[i]?.value,
    }));

    series.bbFill?.setData(fillData);

  } else {
    series.bbUpper?.setData([]);
    series.bbLower?.setData([]);
    series.bbFill?.setData([]);
  }

  /* ================= VALUES ================= */

  latestIndicatorValuesRef.current.OBV = {
    obv: obvData.at(-1)?.value,
    smoothingMA:
      maType !== "none" ? maData.at(-1)?.value : null,
    bbUpper:
      maType === "SMA + Bollinger Bands"
        ? bbUpper.at(-1)?.value
        : null,
    bbLower:
      maType === "SMA + Bollinger Bands"
        ? bbLower.at(-1)?.value
        : null,
  };

  /* ================= STORE ================= */

  indicatorSeriesRef.current.OBV.result = {
    data: {
      obv: obvData,
      smoothingMA: maType !== "none" ? maData : [],
      bbUpper:
        maType === "SMA + Bollinger Bands" ? bbUpper : [],
      bbLower:
        maType === "SMA + Bollinger Bands" ? bbLower : [],
    },
  };
}
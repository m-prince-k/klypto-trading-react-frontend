export default function VWAPInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  console.log(rows, "rowssssssss")

  const vwap = [];
  const upper1 = [];
  const lower1 = [];
  const upper2 = [];
  const lower2 = [];
  const upper3 = [];
  const lower3 = [];

  rows.forEach((d) => {

    if (!d?.time) return;

    const time = Number(d.time);

    /* ---------------- VWAP ---------------- */

    if (d.vwap != null) {
      vwap.push({
        time,
        value: Number(d.vwap),
      });
    }

    /* ---------------- BAND 1 ---------------- */

    if (d?.bands?.band1) {

      if (d.bands.band1.upper != null) {
        upper1.push({
          time,
          value: Number(d.bands.band1.upper),
        });
      }

      if (d.bands.band1.lower != null) {
        lower1.push({
          time,
          value: Number(d.bands.band1.lower),
        });
      }

    }

    /* ---------------- BAND 2 ---------------- */

    if (d?.bands?.band2) {

      if (d.bands.band2.upper != null) {
        upper2.push({
          time,
          value: Number(d.bands.band2.upper),
        });
      }

      if (d.bands.band2.lower != null) {
        lower2.push({
          time,
          value: Number(d.bands.band2.lower),
        });
      }

    }

    /* ---------------- BAND 3 ---------------- */

    if (d?.bands?.band3) {

      if (d.bands.band3.upper != null) {
        upper3.push({
          time,
          value: Number(d.bands.band3.upper),
        });
      }

      if (d.bands.band3.lower != null) {
        lower3.push({
          time,
          value: Number(d.bands.band3.lower),
        });
      }

    }

  });

  /* ---------------- DEBUG LOGS ---------------- */

  console.log("VWAP INPUT DEBUG");
  console.log("Rows:", rows);
  console.log("VWAP:", vwap.length);
  console.log("Band1:", upper1.length, lower1.length);
  console.log("Band2:", upper2.length, lower2.length);
  console.log("Band3:", upper3.length, lower3.length);


  /* ---------------- RESULT OBJECT ---------------- */

  const result = {
    data: {
      vwap,
      upper1,
      lower1,
      upper2,
      lower2,
      upper3,
      lower3,
    },
  };


  /* ---------------- STORE IN REFS ---------------- */

  if (!indicatorSeriesRef.current) {
    indicatorSeriesRef.current = {};
  }

  indicatorSeriesRef.current.VWAPData = result;


  /* ---------------- LATEST VALUES ---------------- */

  if (!latestIndicatorValuesRef.current) {
    latestIndicatorValuesRef.current = {};
  }

  latestIndicatorValuesRef.current.VWAP = {
    vwap: vwap.at(-1)?.value ?? null,
    upper1: upper1.at(-1)?.value ?? null,
    lower1: lower1.at(-1)?.value ?? null,
    upper2: upper2.at(-1)?.value ?? null,
    lower2: lower2.at(-1)?.value ?? null,
    upper3: upper3.at(-1)?.value ?? null,
    lower3: lower3.at(-1)?.value ?? null,
  };


  /* ---------------- IMPORTANT ---------------- */
  /* Returning a NEW object ensures React detects update */

  return {
    ...result
  };

}
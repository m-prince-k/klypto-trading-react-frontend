export default function VWAPInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
) {

  const rows = Array.isArray(response?.data) ? response.data : [];

  const vwap = [];
  const upper1 = [];
  const lower1 = [];
  const upper2 = [];
  const lower2 = [];
  const upper3 = [];
  const lower3 = [];

  rows.forEach((d) => {

    if (d?.vwap != null && d?.time != null) {
      vwap.push({
        time: d.time,
        value: Number(d.vwap),
      });
    }

    if (d?.bands?.[0]) {
      upper1.push({
        time: d.time,
        value: Number(d.bands[0].upper),
      });

      lower1.push({
        time: d.time,
        value: Number(d.bands[0].lower),
      });
    }

    if (d?.bands?.[1]) {
      upper2.push({
        time: d.time,
        value: Number(d.bands[1].upper),
      });

      lower2.push({
        time: d.time,
        value: Number(d.bands[1].lower),
      });
    }

    if (d?.bands?.[2]) {
      upper3.push({
        time: d.time,
        value: Number(d.bands[2].upper),
      });

      lower3.push({
        time: d.time,
        value: Number(d.bands[2].lower),
      });
    }

  });

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

  latestIndicatorValuesRef.current.VWAP = {
    vwap: vwap[vwap.length - 1]?.value ?? null,
  };

  indicatorSeriesRef.current.VWAP = {
    result,
  };

  return result;
}
export default function EOMInput(
response,
indicatorSeriesRef,
latestIndicatorValuesRef
) {
    console.log(rows, "rowsssssss")

const rows = Array.isArray(response?.data) ? response.data : [];

console.log(rows, "rowsssssss")

if (!indicatorSeriesRef.current?.EOM?.eom) return;

const series = indicatorSeriesRef.current.EOM.eom;

const eomData = rows
.filter((d) => d.eom != null && d.time != null)
.map((d) => ({
time: Number(d.time),
value: Number(d.eom),
}));

// update chart
series.setData(eomData);

// update latest value for crosshair
latestIndicatorValuesRef.current.EOM = {
eom: eomData[eomData.length - 1]?.value,
};
}

export default function UOInput(
response,
indicatorSeriesRef,
latestIndicatorValuesRef
) {

// get correct rows
const rows = Array.isArray(response?.data?.candles)
? response.data.candles
: Array.isArray(response?.data)
? response.data
: [];

console.log(rows, "rowwwwwwwwwww")


if (!rows.length) return;


// map UO data
const uoData = rows
.filter((d) => d.uo != null && d.time != null)
.map((d) => ({
time: Number(d.time),
value: Number(d.uo),
}));

const series = indicatorSeriesRef.current?.UO?.ultimateoscillator;
if (!series) return;

// update chart
series.setData(uoData);

// update latest value
latestIndicatorValuesRef.current.UO = {
ultimateoscillator: uoData[uoData.length - 1]?.value,
};

// store result
indicatorSeriesRef.current.UO.result = uoData;
}

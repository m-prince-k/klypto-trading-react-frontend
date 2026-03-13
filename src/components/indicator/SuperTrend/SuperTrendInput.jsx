export default function SuperTrendInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
){

  const rows = Array.isArray(response?.data) ? response.data : [];

  const upTrendData = [];
  const downTrendData = [];
  const bodyMiddleData = [];

  rows.forEach((d)=>{

    if(!d.time) return;

    const time = Number(d.time);

    /* uptrend */

    if(d.upTrend != null){
      upTrendData.push({ time, value:Number(d.upTrend) });
    } else {
      upTrendData.push({ time }); // whitespace
    }

    /* downtrend */

    if(d.downTrend != null){
      downTrendData.push({ time, value:Number(d.downTrend) });
    } else {
      downTrendData.push({ time }); // whitespace
    }

    /* body middle */

    if(d.bodyMiddle != null){
      bodyMiddleData.push({
        time,
        value:Number(d.bodyMiddle)
      });
    }

  });

  const series = indicatorSeriesRef.current?.SuperTrend;
  if(!series) return;

  series.upTrend?.setData(upTrendData);
  series.downTrend?.setData(downTrendData);
  series.bodyMiddle?.setData(bodyMiddleData);

  series.upTrendBg?.setData(upTrendData);
  series.downTrendBg?.setData(downTrendData);

  const last = rows[rows.length-1];

  latestIndicatorValuesRef.current.SuperTrend={
    supertrend:last?.supertrend
  };

}

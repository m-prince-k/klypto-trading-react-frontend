export default function AroonInput(
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef
){

  const upSeries = response?.data?.aroonUpSeries ?? [];
  const downSeries = response?.data?.aroonDownSeries ?? [];

  const series = indicatorSeriesRef.current?.Aroon;
  if(!series) return;

  series.aroonUp?.setData(upSeries);
  series.aroonDown?.setData(downSeries);

  latestIndicatorValuesRef.current.Aroon = {
    aroonUp: upSeries[upSeries.length-1]?.value,
    aroonDown: downSeries[downSeries.length-1]?.value
  };

  indicatorSeriesRef.current.Aroon.result = {
    data:{
      aroonUp: upSeries,
      aroonDown: downSeries
    }
  };

}
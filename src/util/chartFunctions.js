import {
  createChart,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  HistogramSeries,
  BaselineSeries,
} from "lightweight-charts";

import apiService from "../services/apiServices";

export async function fetchDataByCurrency( selectedCurrency, timeframeValue,) {
  let response;
  if (selectedCurrency && timeframeValue) {
    response = await apiService.post(
      `listing?symbol=${selectedCurrency || "BTCUSD"}&interval=${timeframeValue || "1m"}&limit=1000`,
    );
  } else {
    response = await apiService.post(
      `listing?symbol=${selectedCurrency || "BTCUSD"}&limit=1000&interval=${timeframeValue || "1m"}`,
    );
  }
  return response;
}

export async function fetchIndicatorData( selectedIndicator, selectedCurrency, timeframeValue, chartRef, indicatorSeriesRef, latestIndicatorValuesRef, getIndicatorColor,) {
  if (!selectedIndicator.length) return;

  selectedIndicator.forEach(async (indicator, index) => {
    try {
      let data = await fetchDataForIndicators(selectedCurrency,indicator, timeframeValue);
       
      // Remove old series if exists
      if (indicatorSeriesRef.current[indicator]) {
        chartRef.current.removeSeries(indicatorSeriesRef.current[indicator]);
      }

      const series = chartRef.current.addSeries(LineSeries, {
        color: getIndicatorColor(index),
        lineWidth: 2,
      });

    //   ✅ FORMAT DATA HERE
    //   const formatted = data
    //     .filter((d) => d.value != null)
    //     .map((d) => ({
    //       time: Number(d.time), // ✅ Ensure number
    //       value: Number(d.value),
    //     }));

    
    console.log("Formatted data for", indicator, ":", data);

      series.setData(data);
      if (data.length) {
        latestIndicatorValuesRef.current[indicator] =
          data[data.length - 1].value;
      }

      indicatorSeriesRef.current[indicator] = series;
    } catch (error) {
      console.log(error, "Indicator loading error");
    }
  });
}

async function fetchDataForIndicators(selectedCurrency, type, timeframeValue){

    const response = await apiService.post(`indicatorDetails?symbol=${selectedCurrency}&interval=${timeframeValue}&type=${type}`);
    //   console.log("Raw indicator data for", type, ":", response);
      
let output;
  switch (type) {
    case "SMA":
      output= await response?.data && response.data.filter(d => d.value != null).map(d => ({
          time: Number(d.time),
          value: Number(d.value),   
        }));
        // console.log(data,"========================================-09567890-098654567890");

        return output;
        

    case "EMA":
       output= await response?.data && response.data.filter(d => d.value != null).map(d => ({
          time: Number(d.time),
          value: Number(d.value),
        }));
          return output;

    default:
      return [];
  }
}


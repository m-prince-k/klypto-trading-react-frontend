import { useEffect } from "react";
import { LineSeries } from "lightweight-charts";

export default function TRIXPlot({
  result,
  indicatorSeriesRef,
  addSeries,
  indicatorStyle,
}) {

  useEffect(() => {
    if (!result?.data?.length) return;

    /* CLEAR OLD */
    if (indicatorSeriesRef.current?.TRIX?.trix) {
      try {
        indicatorSeriesRef.current.TRIX.trix.setData([]);
      } catch {}
    }

    /* 🔥 CREATE LINE */
    const trixSeries = addSeries("price", LineSeries, {
      color:
        indicatorStyle?.TRIX?.trix?.color ||
        "rgba(0,188,212,1)",
      lineWidth:
        indicatorStyle?.TRIX?.trix?.width || 2,
      lineStyle:
        indicatorStyle?.TRIX?.trix?.lineStyle ?? 0,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    trixSeries.setData(result.data);

    indicatorSeriesRef.current.TRIX = {
      trix: trixSeries,
    };

  }, [result]);



  /* ================= STYLE UPDATE ================= */

  useEffect(() => {
    const g = indicatorSeriesRef.current?.TRIX;
    if (!g?.trix) return;

    g.trix.applyOptions({
      color: indicatorStyle?.TRIX?.trix?.color,
      lineWidth: indicatorStyle?.TRIX?.trix?.width,
      lineStyle: indicatorStyle?.TRIX?.trix?.lineStyle ?? 0,
      visible: indicatorStyle?.TRIX?.trix?.visible,
    });

  }, [indicatorStyle]);

  return null;
}
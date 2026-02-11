// import React from 'react'

// export const IndicatorBar = ({ selectedIndicator, timeframeValue, indicatorVisible, setIndicatorVisible }) => {
//   return (
//     <div className="absolute top-2 left-2 flex items-center gap-2 bg-white shadow-sm border border-slate-200 rounded-full px-3 h-8 text-xs">
  
//   <span className="font-medium text-slate-800">
//     {selectedIndicator?.toUpperCase()} {timeframeValue}
//   </span>

//   {/* Visibility Toggle */}
//   <button
//     onClick={() => {
//       const next = !indicatorVisible;
//       setIndicatorVisible(next);

//       if (indicatorSeriesRef.current) {
//         indicatorSeriesRef.current.applyOptions({ visible: next });
//       }
//     }}
//     className="text-slate-400 hover:text-slate-700"
//   >
//     {indicatorVisible ? "👁" : "🚫"}
//   </button>

//   {/* Settings (Optional) */}
//   <button
//     onClick={() => openModal("Indicator Settings")}
//     className="text-slate-400 hover:text-slate-700"
//   >
//     ⚙
//   </button>

//   {/* Remove Indicator */}
//   <button
//     onClick={() => {
//       if (indicatorSeriesRef.current) {
//         chartRef.current.removeSeries(indicatorSeriesRef.current);
//         indicatorSeriesRef.current = null;
//       }
//       setSelectedIndicator(null);
//     }}
//     className="text-slate-400 hover:text-red-500"
//   >
//     ✖
//   </button>
// </div>

//   )
// }

// import React, { useEffect, useRef, useState } from "react";
// import { CandlestickSeries, createChart } from "lightweight-charts";
// import { Calendar, CandlestickChart } from "lucide-react";

// const ranges = [
//   { label: "1D", days: 1 },
//   { label: "5D", days: 5 },
//   { label: "1M", days: 30 },
//   { label: "3M", days: 90 },
//   { label: "6M", days: 180 },
//   { label: "YTD", type: "ytd" },
//   { label: "1Y", days: 365 },
//   { label: "5Y", days: 365 * 5 },
//   { label: "All", type: "all" }
// ];

// const generateDummyData = (from, to) => {
//   const data = [];
//   let current = from ? new Date(from) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
//   const end = to ? new Date(to) : new Date();

//   let price = 100;

//   while (current <= end) {
//     const open = price;
//     const close = open + (Math.random() - 0.5) * 5;
//     const high = Math.max(open, close) + Math.random() * 2;
//     const low = Math.min(open, close) - Math.random() * 2;

//     data.push({
//       time: Math.floor(current.getTime() / 1000),
//       open,
//       high,
//       low,
//       close
//     });

//     price = close;
//     current.setDate(current.getDate() + 1);
//   }

//   return data;
// };

// export default function AdvancedChart() {
//   const containerRef = useRef();
//   const chartRef = useRef();

//   const [data, setData] = useState([]);
//   const [active, setActive] = useState("All");
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [time, setTime] = useState(new Date());

//   useEffect(() => {
//     const interval = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const formatTime = (date) =>
//     date.toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: false
//     });

//   const formatDate = (date) =>
//     date.toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric"
//     });

//   useEffect(() => {
//     const chart = createChart(containerRef.current, {
//       height: 400,
//       layout: { background: { color: "#0F172A" }, textColor: "#fff" }
//     });

//     const candleSeries = chart.addSeries(CandlestickSeries);
//     chartRef.current = { chart, candleSeries };

//     setData(generateDummyData());

//     return () => chart.remove();
//   }, []);

//   useEffect(() => {
//     if (chartRef.current && data.length) {
//       chartRef.current.candleSeries.setData(data);
//     }
//   }, [data]);

//   const fetchData = async ({ from, to, all }) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         if (all) resolve(generateDummyData());
//         else resolve(generateDummyData(from, to));
//       }, 300);
//     });
//   };

//   const handleRange = async (item) => {
//     setActive(item.label);

//     let params = {};
//     const now = new Date();

//     if (item.days) {
//       const from = new Date();
//       from.setDate(now.getDate() - item.days);
//       params = { from, to: now };
//     }

//     if (item.type === "ytd") {
//       params = { from: new Date(now.getFullYear(), 0, 1), to: now };
//     }

//     if (item.type === "all") {
//       params = { all: true };
//     }

//     const res = await fetchData(params);
//     setData(res);
//   };

//   const applyCustomRange = async () => {
//     if (!startDate || !endDate) return;

//     setActive("custom");
//     setShowCalendar(false);

//     const res = await fetchData({ from: new Date(startDate), to: new Date(endDate) });
//     setData(res);
//   };

//   return (
//     <div className="w-full relative">
//       <div ref={containerRef} />

//       {/* RANGE BAR */}
//       <div className="flex items-center justify-between p-3 bg-gray-900 text-white mt-2 rounded-2xl border border-gray-800 shadow-lg">
//         <div className="flex items-center gap-2 relative">
//           {ranges.map((item) => (
//             <button
//               key={item.label}
//               onClick={() => handleRange(item)}
//               className={`px-3 py-1 rounded-lg text-sm ${active === item.label ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}
//             >
//               {item.label}
//             </button>
//           ))}

//           <div className="relative">
//             <button
//               onClick={() => setShowCalendar(!showCalendar)}
//               className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
//             >
//               <Calendar size={16} />
//             </button>

//             {showCalendar && (
//               <div className="absolute bottom-12 left-0 w-64 bg-gray-900 p-4 rounded-xl shadow-xl border border-gray-700 z-50">
//                 <div className="text-sm mb-3 text-gray-300 font-medium">Select Range</div>

//                 <div className="flex flex-col gap-3">
//                   <input
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     className="p-2 bg-gray-800 rounded border border-gray-600"
//                   />
//                   <input
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     className="p-2 bg-gray-800 rounded border border-gray-600"
//                   />

//                   <button
//                     onClick={applyCustomRange}
//                     className="bg-blue-500 px-3 py-2 rounded mt-2"
//                   >
//                     Apply Range
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* TIMEZONE */}
//         <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
//           <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
//           <div className="flex flex-col">
//             <span className="text-sm font-semibold">{formatTime(time)}</span>
//             <span className="text-xs text-gray-400">{formatDate(time)} (IST)</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
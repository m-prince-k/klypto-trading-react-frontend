// import { useEffect, useState } from "react";
// import { IoClose, IoChevronDown } from "react-icons/io5";
// import { FiInfo } from "react-icons/fi";
// import { Link } from "react-router-dom";

// /* ------------------ INPUT COMPONENTS ------------------ */



// /* ------------------ MAIN COMPONENT ------------------ */

// export default function IndicatorSettings({ selectedIndicator, onClose }) {
//   const [open, setOpen] = useState(true);

//   const [rsiProperty, setRsiProperty] = useState({
//     rsiPeriod: 14,
//     rsiSource: "Close",
//   });

//   const [smoothing, setSmoothing] = useState({
//     type: "WMA",
//     length: 14,
//     bbStdDev: 2,
//   });

//   function SelectField({ label, options, value, onChange }) {
//   return (
//     <div className="flex items-center justify-between mb-4">
//       <label className="text-sm text-gray-700">{label}</label>

//       <div className="relative w-[140px]">
//         <select
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           className="w-full appearance-none bg-white border border-gray-300 rounded-sm text-gray-800 text-sm h-[30px] pl-2.5 pr-7 outline-none focus:border-blue-500 cursor-pointer"
//         >
//           {options.map((o) => (
//             <option key={o} value={o}>
//               {o}
//             </option>
//           ))}
//         </select>

//         <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs" />
//       </div>
//     </div>
//   );
// }

// function NumberField({ label, value, onChange, info }) {
//   return (
//     <div className="flex items-center justify-between mb-4">
//       <label className="flex items-center gap-1 text-sm text-gray-700">
//         {label}
//         {info && <FiInfo className="text-gray-400 text-xs" title={info} />}
//       </label>

//       <input
//         type="number"
//         value={value}
//         onChange={(e) => onChange(Number(e.target.value))}
//         className="w-[140px] bg-white border border-gray-300 rounded-sm text-gray-800 text-sm h-[30px] px-2.5 outline-none focus:border-blue-500"
//       />
//     </div>
//   );
// }

//   const handleIndicatorPropertyChange = (e) =>  {
//     // setOpen(false);
 
   
//     console.log(smoothing,"-098765434567890-=-098765");
//   }

//   // /* ✅ Proper visibility control */
//   // if (!open) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl w-md">
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 pt-4 pb-2">
//           <span className="text-xl font-semibold text-gray-900">
//             {selectedIndicator}
//           </span>

//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-6 h-6 flex items-center justify-center rounded transition-colors"
//           >
//             <IoClose className="text-xl" />
//           </button>
//         </div>

//         {/* Body */}
//         <div
//           className="px-4 py-4 overflow-y-auto"
//           style={{ maxHeight: "400px" }}
//         >
//           <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">
//             {selectedIndicator} Settings
//           </p>

//           <NumberField
//             label={`${selectedIndicator} Length`}
//             value={rsiProperty.rsiPeriod}
//             onChange={(val) =>
//               setRsiProperty((prev) => ({ ...prev, rsiPeriod: val }))
//             }
//           />

//           <SelectField
//             label="Source"
//             value={rsiProperty.rsiSource}
//             options={["Close", "Open", "High", "Low", "HL2", "HLC3", "OHLC4"]}
//             onChange={(val) =>
//               setRsiProperty((prev) => ({ ...prev, rsiSource: val }))
//             }
//           />

//           <div className="h-px bg-gray-200 mb-4" />

//           <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">
//             Smoothing
//           </p>

//           <SelectField
//             label="Type"
//             value={smoothing.type}
//             options={["SMA", "EMA", "WMA", "VWMA", "SMMA (RMA)"]}
//             onChange={(val) => setSmoothing((prev) => ({ ...prev, type: val }))}
//           />

//           <NumberField
//             label="Length"
//             value={smoothing.length}
//             onChange={(val) =>
//               setSmoothing((prev) => ({ ...prev, length: val }))
//             }
//           />

//           <NumberField
//             label="BB StdDev"
//             value={smoothing.bbStdDev}
//             info="Bollinger Band Standard Deviation"
//             onChange={(val) =>
//               setSmoothing((prev) => ({ ...prev, bbStdDev: val }))
//             }
//           />
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-end px-4 py-3 border-t border-gray-200">
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setOpen(false)}
//               className="border border-gray-300 bg-white text-sm text-gray-700 h-[30px] px-5 rounded-sm hover:bg-gray-50"
//             >
//               Cancel
//             </button>

//             <Link
//               onClick={handleIndicatorPropertyChange}
//               className="bg-gray-900 hover:bg-black text-white text-sm font-semibold h-[30px] px-5 rounded-sm"
//             >
//               Ok
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

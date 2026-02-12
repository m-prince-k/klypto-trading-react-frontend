import { FiWifiOff } from "react-icons/fi";

const ChartErrorState = ({ onRetry }) => {
  return (
    <div className="absolute z-99 inset-0 flex items-center justify-center">
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4 px-6 py-5 rounded-2xl bg-white shadow-lg border border-gray-200">
        
        <FiWifiOff className="text-3xl text-gray-700" />

        <div className="text-base font-semibold text-gray-800">
          Unable to load chart data
        </div>

        <div className="text-xs text-gray-500 text-center">
          Please check your connection or try again
        </div>

        <button
          onClick={onRetry}
          className="mt-1 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-black transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ChartErrorState;


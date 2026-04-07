import { useEffect, useRef } from "react";

export const Spinner = () => (
  <div className="flex flex-col items-center justify-center h-40 gap-5">
    <div className="relative w-14 h-14">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-violet-600 border-r-violet-600/10 animate-[spin_1.1s_linear_infinite]" />
      {/* Mid ring (reverse) */}
      <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-purple-500 border-l-purple-500/10 animate-[spin_0.75s_linear_infinite_reverse]" />
      {/* Inner ring */}
      <div className="absolute inset-4 rounded-full border-[3px] border-transparent border-t-fuchsia-400 border-r-fuchsia-400/10 animate-[spin_0.5s_linear_infinite]" />
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
    </div>
    <span className="text-xs font-medium -mt-10 tracking-widest uppercase text-slate-400 animate-pulse">
      Loading...
    </span>
  </div>
);
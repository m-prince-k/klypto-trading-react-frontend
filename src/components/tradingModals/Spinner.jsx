export const Spinner = () => (
  <div className="flex flex-col items-center justify-center h-40 gap-3">
    <div className="relative w-9 h-9">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-purple-500 border-r-purple-300 animate-spin" />
      {/* Inner ring (reverse) */}
      <div
        className="absolute inset-[6px] rounded-full border-[1.5px] border-transparent border-b-teal-400 border-l-teal-200"
        style={{ animation: "spin 0.75s cubic-bezier(0.6,0,0.4,1) infinite reverse" }}
      />
      {/* Center dot */}
      <div className="absolute inset-[14px] rounded-full bg-purple-500 animate-pulse" />
    </div>
    <div className="flex items-center gap-1 text-sm font-mono text-slate-600 tracking-wide">
      loading
      <span className="flex gap-[3px]">
        {[0, 0.2, 0.4].map((d, i) => (
          <span
            key={i}
            className="w-[3px] h-[3px] rounded-full bg-purple-400 animate-ping"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </span>
    </div>
  </div>
);
import { IoEyeOutline, IoEyeOffOutline, IoSettingsOutline, IoCloseSharp } from "react-icons/io5";
import { FiMoreHorizontal } from "react-icons/fi";
import { FaCode } from "react-icons/fa";

export default function IndicatorBar({
  indicator,
  timeframeValue,
  value,
  renderValue,
  indicatorVisibility,
  toggleIndicatorVisibility,
  removeIndicator,
  setActiveBarIndicator,
  setIndicatorProperty,
  setActiveSourceIndicator,
  setShowSourcePanel
}) {

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        padding: "4px 8px",
        fontSize: 12
      }}
    >

      <span className="flex items-center gap-2 text-slate-800">

        {indicator} : {timeframeValue} :

        <span style={{ display: "flex", gap: 6 }}>
          {renderValue(indicator, value)}
        </span>

      </span>

      <div className="flex items-center gap-2">

        <button
          onClick={() => toggleIndicatorVisibility(indicator)}
        >
          {indicatorVisibility[indicator] ?
            <IoEyeOutline size={16} /> :
            <IoEyeOffOutline size={16} />
          }
        </button>

        <button
          onClick={() => {
            setActiveBarIndicator(indicator);
            setIndicatorProperty((prev) => !prev);
          }}
        >
          <IoSettingsOutline size={16} />
        </button>

        <button
          onClick={() => {
            setActiveSourceIndicator(indicator);
            setShowSourcePanel(true);
          }}
        >
          <FaCode size={16} />
        </button>

        <button onClick={() => removeIndicator(indicator)}>
          <IoCloseSharp size={16} />
        </button>

        <FiMoreHorizontal size={16} />

      </div>

    </div>
  );
}
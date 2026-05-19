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
        background: "var(--bg-card, #ffffff)",
        border: "1px solid var(--border-color, #e2e8f0)",
        color: "var(--text-main, #131722)",
        borderRadius: 6,
        padding: "4px 8px",
        fontSize: 12
      }}
    >

      <span className="flex items-center gap-2" style={{ color: "var(--text-main, #131722)" }}>

        {indicator} : {timeframeValue} :

        <span style={{ display: "flex", gap: 6, color: "var(--text-muted, #64748b)" }}>
          {renderValue(indicator, value)}
        </span>

      </span>

      <div className="flex items-center gap-2" style={{ color: "var(--text-muted, #64748b)" }}>

        <button
          onClick={() => toggleIndicatorVisibility(indicator)}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
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
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
        >
          <IoSettingsOutline size={16} />
        </button>

        <button
          onClick={() => {
            setActiveSourceIndicator(indicator);
            setShowSourcePanel(true);
          }}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
        >
          <FaCode size={16} />
        </button>

        <button 
          onClick={() => removeIndicator(indicator)}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
        >
          <IoCloseSharp size={16} />
        </button>

        <FiMoreHorizontal size={16} />

      </div>

    </div>
  );
}
import React, { useRef, useState } from "react";
import { styles } from "./style";
/* =======================
   TOOLS
======================= */
const TOOLS = {
  SELECT: "select",
  TREND: "trend",
  HLINE: "hline",
  VLINE: "vline",
  BRUSH: "brush",
  MEASURE: "measure",
  TEXT: "text",
  ICON: "icon",
};

const EMOJIS = ["😀", "🔥", "🚀", "📉", "📈", "⭐", "❌", "⭕"];

export default function Testing() {
  const svgRef = useRef(null);

  const [tool, setTool] = useState(TOOLS.SELECT);
  const [drawings, setDrawings] = useState([]);
  const [current, setCurrent] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [editingText, setEditingText] = useState(null);

  const [zoom, setZoom] = useState(1);
  const [hideAll, setHideAll] = useState(false);
  const [lockAll, setLockAll] = useState(false);

  const [emoji, setEmoji] = useState("😀");

  /* =======================
     HELPERS
  ======================= */
  const getPoint = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / zoom,
      y: (e.clientY - r.top) / zoom,
    };
  };

  const distance = (a, b) =>
    Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2).toFixed(1);

  /* =======================
     MOUSE EVENTS
  ======================= */
  const onDown = (e) => {
    const p = getPoint(e);

    if (tool === TOOLS.SELECT) {
      const hit = drawings.findLast(
        (d) =>
          d.start &&
          Math.abs(d.start.x - p.x) < 6 &&
          Math.abs(d.start.y - p.y) < 6
      );
      if (hit && !hit.locked && !lockAll) {
        setSelectedId(hit.id);
        setDragging(true);
      } else setSelectedId(null);
      return;
    }

    if (tool === TOOLS.ICON) {
      setDrawings([
        ...drawings,
        { id: Date.now(), tool, x: p.x, y: p.y, emoji },
      ]);
      return;
    }

    setCurrent({
      id: Date.now(),
      tool,
      start: p,
      end: p,
      points: [p],
    });
  };

  const onMove = (e) => {
    const p = getPoint(e);

    if (dragging && selectedId) {
      setDrawings((d) =>
        d.map((x) =>
          x.id === selectedId
            ? {
                ...x,
                start: p,
                end: x.end && {
                  x: p.x + (x.end.x - x.start.x),
                  y: p.y + (x.end.y - x.start.y),
                },
              }
            : x
        )
      );
      return;
    }

    if (!current) return;

    if (current.tool === TOOLS.BRUSH) {
      setCurrent((c) => ({ ...c, points: [...c.points, p] }));
    } else {
      setCurrent((c) => ({ ...c, end: p }));
    }
  };

  const onUp = () => {
    if (!current) return;

    if (current.tool === TOOLS.TEXT) {
      setEditingText({ ...current, text: "" });
      setCurrent(null);
      return;
    }

    setDrawings([...drawings, current]);
    setCurrent(null);
    setDragging(false);
  };

  /* =======================
     DRAW
  ======================= */
  const draw = (d) => {
    if (hideAll) return null;

    switch (d.tool) {
      case TOOLS.TREND:
        return <line x1={d.start.x} y1={d.start.y} x2={d.end.x} y2={d.end.y} stroke="black" />;

      case TOOLS.HLINE:
        return <line x1={0} y1={d.start.y} x2={800} y2={d.start.y} stroke="black" />;

      case TOOLS.VLINE:
        return <line x1={d.start.x} y1={0} x2={d.start.x} y2={400} stroke="black" />;

      case TOOLS.BRUSH:
        return (
          <polyline
            points={d.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="black"
          />
        );

      case TOOLS.MEASURE:
        return (
          <>
            <line x1={d.start.x} y1={d.start.y} x2={d.end.x} y2={d.end.y} stroke="black" />
            <text x={d.end.x + 5} y={d.end.y - 5} fontSize="12">
              {distance(d.start, d.end)}
            </text>
          </>
        );

      case TOOLS.TEXT:
        return (
          <text x={d.x} y={d.y} fontSize="14">
            {d.text}
          </text>
        );

      case TOOLS.ICON:
        return (
          <text x={d.x} y={d.y} fontSize="18">
            {d.emoji}
          </text>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      {/* ===== LEFT TOOLBAR ===== */}
      <div style={styles.toolbar}>
        <Btn title="Select" onClick={() => setTool(TOOLS.SELECT)}>🖱</Btn>
        <Btn title="Trend" onClick={() => setTool(TOOLS.TREND)}>📈</Btn>
        <Btn title="H Line" onClick={() => setTool(TOOLS.HLINE)}>➖</Btn>
        <Btn title="V Line" onClick={() => setTool(TOOLS.VLINE)}>│</Btn>
        <Btn title="Brush" onClick={() => setTool(TOOLS.BRUSH)}>✏️</Btn>
        <Btn title="Measure" onClick={() => setTool(TOOLS.MEASURE)}>📐</Btn>
        <Btn title="Text" onClick={() => setTool(TOOLS.TEXT)}>T</Btn>
        <Btn title="Icon" onClick={() => setTool(TOOLS.ICON)}>😀</Btn>

        <hr />

        <Btn title="Zoom In" onClick={() => setZoom((z) => z + 0.1)}>➕</Btn>
        <Btn title="Zoom Out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>➖</Btn>
        <Btn title="Hide All" onClick={() => setHideAll((h) => !h)}>👁</Btn>
        <Btn title="Lock All" onClick={() => setLockAll((l) => !l)}>🔒</Btn>
        <Btn title="Clear" onClick={() => setDrawings([])}>🗑</Btn>
      </div>

      {/* ===== EMOJI PICKER ===== */}
      {tool === TOOLS.ICON && (
        <div style={styles.emojiBar}>
          {EMOJIS.map((e) => (
            <span key={e} style={{ cursor: "pointer" }} onClick={() => setEmoji(e)}>
              {e}
            </span>
          ))}
        </div>
      )}

      {/* ===== SVG CHART ===== */}
      <svg
        ref={svgRef}
        width="800"
        height="400"
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        style={{
          border: "1px solid #ccc",
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {drawings.map((d) => (
          <g key={d.id}>{draw(d)}</g>
        ))}
        {current && current.tool === TOOLS.TEXT && (
          <rect
            x={Math.min(current.start.x, current.end.x)}
            y={Math.min(current.start.y, current.end.y)}
            width={Math.abs(current.end.x - current.start.x)}
            height={Math.abs(current.end.y - current.start.y)}
            fill="transparent"
            stroke="black"
            strokeDasharray="4"
          />
        )}
      </svg>

      {/* ===== INLINE TEXTAREA ===== */}
      {editingText && (
        <textarea
          autoFocus
          style={{
            position: "absolute",
            left: editingText.start.x * zoom + 50,
            top: editingText.start.y * zoom,
            width: Math.abs(editingText.end.x - editingText.start.x) * zoom || 120,
            height: Math.abs(editingText.end.y - editingText.start.y) * zoom || 40,
            resize: "none",
          }}
          onChange={(e) =>
            setEditingText((t) => ({ ...t, text: e.target.value }))
          }
          onBlur={() => {
            if (editingText.text.trim()) {
              setDrawings((d) => [
                ...d,
                {
                  id: editingText.id,
                  tool: TOOLS.TEXT,
                  x: editingText.start.x + 4,
                  y: editingText.start.y + 16,
                  text: editingText.text,
                },
              ]);
            }
            setEditingText(null);
          }}
        />
      )}
    </div>
  );
}

/* =======================
   UI
======================= */
const Btn = ({ children, onClick, title }) => (
  <div onClick={onClick} title={title} style={styles.btn}>
    {children}
  </div>
);



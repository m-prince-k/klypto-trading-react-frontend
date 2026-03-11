import { Row, Col, Form } from "react-bootstrap";
import { getRowsByIndicator } from "../../util/common";
import { useState, useRef, useEffect } from "react";
import ColorPalettePanel from "./ColorPalettePanel";

export default function IndicatorStyle({
  indicatorStyle,
  setIndicatorStyle,
  activeBarIndicator,
}) {
  const normalizedType = activeBarIndicator.replace(/[\s/]+/g, "");

  const selectedStyle = indicatorStyle?.[normalizedType];
  const rows = getRowsByIndicator(normalizedType);

  const [activePalette, setActivePalette] = useState(null);
  const paletteRef = useRef(null);

  /* ================= UPDATE FUNCTION ================= */

  const update = (section, key, value) => {
    setIndicatorStyle((prev) => ({
      ...prev,
      [normalizedType]: {
        ...prev[normalizedType],
        [section]: {
          ...prev[normalizedType]?.[section],
          [key]: value,
        },
      },
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        setActivePalette(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getFillPreview = (row, selectedStyle) => {
    const style = {
      ...row,
      ...(selectedStyle?.[row.key] || {}),
    };

    return (
      style.topFillColor1 ||
      style.bottomFillColor1 ||
      style.topFillColor2 ||
      style.bottomFillColor2 ||
      "#888"
    );
  };

  return (
    <div style={{ padding: "4px 0" }}>
      {rows
        .flatMap((row) => (row.children ? [row, ...row.children] : [row]))
        .map((row) => (
          <Row
            key={row.key}
            className="align-items-center mx-0"
            style={{
              borderBottom: "1px solid #ebebeb",
              minHeight: 48,
              transition: "background 0.15s ease",
              flexWrap: "nowrap",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f7fa")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {/* CHECKBOX + LABEL */}

            <Col
              className="ps-3 pe-1 py-2"
              style={{
                minWidth: 0,
                paddingLeft: row.children ? 0 : row.parent ? 28 : 0,
              }}
            >
              <Form.Check
                type="checkbox"
                checked={
                  selectedStyle?.[row.key]?.visible ?? row.visible ?? true
                }
                onChange={(e) => update(row.key, "visible", e.target.checked)}
                label={
                  <span
                    style={{
                      fontSize: "14.5px",
                      fontWeight: 600,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "-0.15px",
                      display: "block",
                    }}
                  >
                    {row.label}
                  </span>
                }
              />
            </Col>

            {/* SWATCH COLUMN */}

            <Col
              xs="auto"
              className="px-1 py-2 d-flex justify-content-center align-items-center"
              style={{ width: 50, position: "relative" }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePalette(activePalette === row.key ? null : row.key);
                }}
                style={{
                  width: 34,
                  height: 34,
                  border: "1.5px solid #d1d5db",
                  borderRadius: 7,
                  cursor: "pointer",

                  background:
                    row.type !== "fill"
                      ? (selectedStyle?.[row.key]?.color ??
                        row.color ??
                        "#2962ff")
                      : getFillPreview(row, selectedStyle),

                  boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
                  transition: "box-shadow 0.15s, transform 0.1s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.18)";
                  e.currentTarget.style.transform = "scale(1.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.10)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />

              {activePalette === row.key && (
                <div
                  ref={paletteRef}
                  style={{
                    position: "absolute",
                    top: 42,
                    left: 0,
                    zIndex: 9999,
                    borderRadius: 10,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                  }}
                >
                  <ColorPalettePanel
                    mode={row.type !== "fill" ? "line" : row.key}
                    currentStyle={selectedStyle?.[row.key] ?? row}
                    onChange={(style) => {
                      Object.entries(style).forEach(([k, v]) =>
                        update(row.key, k, v),
                      );
                    }}
                  />
                </div>
              )}
            </Col>

            {/* INPUT COLUMN */}

            <Col
              xs="auto"
              className="pe-3 ps-1 py-2 d-flex align-items-center justify-content-center"
              style={{ width: 170 }}
            >
              {row.value !== undefined ? (
                <Form.Control
                  type="number"
                  value={selectedStyle?.[row.key]?.value ?? row.value ?? ""}
                  onChange={(e) =>
                    update(row.key, "value", Number(e.target.value))
                  }
                  style={{
                    width: 160,
                    height: 34,
                    fontSize: 14,
                    fontWeight: 500,
                    padding: "2px 10px",
                    borderRadius: 7,
                    border: "1.5px solid #d1d5db",
                    textAlign: "left",
                    color: "#111827",
                    background: "#fff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2962ff";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(41,98,255,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.boxShadow =
                      "0 1px 2px rgba(0,0,0,0.06)";
                  }}
                />
              ) : (
                <div style={{ width: 58, height: 34 }} />
              )}
            </Col>
          </Row>
        ))}
    </div>
  );
}

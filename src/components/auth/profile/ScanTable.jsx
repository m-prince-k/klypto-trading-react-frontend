import React, { useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Share2,
  Plus,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  buildCondition,
  formatSmartDate,
} from "../../../util/scannerFunctions";

const PER_PAGE = 5;

function SortIcon({ col, sortCol, sortDir }) {
  if (col !== sortCol)
    return <ChevronsUpDown size={11} style={{ opacity: 0.4, marginLeft: 4 }} />;
  return sortDir === 1 ? (
    <ChevronUp size={11} style={{ marginLeft: 4, color: "#4a9eff" }} />
  ) : (
    <ChevronDown size={11} style={{ marginLeft: 4, color: "#4a9eff" }} />
  );
}

export default function ScanTable({ scans = [], onShare, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [filterCol, setFilterCol] = useState("all");
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState(-1);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return [...scans]
      .filter((r) => {
        if (!q) return true;
        if (filterCol === "all")
          return (
            r.label?.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q) ||
            r.condition?.toLowerCase().includes(q)
          );
        if (filterCol === "name") return r.label?.toLowerCase().includes(q);
        if (filterCol === "description")
          return r.description?.toLowerCase().includes(q);
        if (filterCol === "clause")
          return r.condition?.toLowerCase().includes(q);
        return true;
      })
      .sort((a, b) => {
        const key =
          sortCol === "name"
            ? "label"
            : sortCol === "clause"
              ? "condition"
              : sortCol;
        let va = a[key],
          vb = b[key];
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        return va < vb ? -sortDir : va > vb ? sortDir : 0;
      });
  }, [scans, query, filterCol, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d * -1);
    else {
      setSortCol(col);
      setSortDir(1);
    }
    setPage(1);
  };

  const thStyle = {
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "white",
    textAlign: "left",
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
    borderRight: "1px solid var(--border-color, #2e3347)",
  };
  const tdStyle = {
    padding: "11px 14px",
    verticalAlign: "top",
    borderRight: "1px solid var(--border-color, #ebebeb)",
  };

  return (
    <div
      style={{
        border: "1px solid var(--border-color, #d0cfc8)",
        borderRadius: 6,
        overflow: "hidden",
        background: "var(--bg-card, #fff)",
        fontSize: 14,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr style={{ background: "var(--bg-main, #1e2330)" }}>
              {[
                ["name", "Name", 100],
                ["description", "Description", 130],
                ["clause", "Clause", 230],
              ].map(([col, label, w]) => (
                <th
                  key={col}
                  style={{ ...thStyle, width: w }}
                  onClick={() => handleSort(col)}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {label}
                    <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
                  </div>
                </th>
              ))}
              <th
                style={{ ...thStyle, width: 120 }}
                onClick={() => handleSort("createdAt")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Created on
                  <SortIcon
                    col="createdAt"
                    sortCol={sortCol}
                    sortDir={sortDir}
                  />
                </div>
              </th>
              <th
                style={{
                  ...thStyle,
                  width: 160,
                  cursor: "default",
                  borderRight: "none",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {!slice.length ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "2.5rem",
                    color: "var(--text-muted, #999)",
                    fontStyle: "italic",
                  }}
                >
                  No scans match your search.
                </td>
              </tr>
            ) : (
              slice.map((scan, i) => (
                <tr
                  key={scan.id ?? scan.label}
                  style={{
                    borderBottom:
                      i < slice.length - 1 ? "1px solid var(--border-color, #ebebeb)" : "none",
                  }}
                >
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: "var(--accent-color, #3d6ec4)",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      {scan.label}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 13, color: "var(--text-muted, #555)" }}>
                    {scan.description || "—"}
                  </td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        maxWidth: "100%",
                      }}
                    >
                      {(buildCondition({ rules: scan.condition }) || "-")
                        .split(/\sAND\s/)
                        .map((part, i) => (
                          <span
                            key={i}
                            style={{
                              fontFamily: "'Courier New', monospace",
                              fontSize: 11,
                              color: "var(--text-main, #1a4a8a)",
                              background: "var(--bg-main, rgba(59, 130, 246, 0.08))",
                              border: "1px solid var(--border-color, rgba(59, 130, 246, 0.22))",
                              padding: "3px 8px",
                              borderRadius: 6,
                              display: "inline-flex",
                              alignItems: "flex-start",
                              gap: 5,
                              lineHeight: 1.6,
                              fontWeight: 600,
                              letterSpacing: "0.01em",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              alignSelf: "flex-start",
                              maxWidth: "100%",
                              boxSizing: "border-box",
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "var(--accent-color, rgba(59, 130, 246, 0.55))",
                                flexShrink: 0,
                                marginTop: 5,
                                display: "inline-block",
                              }}
                            />
                            {part.trim()}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontSize: 13,
                      color: "var(--text-muted, #666)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatSmartDate(scan.createdAt)}
                  </td>
                  <td style={{ ...tdStyle, borderRight: "none" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button
                        onClick={() => onShare?.(scan)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "2px 12px",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          background: "#1a7a451f",
                          border: "1.5px solid #1a7a45",
                          color: "#1a7a45",
                          letterSpacing: "0.01em",
                          boxShadow: "0 1px 4px rgba(26,122,69,0.18)",
                          transition:
                            "background 0.15s, box-shadow 0.15s, transform 0.1s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#1a7a45";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.boxShadow =
                            "0 3px 10px rgba(26,122,69,0.28)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#1a7a451f";
                          e.currentTarget.style.color = "#1a7a45";
                          e.currentTarget.style.boxShadow =
                            "0 1px 4px rgba(26,122,69,0.18)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Share2 size={13} /> Share
                      </button>

                      <button
                        onClick={() => onEdit?.(scan)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "2px 12px",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          background: "#721a7a1f",
                          border: "1.5px solid #721a7a",
                          color: "#721a7a",
                          letterSpacing: "0.01em",
                          boxShadow: "0 1px 3px rgba(114,26,122,0.12)",
                          transition:
                            "background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#721a7a";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.boxShadow =
                            "0 3px 10px rgba(114,26,122,0.28)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#721a7a1f";
                          e.currentTarget.style.color = "#721a7a";
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px rgba(114,26,122,0.12)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Pencil size={13} /> Edit
                      </button>

                      <button
                        onClick={() => onDelete?.(scan)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "2px 12px",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          background: "#c0392b1f",
                          border: "1.5px solid #c0392b",
                          color: "#c0392b",
                          letterSpacing: "0.01em",
                          boxShadow: "0 1px 4px rgba(192,57,43,0.18)",
                          transition:
                            "background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#c0392b";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.boxShadow =
                            "0 3px 10px rgba(192,57,43,0.28)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#c0392b1f";
                          e.currentTarget.style.color = "#c0392b";
                          e.currentTarget.style.boxShadow =
                            "0 1px 4px rgba(192,57,43,0.18)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          background: "var(--bg-main, #f5f4f0)",
          borderTop: "1px solid var(--border-color, #d0cfc8)",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-muted, #666)" }}>
          Showing {Math.min((safePage - 1) * PER_PAGE + 1, filtered.length)}–
          {Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={safePage === 1}
            style={{
              height: 28,
              minWidth: 28,
              padding: "0 8px",
              border: "1px solid var(--border-color, #c8c7c0)",
              background: "var(--bg-card, #fff)",
              color: "var(--text-main, #333)",
              borderRadius: 3,
              fontSize: 12,
              cursor: "pointer",
              opacity: safePage === 1 ? 0.4 : 1,
            }}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((i) => Math.abs(i - safePage) <= 2)
            .map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  height: 28,
                  minWidth: 28,
                  padding: "0 8px",
                  border: "1px solid var(--border-color, #c8c7c0)",
                  borderRadius: 3,
                  fontSize: 12,
                  cursor: "pointer",
                  background: i === safePage ? "var(--text-main, #1e2330)" : "var(--bg-card, #fff)",
                  color: i === safePage ? "var(--bg-card, #fff)" : "var(--text-main, #333)",
                }}
              >
                {i}
              </button>
            ))}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={safePage === totalPages}
            style={{
              height: 28,
              minWidth: 28,
              padding: "0 8px",
              border: "1px solid var(--border-color, #c8c7c0)",
              background: "var(--bg-card, #fff)",
              color: "var(--text-main, #333)",
              borderRadius: 3,
              fontSize: 12,
              cursor: "pointer",
              opacity: safePage === totalPages ? 0.4 : 1,
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Guide bar */}
      <div
        style={{
          textAlign: "center",
          padding: "8px 14px",
          background: "var(--bg-main, #f0f4ff)",
          borderTop: "1px solid var(--border-color, #d0cfc8)",
          fontSize: 13,
          color: "var(--text-muted, #555)",
        }}
      >
        Read our{" "}
        <a
          href="#"
          style={{ color: "var(--accent-color, #3d6ec4)", textDecoration: "none", fontWeight: 500 }}
        >
          guide
        </a>{" "}
        to organize scans, tags, and previews.
      </div>
    </div>
  );
}

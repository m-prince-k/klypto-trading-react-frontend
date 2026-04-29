import React, { useState, useMemo } from "react";
import { Pencil, Trash2, BellOff, Bell, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { formatSmartDate } from "../../../util/scannerFunctions";

const PER_PAGE = 5;

function SortIcon({ col, sortCol, sortDir }) {
  if (col !== sortCol) return <ChevronsUpDown size={11} style={{ opacity: 0.4, marginLeft: 4 }} />;
  return sortDir === 1
    ? <ChevronUp size={11} style={{ marginLeft: 4, color: "#4a9eff" }} />
    : <ChevronDown size={11} style={{ marginLeft: 4, color: "#4a9eff" }} />;
}

export default function AlertTable({ alerts = [], onEdit, onDelete, onToggle }) {
  const [query, setQuery] = useState("");
  const [filterCol, setFilterCol] = useState("all");
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState(-1);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return [...alerts]
      .filter((r) => {
        if (!q) return true;
        if (filterCol === "all") return r.alert_name?.toLowerCase().includes(q) || r.rule?.toLowerCase().includes(q);
        if (filterCol === "name") return r.alert_name?.toLowerCase().includes(q);
        if (filterCol === "condition") return r.rule?.toLowerCase().includes(q);
        if (filterCol === "status") return (r.active ? "active" : "inactive").includes(q);
        return true;
      })
      .sort((a, b) => {
        const map = { name: "alert_name", condition: "rule", status: "active" };
        const key = map[sortCol] || sortCol;
        let va = a[key], vb = b[key];
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        return va < vb ? -sortDir : va > vb ? sortDir : 0;
      });
  }, [alerts, query, filterCol, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d * -1);
    else { setSortCol(col); setSortDir(1); }
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
    borderRight: "1px solid #2e3347",
  };

  const tdStyle = {
    padding: "11px 14px",
    verticalAlign: "top",
    borderRight: "1px solid #ebebeb",
  };

  return (
    <div style={{ border: "1px solid #d0cfc8", borderRadius: 6, overflow: "hidden", background: "#fff", fontSize: 14, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, padding: "10px 14px", background: "#f5f4f0", borderBottom: "1px solid #d0cfc8", flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search alerts..."
          style={{ flex: 1, minWidth: 160, height: 32, padding: "0 10px", border: "1px solid #c8c7c0", borderRadius: 4, fontSize: 13, background: "#fff", color: "#1a1a1a", outline: "none" }}
        />
        <select
          value={filterCol}
          onChange={(e) => setFilterCol(e.target.value)}
          style={{ height: 32, padding: "0 8px", border: "1px solid #c8c7c0", borderRadius: 4, fontSize: 13, background: "#fff", color: "#1a1a1a", cursor: "pointer" }}
        >
          <option value="all">Filter by column</option>
          <option value="name">Name</option>
          <option value="condition">Clause</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: "#1e2330" }}>
              <th style={{ ...thStyle, width: 160 }} onClick={() => handleSort("name")}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} />
                </div>
              </th>
              <th style={{ ...thStyle, width: 220 }} onClick={() => handleSort("condition")}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Clause <SortIcon col="condition" sortCol={sortCol} sortDir={sortDir} />
                </div>
              </th>
              <th style={{ ...thStyle, width: 110 }} onClick={() => handleSort("status")}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Status <SortIcon col="status" sortCol={sortCol} sortDir={sortDir} />
                </div>
              </th>
              <th style={{ ...thStyle, width: 140 }} onClick={() => handleSort("createdAt")}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Created on <SortIcon col="createdAt" sortCol={sortCol} sortDir={sortDir} />
                </div>
              </th>
              <th style={{ ...thStyle, width: 150, cursor: "default", borderRight: "none" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!slice.length ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2.5rem", color: "#999", fontStyle: "italic" }}>
                  No alerts match your search.
                </td>
              </tr>
            ) : (
              slice.map((alert, i) => (
                <tr
                  key={alert.id ?? alert.alert_name}
                  style={{ borderBottom: i < slice.length - 1 ? "1px solid #ebebeb" : "none" }}
                >
                  {/* Name */}
                  <td style={tdStyle}>
                    <span style={{ color: "#3d6ec4", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                      {alert.alert_name}
                    </span>
                  </td>

                  {/* Condition */}
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: 12.5,
                      color: "#333",
                      background: "#f2f1ed",
                      padding: "3px 7px",
                      borderRadius: 3,
                      display: "inline-block",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}>
                      {alert.rule}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      fontSize: 11.5,
                      fontWeight: 500,
                      padding: "3px 10px",
                      borderRadius: 3,
                      background: alert.active ? "#e6f4ec" : "#f2f2f0",
                      color: alert.active ? "#1e7e4a" : "#888",
                      border: `1px solid ${alert.active ? "#b3dfc4" : "#ddd"}`,
                    }}>
                      {alert.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Created */}
                  <td style={{ ...tdStyle, fontSize: 13, color: "#666", whiteSpace: "nowrap" }}>
                    {formatSmartDate(alert.createdAt)}
                  </td>

                  {/* Actions */}
                  <td style={{ ...tdStyle, borderRight: "none" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button
                        onClick={() => onToggle?.(alert)}
                        title={alert.active ? "Disable alert" : "Enable alert"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 4, fontSize: 12, fontWeight: 500,
                          cursor: "pointer", background: "transparent",
                          border: `1px solid ${alert.active ? "#888" : "#1e7e4a"}`,
                          color: alert.active ? "#555" : "#1e7e4a",
                        }}
                      >
                        {alert.active ? <BellOff size={12} /> : <Bell size={12} />}
                        {alert.active ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => onEdit?.(alert)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 4, fontSize: 12, fontWeight: 500,
                          cursor: "pointer", background: "transparent",
                          border: "1px solid #888", color: "#333",
                        }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => onDelete?.(alert)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 4, fontSize: 12, fontWeight: 500,
                          cursor: "pointer", background: "#b83232",
                          border: "1px solid #b83232", color: "#fff",
                        }}
                      >
                        <Trash2 size={12} /> Delete
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", background: "#f5f4f0", borderTop: "1px solid #d0cfc8", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#666" }}>
          Showing {Math.min((safePage - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={safePage === 1}
            style={{ height: 28, minWidth: 28, padding: "0 8px", border: "1px solid #c8c7c0", background: "#fff", borderRadius: 3, fontSize: 12, cursor: "pointer", opacity: safePage === 1 ? 0.4 : 1 }}
          >‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((i) => Math.abs(i - safePage) <= 2)
            .map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{ height: 28, minWidth: 28, padding: "0 8px", border: "1px solid #c8c7c0", borderRadius: 3, fontSize: 12, cursor: "pointer", background: i === safePage ? "#1e2330" : "#fff", color: i === safePage ? "#fff" : "#333" }}
              >{i}</button>
            ))}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={safePage === totalPages}
            style={{ height: 28, minWidth: 28, padding: "0 8px", border: "1px solid #c8c7c0", background: "#fff", borderRadius: 3, fontSize: 12, cursor: "pointer", opacity: safePage === totalPages ? 0.4 : 1 }}
          >›</button>
        </div>
      </div>

    </div>
  );
}
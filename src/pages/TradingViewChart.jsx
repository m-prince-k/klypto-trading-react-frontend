import React, { useState } from "react";

/**
 * SINGLE FILE
 * Natural Language → Trading Scanner Conditions
 */

export default function NaturalLanguageScanner() {
  const [input, setInput] = useState("");
  const [conditions, setConditions] = useState([]);

  /* ================= OPERATOR MAP ================= */
  const operatorMap = {
    "greater than": ">",
    "more than": ">",
    "above": ">",
    "less than": "<",
    "below": "<",
    "equal to": "==",
    "not equal to": "!="
  };

  /* ================= PARSER ================= */
  function parseNaturalCondition(text) {
    const clean = text.toLowerCase().replace("if", "").trim();

    for (const phrase in operatorMap) {
      if (clean.includes(phrase)) {
        const parts = clean.split(phrase);

        if (parts.length !== 2) return null;

        const left = parts[0].replace("is", "").trim();
        const rightRaw = parts[1].trim();

        const right = isNaN(rightRaw) ? rightRaw : Number(rightRaw);

        return {
          left,
          operator: operatorMap[phrase],
          right
        };
      }
    }
    return null;
  }

  /* ================= ADD CONDITION ================= */
  const addCondition = () => {
    if (!input.trim()) return;

    const parsed = parseNaturalCondition(input);

    if (!parsed) {
      alert("Could not understand condition");
      return;
    }

    setConditions([...conditions, parsed]);
    setInput("");
  };

  /* ================= REMOVE CONDITION ================= */
  const removeCondition = (index) => {
    const updated = [...conditions];
    updated.splice(index, 1);
    setConditions(updated);
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 750 }}>
      <h2>🧠 Natural Language Trading Scanner</h2>

      {/* ===== INPUT ===== */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: if rsi is greater than 60"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addCondition}>Add</button>
      </div>

      <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
        Examples: <br />
        <code>if rsi is greater than 60</code> <br />
        <code>close is above ema20</code>
      </p>

      {/* ===== CONDITIONS LIST ===== */}
      <h3 style={{ marginTop: 20 }}>📌 Scanner Conditions</h3>

      {conditions.length === 0 && (
        <p style={{ color: "#999" }}>No conditions added</p>
      )}

      {conditions.map((c, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            marginBottom: 8,
            border: "1px solid #ddd",
            borderRadius: 6,
            background: "#f9f9f9"
          }}
        >
          <span>
            <b>{c.left}</b>{" "}
            <span style={{ color: "#007bff" }}>{c.operator}</span>{" "}
            <b>{c.right}</b>
          </span>

          <button
            onClick={() => removeCondition(index)}
            style={{
              background: "red",
              color: "#fff",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>
      ))}

      {/* ===== JSON OUTPUT ===== */}
      <h4 style={{ marginTop: 20 }}>🧪 Scanner JSON</h4>
      <pre style={{ background: "#111", color: "#0f0", padding: 10 }}>
        {JSON.stringify(conditions, null, 2)}
      </pre>
    </div>
  );
}
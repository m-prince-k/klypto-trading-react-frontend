// Strategy graph validator — runs BEFORE the dry-run to catch stuck/missing pieces
// and surface actionable fix suggestions to the user.

import { getBlock, isCompatible, STAGES } from "../stretegy-builder/blockRegistry";
import { getLeanInfo, getBlockLabel, leanCoverage } from "../stretegy-builder/leanMapping";

// Minimum useful pipeline: source -> (transform|operator) -> signal -> output
const REQUIRED_STAGES = ["source", "signal", "output"];

export function validateStrategy(nodes, edges) {
  const issues = [];

  // 1. Empty canvas
  if (nodes.length === 0) {
    issues.push({
      id: "empty",
      severity: "error",
      title: "Canvas is empty",
      detail: "There are no blocks to execute.",
      suggestion: "Drag a Source block (e.g. Close) from the palette to get started.",
      stage: "source",
    });
  }

  // 2. Stage coverage
  const stagesPresent = new Set();
  nodes.forEach((n) => {
    const b = getBlock(n.data.blockId);
    if (b) stagesPresent.add(b.category);
  });
  const stagesMissing = REQUIRED_STAGES.filter((s) => !stagesPresent.has(s));
  for (const s of stagesMissing) {
    const stage = STAGES.find((x) => x.key === s);
    issues.push({
      id: `missing-stage-${s}`,
      severity: "error",
      title: `Missing ${stage.label} stage`,
      detail: `Your strategy has no ${stage.label.toLowerCase()} block, so the pipeline is incomplete.`,
      suggestion:
        s === "source"
          ? "Add a Source block (Close, Open, OHLC) — the strategy needs market data to read."
          : s === "signal"
          ? "Add a Signal block (Buy / Sell / Long / Short) — without it the engine can't place trades."
          : s === "output"
          ? "Add an Output block (Overlay, Table, Alert, Backtest) — this is what you'll see as result."
          : `Add a ${stage.label} block.`,
      stage: s,
    });
  }

  // 3. Disconnected / orphan nodes (have inputs declared, but no incoming edge)
  for (const n of nodes) {
    const b = getBlock(n.data.blockId);
    if (!b) continue;
    if (b.inputs > 0) {
      const incoming = edges.filter((e) => e.target === n.id).length;
      if (incoming === 0) {
        issues.push({
          id: `orphan-${n.id}`,
          severity: "error",
          title: `${b.label} has no input wired`,
          detail: `Block "${b.label}" expects ${b.inputs} input${b.inputs > 1 ? "s" : ""} but receives none.`,
          suggestion: `Drag a connection from a previous block (e.g. Close → ${b.label}).`,
          nodeIds: [n.id],
          stage: b.category,
        });
      } else if (incoming < b.inputs) {
        issues.push({
          id: `partial-${n.id}`,
          severity: "warning",
          title: `${b.label} is missing input ${incoming + 1}`,
          detail: `Block expects ${b.inputs} inputs but only ${incoming} connected.`,
          suggestion: `Wire one more upstream block (or a Constant) into ${b.label}'s second input.`,
          nodeIds: [n.id],
          stage: b.category,
        });
      }
    }
  }

  // 4. Source → Signal reachability
  if (nodes.length > 0) {
    const adj = new Map();
    edges.forEach((e) => adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]));
    const sources = nodes.filter((n) => getBlock(n.data.blockId)?.category === "source").map((n) => n.id);
    const reachable = new Set();
    const stack = [...sources];
    while (stack.length) {
      const id = stack.pop();
      if (reachable.has(id)) continue;
      reachable.add(id);
      (adj.get(id) ?? []).forEach((t) => stack.push(t));
    }
    const signals = nodes.filter((n) => getBlock(n.data.blockId)?.category === "signal");
    const danglingSignals = signals.filter((n) => !reachable.has(n.id));
    if (signals.length > 0 && danglingSignals.length === signals.length) {
      issues.push({
        id: "no-source-to-signal",
        severity: "error",
        title: "Signal blocks aren't connected to any Source",
        detail: "There's no path from a Source block to your Signal block — the strategy will never trigger.",
        suggestion: "Wire your Source → Indicator/Operator → Condition → Signal in one continuous chain.",
        nodeIds: danglingSignals.map((n) => n.id),
        stage: "signal",
      });
    }
  }

  // 5. Output not connected to Signal
  const outputs = nodes.filter((n) => getBlock(n.data.blockId)?.category === "output");
  for (const o of outputs) {
    const incoming = edges.filter((e) => e.target === o.id);
    if (incoming.length === 0) {
      issues.push({
        id: `output-orphan-${o.id}`,
        severity: "warning",
        title: `Output "${getBlock(o.data.blockId)?.label}" has no input`,
        detail: "This output won't display anything because nothing feeds into it.",
        suggestion: "Connect a Signal (or Rule) block into this Output.",
        nodeIds: [o.id],
        stage: "output",
      });
    }
  }

  // 6. Cycle detection (simple DFS)
  if (hasCycle(nodes, edges)) {
    issues.push({
      id: "cycle",
      severity: "error",
      title: "Cycle detected in strategy graph",
      detail: "Your blocks form a loop, which the engine cannot evaluate.",
      suggestion: "Remove the connection that loops back to an earlier block.",
    });
  }

  // 7. One-block-per-category enforcement (happy-path strategy hygiene)
  const byCat = new Map();
  for (const n of nodes) {
    const b = getBlock(n.data.blockId);
    if (!b) continue;
    const arr = byCat.get(b.category) ?? [];
    arr.push(n);
    byCat.set(b.category, arr);
  }
  for (const [cat, list] of byCat.entries()) {
    if (list.length > 1) {
      const stage = STAGES.find((x) => x.key === cat);
      const labels = list.map((n) => getBlock(n.data.blockId)?.label ?? "?").join(", ");
      issues.push({
        id: `dup-cat-${cat}`,
        severity: "error",
        title: `Multiple blocks in ${stage.label} stage`,
        detail: `Found ${list.length} blocks (${labels}) in the ${stage.label} stage. Each stage allows only one block to keep the pipeline deterministic.`,
        suggestion: `Delete extra ${stage.label.toLowerCase()} block(s) — keep just one.`,
        nodeIds: list.slice(1).map((n) => n.id),
        stage: cat,
      });
    }
  }

  // 8. Edge-level IO compatibility (parent.outputType ↔ child.acceptsInputTypes)
  for (const e of edges) {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    if (!src || !tgt) continue;
    const sb = getBlock(src.data.blockId);
    const tb = getBlock(tgt.data.blockId);
    if (!sb || !tb) continue;
    if (tb.acceptsInputTypes.length === 0) continue; // sources etc.
    if (!isCompatible(tb, sb.outputType)) {
      issues.push({
        id: `io-${e.id ?? `${e.source}-${e.target}`}`,
        severity: "error",
        title: `Incompatible connection: ${sb.label} → ${tb.label}`,
        detail: `${sb.label} outputs "${sb.outputType}" but ${tb.label} accepts ${tb.acceptsInputTypes.map((t) => `"${t}"`).join(", ")}. The engine can't pass this value through.`,
        suggestion:
          sb.outputType === "boolean" && tb.acceptsInputTypes.includes("number")
            ? `Insert a Derived "Boolean → Number" block between them, or replace ${tb.label} with one that accepts boolean inputs.`
            : sb.outputType === "ohlc" && tb.acceptsInputTypes.includes("number")
            ? `Add a Column Select / Typical Price transform between ${sb.label} and ${tb.label} to extract a numeric series.`
            : `Replace ${tb.label} with a block that accepts "${sb.outputType}" inputs, or change ${sb.label} so its output matches.`,
        nodeIds: [src.id, tgt.id],
        stage: tb.category,
      });
    }
  }

  // 9. LEAN / QuantConnect coverage
  const allBlockIds = nodes.map((n) => n.data.blockId);
  const cov = leanCoverage(allBlockIds);
  const unsupportedNodes = nodes
    .map((n) => {
      const info = getLeanInfo(n.data.blockId);
      if (info.support === "supported") return null;
      const swapLabels = info.fix?.swapToBlockIds?.map(getBlockLabel);
      return {
        nodeId: n.id,
        blockId: n.data.blockId,
        label: getBlock(n.data.blockId)?.label ?? n.data.blockId,
        suggestion: info.fix?.suggestion ?? "Replace with a LEAN-supported block.",
        swapToBlockIds: info.fix?.swapToBlockIds,
        swapLabels,
      };
    })
    .filter((x) => x !== null);

  for (const u of unsupportedNodes) {
    issues.push({
      id: `lean-unsup-${u.nodeId}`,
      severity: "warning",
      title: `"${u.label}" has no LEAN equivalent`,
      detail:
        "This block won't translate to QuantConnect/LEAN as-is, so paper-runs and live deployments may not match.",
      suggestion:
        u.swapLabels && u.swapLabels.length
          ? `${u.suggestion} Try: ${u.swapLabels.slice(0, 4).join(", ")}.`
          : u.suggestion,
      nodeIds: [u.nodeId],
    });
  }

  const ok = !issues.some((i) => i.severity === "error");

  return {
    ok,
    issues,
    stagesPresent: Array.from(stagesPresent),
    stagesMissing,
    lean: {
      supported: cov.supported,
      unsupported: cov.unsupported,
      total: cov.total,
      ratio: cov.ratio,
      unsupportedNodes,
    },
    questionsNeeded: {
      askExchange: true,
      askSymbol: true,
      askInterval: true,
      askLimit: true,
      askCapital: true,
      askOutputPreference: true,
    },
  };
}

function hasCycle(nodes, edges) {
  const adj = new Map();
  edges.forEach((e) => adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]));
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  nodes.forEach((n) => color.set(n.id, WHITE));

  const dfs = (id) => {
    color.set(id, GRAY);
    for (const t of adj.get(id) ?? []) {
      const c = color.get(t) ?? WHITE;
      if (c === GRAY) return true;
      if (c === WHITE && dfs(t)) return true;
    }
    color.set(id, BLACK);
    return false;
  };

  for (const n of nodes) {
    if ((color.get(n.id) ?? WHITE) === WHITE) {
      if (dfs(n.id)) return true;
    }
  }
  return false;
}
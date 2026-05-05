import React, { useMemo, useState, useEffect } from "react";
import {
  BLOCKS,
  STAGES,
  getBlock,
  isCompatible,
} from "../../blockRegistry";
import { isLeanSupported } from "../../leanMapping";
import { STRATEGY_TEMPLATES } from "../../strategyTemplates";
import {
  Database,
  TrendingUp,
  GitBranch,
  Layers,
  Filter,
  BookOpen,
  Workflow,
  Zap,
  Monitor,
  ChevronDown,
  ChevronRight,
  Lock,
  Search,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";

const ICONS = { Database, TrendingUp, GitBranch, Layers, Filter, BookOpen, Workflow, Zap, Monitor };

const TEMPLATE_CATEGORY_COLORS = {
  Trend: "bg-node-transform/15 text-node-transform border-node-transform/30",
  "Mean Reversion": "bg-node-derived/15 text-node-derived border-node-derived/30",
  Breakout: "bg-node-signal/15 text-node-signal border-node-signal/30",
  Momentum: "bg-node-operator/15 text-node-operator border-node-operator/30",
  Volatility: "bg-node-classifier/15 text-node-classifier border-node-classifier/30",
};

const stageColor = {
  source: "text-node-source", transform: "text-node-transform",
  operator: "text-node-operator", derived: "text-node-derived",
  classifier: "text-node-classifier", rule: "text-node-rule",
  logic: "text-node-logic", signal: "text-node-signal",
  output: "text-node-output",
};

const stageDot = {
  source: "bg-node-source", transform: "bg-node-transform",
  operator: "bg-node-operator", derived: "bg-node-derived",
  classifier: "bg-node-classifier", rule: "bg-node-rule",
  logic: "bg-node-logic", signal: "bg-node-signal",
  output: "bg-node-output",
};

const SINGLE_BLOCK_STAGES = [
  "source", "transform", "operator", "derived",
  "classifier", "rule", "logic", "signal", "output",
];

const CATEGORY_ORDER = [
  "source", "transform", "operator", "derived",
  "classifier", "rule", "logic", "signal", "output",
];

function getPrecedingCategory(cat) {
  const idx = CATEGORY_ORDER.indexOf(cat);
  return idx > 0 ? CATEGORY_ORDER[idx - 1] : null;
}

// Custom comparator – only re-render when node content actually changes
const arePropsEqual = (prevProps, nextProps) => {
  if (prevProps.variant !== nextProps.variant) return false;
  if (prevProps.onLoadTemplate !== nextProps.onLoadTemplate) return false;
  if (prevProps.onSelectBlock !== nextProps.onSelectBlock) return false;
  if (prevProps.report !== nextProps.report) return false;

  const prevSig = prevProps.nodes.map(n => `${n.id}:${n.data?.blockId}`).sort().join('|');
  const nextSig = nextProps.nodes.map(n => `${n.id}:${n.data?.blockId}`).sort().join('|');
  return prevSig === nextSig;
};

const BlockPaletteComponent = ({
  nodes = [],
  onLoadTemplate,
  report,
  onSelectBlock,
  variant = "sidebar",
}) => {
  const [tab, setTab] = useState("blocks");
  const [open, setOpen] = useState("source");
  const [query, setQuery] = useState("");
  const [showIssues, setShowIsses] = useState(false);

  // ── Derive lookup maps ──
  const nodeIdToBlockId = useMemo(() => {
    const map = new Map();
    nodes.forEach((n) => map.set(n.id, n.data.blockId));
    return map;
  }, [nodes]);

  const blockIssueMap = useMemo(() => {
    if (!report) return new Map();
    const map = new Map();
    report.issues.forEach((issue) => {
      if (!issue.nodeIds) return;
      const sev = issue.severity === "error" ? "error" : "warning";
      issue.nodeIds.forEach((nid) => {
        const blockId = nodeIdToBlockId.get(nid);
        if (!blockId) return;
        const existing = map.get(blockId);
        if (!existing || sev === "error") {
          map.set(blockId, {
            severity: sev,
            title: issue.title,
            suggestion: issue.suggestion,
          });
        }
      });
    });
    return map;
  }, [report, nodeIdToBlockId]);

  const categoryIssueCounts = useMemo(() => {
    if (!report) return new Map();
    const map = new Map();
    report.issues.forEach((issue) => {
      if (!issue.stage) return;
      const entry = map.get(issue.stage) ?? { errors: 0, warnings: 0 };
      if (issue.severity === "error") entry.errors++;
      else if (issue.severity === "warning") entry.warnings++;
      map.set(issue.stage, entry);
    });
    return map;
  }, [report]);

  const unsupportedNodeMap = useMemo(() => {
    if (!report) return new Map();
    const map = new Map();
    report.lean.unsupportedNodes.forEach((u) => map.set(u.blockId, u));
    return map;
  }, [report]);

  const upstreamType = useMemo(() => {
    if (!open) return null;
    const prevCat = getPrecedingCategory(open);
    if (!prevCat) return null;
    const prevNodes = nodes.filter(
      (n) => getBlock(n.data?.blockId)?.category === prevCat,
    );
    if (prevNodes.length === 0) return null;
    const lastPrev = prevNodes[prevNodes.length - 1];
    const block = getBlock(lastPrev.data?.blockId);
    return block ? block.outputType : null;
  }, [open, nodes]);

  // Stable signature derived from nodes content
  const nodesSignature = useMemo(
    () => nodes.map((n) => `${n.id}:${n.data?.blockId}`).sort().join("|"),
    [nodes]
  );

  const stagesPresentSet = useMemo(() => {
    const set = new Set();
    nodes.forEach((n) => {
      const b = getBlock(n.data?.blockId);
      if (b) set.add(b.category);
    });
    return set;
  }, [nodesSignature]);

  const stagesPresentKey = useMemo(
    () => Array.from(stagesPresentSet).sort().join(","),
    [stagesPresentSet]
  );

  const nextSingleStage = useMemo(() => {
    for (const s of STAGES) {
      if (SINGLE_BLOCK_STAGES.includes(s.key) && !stagesPresentSet.has(s.key))
        return s.key;
    }
    return null;
  }, [stagesPresentSet]);

  const isStageLocked = (cat) =>
    SINGLE_BLOCK_STAGES.includes(cat) && stagesPresentSet.has(cat);
  const isStageActive = (cat) => cat === nextSingleStage;

const nextOpenKey = useMemo(() => {
  const firstUnlocked = STAGES.find(
    (s) => !(SINGLE_BLOCK_STAGES.includes(s.key) && stagesPresentSet.has(s.key))
   );
   return firstUnlocked?.key ?? null;
 }, [stagesPresentKey]);

 useEffect(() => {
  if (query.trim()) return;
  setOpen((prev) => (prev !== nextOpenKey ? nextOpenKey : prev));
 }, [nextOpenKey, query]);

  const filteredAll = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return BLOCKS;
    return BLOCKS.filter(
      (b) =>
        b.label.toLowerCase().includes(q) ||
        b.group.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q)),
    );
  }, [query]);

  const groupedByCategoryAndGroup = useMemo(() => {
    const map = new Map();
    filteredAll.forEach((block) => {
      const cat = block.category;
      if (!map.has(cat)) map.set(cat, new Map());
      const groups = map.get(cat);
      const group = block.group || "Other";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(block);
    });
    return map;
  }, [filteredAll]);

  const onDragStart = (e, blockId) => {
    e.dataTransfer.setData("application/reactflow", blockId);
    e.dataTransfer.effectAllowed = "move";
  };

  const countByCategory = (cat) =>
    BLOCKS.filter((b) => b.category === cat).length;

  const filteredTemplates = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return STRATEGY_TEMPLATES;
    return STRATEGY_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }, [query]);

  const errorCount = report
    ? report.issues.filter((i) => i.severity === "error").length
    : 0;
  const warningCount = report
    ? report.issues.filter((i) => i.severity === "warning").length
    : 0;

  const orderedIssues = useMemo(() => {
    if (!report) return [];
    return [...report.issues].sort((a, b) =>
      a.severity === "error" && b.severity !== "error"
        ? -1
        : a.severity !== "error" && b.severity === "error"
        ? 1
        : 0
    );
  }, [report]);

  const Container = variant === "sidebar" ? "aside" : "div";
  const containerClass =
    variant === "sidebar"
      ? "w-72 border-r border-border bg-card/40 backdrop-blur flex flex-col h-full hidden md:flex"
      : "w-full h-full bg-card/40 flex flex-col";

  return (
    <Container className={containerClass}>
      {/* ── Header ── */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          {tab === "blocks" ? "Block Library" : "Strategy Templates"}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tab === "blocks" ? "Drag blocks onto canvas" : "Load a ready-made strategy"}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-1 p-1 rounded-md bg-secondary/60 border border-border">
          <button
            onClick={() => setTab("blocks")}
            className={`h-7 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              tab === "blocks"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3 h-3" />
            Blocks
          </button>
          <button
            onClick={() => setTab("templates")}
            className={`h-7 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              tab === "templates"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutTemplate className="w-3 h-3" />
            Templates
            <span className="text-[9px] tabular-nums opacity-70">{STRATEGY_TEMPLATES.length}</span>
          </button>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "blocks" ? "Search blocks…" : "Search templates…"}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* ── TEMPLATES TAB ── */}
      {tab === "templates" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTemplates.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-8">
              No templates match "{query}"
            </div>
          )}
          {filteredTemplates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onLoadTemplate?.(tpl)}
              disabled={!onLoadTemplate}
              className="w-full text-left p-3 rounded-lg border border-border bg-card/50 hover:border-primary/50 hover:bg-card transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-xs font-semibold text-foreground truncate">{tpl.name}</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-bold flex-shrink-0">
                  {tpl.source}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mb-2 line-clamp-2">
                {tpl.tagline}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-bold ${
                    TEMPLATE_CATEGORY_COLORS[tpl.category]
                  }`}
                >
                  {tpl.category}
                </span>
                <span className="text-[9px] text-muted-foreground tabular-nums">
                  {tpl.nodes.length} blocks · {tpl.edges.length} links
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── BLOCKS TAB ── */}
      {tab === "blocks" && (
        <div className="flex-1 overflow-y-auto py-2">
          {STAGES.map((stage) => {
            const Icon = ICONS[stage.icon];
            const isOpen = open === stage.key;
            const catGroups = groupedByCategoryAndGroup.get(stage.key);
            const filteredCount = catGroups
              ? Array.from(catGroups.values()).reduce((acc, arr) => acc + arr.length, 0)
              : 0;

            if (query.trim() && filteredCount === 0) return null;

            const locked = isStageLocked(stage.key);
            const active = isStageActive(stage.key);

            return (
              <div key={stage.key} className={`border-b border-border/50 ${locked ? "opacity-40" : ""}`}>
                <button
                  onClick={() => {
                    if (locked) return;
                    setOpen(isOpen ? null : stage.key);
                  }}
                  disabled={locked}
                  aria-disabled={locked}
                  title={
                    locked && stagesPresentSet.has(stage.key)
                      ? "Category already used (max 1 block)"
                      : locked
                      ? `Locked · complete previous stage first`
                      : active
                      ? "Next stage — add a block"
                      : undefined
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors group ${
                    locked ? "cursor-not-allowed" : "hover:bg-secondary/40 cursor-pointer"
                  } ${active ? "bg-primary/5" : ""}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stageDot[stage.key]} text-background flex-shrink-0 ${
                      locked ? "grayscale" : ""
                    }`}
                  >
                    {stage.number}
                  </span>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${stageColor[stage.key]}`} />
                  <span className="flex-1 text-left text-sm font-semibold text-foreground leading-tight flex items-center gap-1.5">
                    {stage.label}
                    {active && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                        Next
                      </span>
                    )}
                  </span>
                  {locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  {!locked && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {query.trim() ? filteredCount : countByCategory(stage.key)}
                    </span>
                  )}
                  {!locked &&
                    (isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    ))}
                </button>

                {isOpen && !locked && catGroups && (
                  <div className="pb-1">
                    {Array.from(catGroups.entries()).map(([groupName, blocks]) => (
                      <div key={groupName} className="mb-1">
                        <div className="pl-12 pr-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {groupName}
                        </div>
                        {blocks.map((b) => {
                          let warningText;
                          if (b.acceptsInputTypes.length > 0 && upstreamType) {
                            if (!isCompatible(b, upstreamType)) {
                              warningText = `May not connect to "${upstreamType}" from previous stage.`;
                            }
                          }

                          const hasLean = isLeanSupported(b.id);

                          return (
                            <div
                              key={b.id}
                              draggable={!warningText}
                              onDragStart={(e) => onDragStart(e, b.id)}
                              onClick={() => {
                                if (warningText || !onSelectBlock) return;
                                onSelectBlock(b.id);
                              }}
                              role={onSelectBlock ? "button" : undefined}
                              className={`flex items-center gap-3 pl-14 pr-4 py-1.5 transition-colors group ${
                                warningText
                                  ? "opacity-70 cursor-grab"
                                  : onSelectBlock
                                  ? "cursor-pointer hover:bg-secondary/40 active:bg-secondary/60"
                                  : "cursor-grab active:cursor-grabbing hover:bg-secondary/40"
                              }`}
                              title={warningText ?? (onSelectBlock ? "Tap to add to canvas" : undefined)}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${stageDot[b.category]}`} />
                              <span className="flex-1 text-sm text-foreground/90 group-hover:text-foreground truncate">
                                {b.label}
                              </span>
                              {hasLean ? (
                                <span className="text-[9px] font-bold tracking-wider px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  LEAN
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold tracking-wider px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  N/A
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="px-4 py-3 border-t border-border text-[10px] uppercase tracking-wider text-muted-foreground text-center">
        {tab === "templates"
          ? `${filteredTemplates.length} template${filteredTemplates.length === 1 ? "" : "s"}`
          : query.trim()
          ? `Results · ${filteredAll.length} blocks`
          : report && errorCount > 0
          ? `⚠ ${errorCount} errors · ${warningCount} warnings`
          : report && warningCount > 0
          ? `${warningCount} warnings`
          : nextSingleStage
          ? `Next: ${nextSingleStage}`
          : "All single-block stages complete"}
      </div>
    </Container>
  );
};

export const BlockPalette = React.memo(BlockPaletteComponent, arePropsEqual);
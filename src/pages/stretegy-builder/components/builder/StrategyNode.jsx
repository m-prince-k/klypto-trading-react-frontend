import { memo, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { getBlock } from "../../blockRegistry";

const categoryStyles = {
  source: {
    ring: "ring-node-source/40",
    dot: "bg-node-source",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-source)/0.6)]",
  },
  transform: {
    ring: "ring-node-transform/40",
    dot: "bg-node-transform",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-transform)/0.6)]",
  },
  operator: {
    ring: "ring-node-operator/40",
    dot: "bg-node-operator",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-operator)/0.6)]",
  },
  derived: {
    ring: "ring-node-derived/40",
    dot: "bg-node-derived",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-derived)/0.6)]",
  },
  classifier: {
    ring: "ring-node-classifier/40",
    dot: "bg-node-classifier",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-classifier)/0.6)]",
  },
  rule: {
    ring: "ring-node-rule/40",
    dot: "bg-node-rule",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-rule)/0.6)]",
  },
  logic: {
    ring: "ring-node-logic/40",
    dot: "bg-node-logic",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-logic)/0.6)]",
  },
  signal: {
    ring: "ring-node-signal/40",
    dot: "bg-node-signal",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-signal)/0.6)]",
  },
  output: {
    ring: "ring-node-output/40",
    dot: "bg-node-output",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--node-output)/0.6)]",
  },
};

const StrategyNode = ({ id, data, selected }) => {
  const { setNodes, deleteElements } = useReactFlow();
  const block = getBlock(data.blockId);
  if (!block) return null;
  const style = categoryStyles[block.category];

  const issueGlow =
    data.hasIssue === "error"
      ? "ring-2 ring-[hsl(var(--destructive)/0.7)] shadow-[0_0_16px_-4px_hsl(var(--destructive)/0.6)]"
      : data.hasIssue === "warning"
      ? "ring-2 ring-[hsl(var(--warning)/0.6)] shadow-[0_0_16px_-4px_hsl(var(--warning)/0.4)]"
      : "";

  const handleValueChange = useCallback(
    (key, value) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                values: {
                  ...(node.data.values || {}),
                  [key]: value,
                },
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const handleRemoveNode = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  const issueRing =
    data.hasIssue === "error"
      ? "ring-2 ring-red-500/70 shadow-[0_0_16px_-4px_rgba(239,68,68,0.6)]"
      : data.hasIssue === "warning"
      ? "ring-2 ring-yellow-500/70 shadow-[0_0_16px_-4px_rgba(234,179,8,0.6)]"
      : "";

  return (
    <div
      className={`min-w-[180px] rounded-xl bg-card border border-border ${
        style.glow
      } ${selected ? `ring-2 ${style.ring}` : ""} transition-all ${issueRing} ${issueGlow}`}
    >
      {/* Input handles */}
      {Array.from({ length: block.inputs }).map((_, i) => (
        <Handle
          key={`in-${i}`}
          type="target"
          position={Position.Left}
          id={`in-${i}`}
          style={{ top: `${30 + i * 18}px` }}
        />
      ))}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {block.category}
          </span>
          {block.category.toLowerCase() !== block.group.toLowerCase() && (
            <>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {" | "}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {block.group}
              </span>
            </>
          )}
        </div>
        <button
          onClick={handleRemoveNode}
          className="nodrag w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove node"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <div className="text-sm font-semibold text-foreground">
          {block.label}
        </div>
        {block.description && (
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {block.description}
          </div>
        )}

        {/* Field rendering */}
        {block.fields?.map((f) => {
          const currentValue =
            data.values?.[f.key] !== undefined
              ? data.values?.[f.key]
              : f.default;

          if (f.type === "select") {
            return (
              <div key={f.key} className="flex items-center gap-2 mt-1.5">
                <label className="text-[10px] text-muted-foreground flex-1">
                  {f.label}
                </label>
                <select
                  value={String(currentValue)}
                  onChange={(e) => handleValueChange(f.key, e.target.value)}
                  className="w-20 h-6 text-xs px-1 rounded bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary nodrag"
                >
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // f.type === "number"
          const numValue =
            typeof currentValue === "number"
              ? currentValue
              : Number(currentValue) || 0;

          return (
            <div key={f.key} className="flex items-center gap-2 mt-1.5">
              <label className="text-[10px] text-muted-foreground flex-1">
                {f.label}
              </label>
              <input
                type="number"
                value={numValue}
                onChange={(e) =>
                  handleValueChange(f.key, e.target.valueAsNumber || 0)
                }
                step="any"
                className="w-16 h-6 text-xs px-2 rounded bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary nodrag"
              />
            </div>
          );
        })}
      </div>

      {/* Output handles */}
      {Array.from({ length: block.outputs }).map((_, i) => (
        <Handle
          key={`out-${i}`}
          type="source"
          position={Position.Right}
          id={`out-${i}`}
          style={{ top: `${30 + i * 18}px` }}
        />
      ))}
    </div>
  );
};

export default memo(StrategyNode);
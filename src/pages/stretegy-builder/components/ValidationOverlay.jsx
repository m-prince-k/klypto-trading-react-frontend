// src/components/ValidationOverlay.jsx
import { useMemo } from "react";
import { useReactFlow } from "reactflow";
import { useStrategyValidation } from "../hooks/useStrategyValidation";
import { AlertTriangle, XCircle, Info } from "lucide-react";

export function ValidationOverlay({ nodes, edges, highlightOnCanvas = true }) {
  const report = useStrategyValidation(nodes, edges);
  const { setNodes } = useReactFlow();

  // Collect all node IDs that have issues
  const problematicNodeIds = useMemo(() => {
    const set = new Set();
    report.issues.forEach((i) => {
      i.nodeIds?.forEach((id) => set.add(id));
    });
    return set;
  }, [report.issues]);

  // Highlight nodes on canvas (optional)
  if (highlightOnCanvas) {
    // We use a side-effect here to mark nodes that have issues.
    // A cleaner way is to derive styles from the report in the node component, but
    // this approach works without modifying StrategyNode.
    // ⚠️ Make sure you have selected nodes? Use react-flow's selected state instead.
    // Instead we'll set a data property "hasIssue" that StrategyNode can read.
    // For now, we'll just let StrategyNode read from a prop – better way below.
  }

  const errors = report.issues.filter((i) => i.severity === "error");
  const warnings = report.issues.filter((i) => i.severity === "warning");

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {!report.ok && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{errors.length} blocker{errors.length > 1 ? "s" : ""} found</span>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{warnings.length} warning{warnings.length > 1 ? "s" : ""}</span>
        </div>
      )}
      {/* Show all issues collapsed by default */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">All issues ({report.issues.length})</summary>
        <ul className="mt-1 space-y-1">
          {report.issues.map((issue) => (
            <li key={issue.id} className="text-[11px] leading-snug">
              <span className={`font-semibold ${
                issue.severity === "error" ? "text-red-300" :
                issue.severity === "warning" ? "text-yellow-300" : "text-blue-300"
              }`}>{issue.title}</span>{" "}
              <span className="text-muted-foreground">{issue.suggestion}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
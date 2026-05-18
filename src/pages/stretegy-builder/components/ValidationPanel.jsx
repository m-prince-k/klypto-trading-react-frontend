import { useState } from "react";
import { XCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronRight } from "lucide-react";

export function ValidationPanel({ report, visible }) {
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  const errors = report.issues.filter((i) => i.severity === "error");
  const warnings = report.issues.filter((i) => i.severity === "warning");

  return (
    <div className="w-64 border-l border-border bg-card/40 backdrop-blur flex flex-col h-full text-xs">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Strategy Check</h3>
          <span className="text-[10px] text-muted-foreground">
            {errors.length + warnings.length} issue{(errors.length + warnings.length) !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-secondary/40 text-muted-foreground"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Summary stats */}
      <div className="p-2 flex gap-2 border-b border-border">
        <div className="flex-1 rounded bg-red-500/10 border border-red-500/30 px-2 py-1.5 flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="text-red-300 font-medium">{errors.length} error{errors.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex-1 rounded bg-yellow-500/10 border border-yellow-500/30 px-2 py-1.5 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="text-yellow-300 font-medium">{warnings.length} warning{warnings.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Issue list (expandable) */}
      {expanded && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {report.issues.length === 0 && (
            <div className="text-[11px] text-muted-foreground text-center py-4">
              No issues detected
            </div>
          )}
          {[...errors, ...warnings].map((issue) => (
            <div
              key={issue.id}
              className={`rounded p-2 border ${
                issue.severity === "error"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-yellow-500/10 border-yellow-500/30"
              }`}
            >
              <div className="flex items-start gap-1.5">
                {issue.severity === "error" ? (
                  <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-[11px]">{issue.title}</div>
                  <div className="text-muted-foreground text-[10px] mt-0.5">{issue.detail}</div>
                  <div className="mt-1 flex items-start gap-1 text-[10px] bg-primary/10 border border-primary/30 rounded px-1.5 py-1">
                    <Lightbulb className="w-3 h-3 text-primary mt-px shrink-0" />
                    <span>
                      <b className="text-primary">Fix:</b> {issue.suggestion}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer – LEAN coverage quick view */}
      <div className="p-2 border-t border-border text-[10px]">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>LEAN coverage</span>
          <span className="font-medium text-foreground">
            {report.lean.supported}/{report.lean.total} mapped
          </span>
        </div>
        <div className="h-1 mt-1 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-emerald-500/70"
            style={{ width: `${report.lean.ratio * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
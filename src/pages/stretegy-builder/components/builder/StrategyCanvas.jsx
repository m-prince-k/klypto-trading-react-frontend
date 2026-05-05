import { useCallback, useRef, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from "reactflow";
import StrategyNode from "./StrategyNode";
import { BlockPalette } from "./BlockPalette";
import { BLOCKS, getBlock, isCompatible } from "../../blockRegistry";
import { Play, Trash2, Save, Zap, FlaskConical, Lightbulb, Undo2, Redo2, Library } from "lucide-react";
import { toast } from "sonner";
import { DryRunPanel } from "./DryRunPanel";
import { materializeTemplate } from "../../strategyTemplates";
import { useStrategyValidation } from "../../hooks/useStrategyValidation";
import { ValidationPanel } from "../ValidationPanel";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet";
import { useIsMobile } from "../../hooks/use-mobile";

const nodeTypes = { strategy: StrategyNode };

let idCounter = 1;
const newId = () => `n_${idCounter++}`;

const initialNodes = [
  { id: newId(), type: "strategy", position: { x: 40, y: 220 }, data: { blockId: "src_close" } },
  { id: newId(), type: "strategy", position: { x: 280, y: 120 }, data: { blockId: "ind_ema", values: { period: 20 } } },
  { id: newId(), type: "strategy", position: { x: 520, y: 220 }, data: { blockId: "op_gt" } },
  { id: newId(), type: "strategy", position: { x: 760, y: 220 }, data: { blockId: "der_boolean" } },
  { id: newId(), type: "strategy", position: { x: 1000, y: 220 }, data: { blockId: "cls_bullish" } },
  { id: newId(), type: "strategy", position: { x: 1240, y: 220 }, data: { blockId: "rule_entry" } },
  { id: newId(), type: "strategy", position: { x: 1480, y: 220 }, data: { blockId: "logic_and" } },
  { id: newId(), type: "strategy", position: { x: 1720, y: 220 }, data: { blockId: "sig_buy" } },
  { id: newId(), type: "strategy", position: { x: 1960, y: 220 }, data: { blockId: "out_overlay" } },
];

const initialEdges = [
  { id: "e1", source: "n_1", target: "n_2", targetHandle: "in-0", animated: true },
  { id: "e2", source: "n_2", target: "n_3", targetHandle: "in-0", animated: true },
  { id: "e3", source: "n_3", target: "n_4", targetHandle: "in-0", animated: true },
  { id: "e4", source: "n_4", target: "n_5", targetHandle: "in-0", animated: true },
  { id: "e5", source: "n_5", target: "n_6", targetHandle: "in-0", animated: true },
  { id: "e6", source: "n_6", target: "n_7", targetHandle: "in-0", animated: true },
  { id: "e7", source: "n_7", target: "n_8", targetHandle: "in-0", animated: true },
  { id: "e8", source: "n_8", target: "n_9", targetHandle: "in-0", animated: true },
];

const CATEGORY_ORDER = [
  "source", "transform", "operator", "derived",
  "classifier", "rule", "logic", "signal", "output",
];

function getPrecedingCategory(cat) {
  const idx = CATEGORY_ORDER.indexOf(cat);
  return idx > 0 ? CATEGORY_ORDER[idx - 1] : null;
}

 function InnerCanvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const fitSoon = useCallback(
    (padding = 0.2) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fitView({ padding, duration: 400 });
        });
      });
    },
    [fitView]
  );
  const [selected, setSelected] = useState(null);
  const [dryRunOpen, setDryRunOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isMobile = useIsMobile();

  // History (undo/redo)
  const past = useRef([]);
  const future = useRef([]);
  const skipNextHistory = useRef(false);
  const lastSnapshot = useRef({ nodes: initialNodes, edges: initialEdges });

  const pushHistory = useCallback(() => {
    past.current.push({
      nodes: lastSnapshot.current.nodes,
      edges: lastSnapshot.current.edges,
    });
    if (past.current.length > 100) past.current.shift();
    future.current = [];
  }, []);

  useEffect(() => {
    lastSnapshot.current = { nodes, edges };
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.current.length === 0) {
      toast("Nothing to undo");
      return;
    }
    const prev = past.current.pop();
    future.current.push({ nodes: lastSnapshot.current.nodes, edges: lastSnapshot.current.edges });
    skipNextHistory.current = true;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    toast("Undo");
    fitSoon();
  }, [setNodes, setEdges, fitSoon]);

  const redo = useCallback(() => {
    if (future.current.length === 0) {
      toast("Nothing to redo");
      return;
    }
    const next = future.current.pop();
    past.current.push({ nodes: lastSnapshot.current.nodes, edges: lastSnapshot.current.edges });
    skipNextHistory.current = true;
    setNodes(next.nodes);
    setEdges(next.edges);
    toast("Redo");
    fitSoon();
  }, [setNodes, setEdges, fitSoon]);

  const report = useStrategyValidation(nodes, edges);

// Keep a ref to the last issue signature to avoid spurious setNodes calls
const lastIssueSignature = useRef("");

useEffect(() => {
  const issueMap = new Map();
  report.issues.forEach((i) => {
    const severity = i.severity === "error" ? "error" : "warning";
    i.nodeIds?.forEach((id) => {
      if (!issueMap.has(id) || issueMap.get(id) !== "error") {
        issueMap.set(id, severity);
      }
    });
  });

  // Build a stable signature; skip setNodes if nothing changed
  const signature = Array.from(issueMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, sev]) => `${id}:${sev}`)
    .join("|");

  if (signature === lastIssueSignature.current) return;
  lastIssueSignature.current = signature;

  setNodes((nds) =>
    nds.map((node) => {
      const next = issueMap.get(node.id) ?? null;
      if (node.data?.hasIssue === next) return node;
      return { ...node, data: { ...node.data, hasIssue: next } };
    })
  );
}, [report, setNodes]);

  const onConnect = useCallback(
    (params) => {
      const curNodes = lastSnapshot.current.nodes;
      const sourceNode = curNodes.find((n) => n.id === params.source);
      const targetNode = curNodes.find((n) => n.id === params.target);
      if (!sourceNode || !targetNode) return;

      const sourceBlock = getBlock(sourceNode.data?.blockId);
      const targetBlock = getBlock(targetNode.data?.blockId);
      if (!sourceBlock || !targetBlock) return;

      if (targetBlock.acceptsInputTypes.length > 0) {
        if (!isCompatible(targetBlock, sourceBlock.outputType)) {
          console.warn(
            `Connection refused: ${targetBlock.label} cannot accept ${sourceBlock.outputType}`
          );
          return;
        }
      }

      pushHistory();
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
          eds
        )
      );
    },
    [setEdges, pushHistory]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const placeBlock = useCallback(
    (blockId, position) => {
      const block = getBlock(blockId);
      if (!block) return;

      const nds = lastSnapshot.current.nodes;

      const alreadyHasCategory = nds.some(
        (n) => getBlock(n.data?.blockId)?.category === block.category
      );
      if (alreadyHasCategory) {
        toast.error(`Only one ${block.category} block allowed.`);
        return;
      }

      const precedingCat = getPrecedingCategory(block.category);
      let prevNode;
      if (precedingCat) {
        const prevNodes = nds.filter((n) => getBlock(n.data?.blockId)?.category === precedingCat);
        prevNode = prevNodes[prevNodes.length - 1];
      }

      if (precedingCat && block.acceptsInputTypes.length > 0 && prevNode) {
        const prevBlock = getBlock(prevNode.data.blockId);
        if (prevBlock && !isCompatible(block, prevBlock.outputType)) {
          toast.error(
            `${block.label} can't accept "${prevBlock.outputType}" from ${prevBlock.label}.`
          );
          return;
        }
      }

      const finalPos =
        position ??
        (prevNode
          ? { x: prevNode.position.x + 240, y: prevNode.position.y }
          : { x: 80, y: 220 });

      const initialValues = {};
      block.fields?.forEach((f) => {
        initialValues[f.key] = f.default ?? (f.type === "number" ? 0 : "");
      });

      const newNode = {
        id: newId(),
        type: "strategy",
        position: finalPos,
        data: { blockId, values: initialValues, label: block.label },
      };

      pushHistory();
      setNodes((cur) => cur.concat(newNode));

      if (prevNode && block.acceptsInputTypes.length > 0) {
        const prevBlock = getBlock(prevNode.data.blockId);
        if (prevBlock && isCompatible(block, prevBlock.outputType)) {
          const newEdge = {
            id: `e-${prevNode.id}-${newNode.id}`,
            source: prevNode.id,
            target: newNode.id,
            targetHandle: "in-0",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          };
          setEdges((eds) => addEdge(newEdge, eds));
        }
      }

      toast.success(`Added ${block.label}`);
      fitSoon();
    },
    [setNodes, setEdges, pushHistory, fitSoon]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const blockId = e.dataTransfer.getData("application/reactflow");
      if (!blockId) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      placeBlock(blockId, position);
    },
    [screenToFlowPosition, placeBlock]
  );

  const handleSelectFromPalette = useCallback(
    (blockId) => {
      placeBlock(blockId);
      if (isMobile) setPaletteOpen(false);
    },
    [placeBlock, isMobile]
  );

  const handleRun = () => {
    const sigCount = nodes.filter((n) => getBlock(n.data.blockId)?.category === "signal").length;
    const outCount = nodes.filter((n) => getBlock(n.data.blockId)?.category === "output").length;
    if (sigCount === 0 || outCount === 0) {
      toast.error("Strategy needs at least one Signal and one Output");
      return;
    }
    toast.success(`Strategy compiled · ${nodes.length} blocks · ${edges.length} connections`);
  };

  const handleClear = () => {
    pushHistory();
    setNodes([]);
    setEdges([]);
    toast("Canvas cleared");
  };

  const handleDeleteSelected = useCallback(() => {
    if (!selected) return;
    pushHistory();
    setNodes((nds) => nds.filter((n) => n.id !== selected.id));
    setEdges((eds) => eds.filter((e) => e.source !== selected.id && e.target !== selected.id));
    setSelected(null);
    fitSoon();
  }, [selected, pushHistory, setNodes, setEdges, fitSoon]);

  const handleLoadTemplate = useCallback(
    (tpl) => {
      pushHistory();
      const { nodes: tplNodes, edges: tplEdges, nextCounter } = materializeTemplate(tpl, idCounter);
      idCounter = nextCounter;
      setNodes(tplNodes);
      setEdges(tplEdges);
      setSelected(null);
      if (isMobile) setPaletteOpen(false);
      toast.success(`Loaded template · ${tpl.name}`);
      fitSoon(0.15);
    },
    [setNodes, setEdges, pushHistory, isMobile, fitSoon]
  );

  useEffect(() => {
    const onKey = (e) => {
      const tgt = e.target;
      const tag = tgt?.tagName;
      const editing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (tgt && tgt.isContentEditable);
      if (editing) return;

      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, selected, handleDeleteSelected]);

  return (
    <>
    <style>{`
        :root {
          --background: 230 25% 7%;
          --foreground: 210 40% 98%;

          --card: 230 22% 10%;
          --card-foreground: 210 40% 98%;

          --primary: 152 76% 50%;
          --primary-foreground: 230 25% 7%;
          --primary-glow: 152 90% 60%;

          --border: 230 18% 18%;
          --radius: 0.75rem;

          --gradient-bg: radial-gradient(ellipse at top, hsl(230 30% 12%), hsl(230 25% 6%));
          --shadow-node: 0 8px 24px -8px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(var(--border));
          --shadow-glow: 0 0 32px -4px hsl(var(--primary) / 0.4);
        }

        body {
          background: var(--gradient-bg);
          color: hsl(var(--foreground));
          font-family: Inter, system-ui, sans-serif;
        }

        /* React Flow overrides */
        .react-flow__background { background: transparent; }

        .react-flow__edge-path {
          stroke: hsl(var(--primary) / 0.6);
          stroke-width: 2;
        }

        .react-flow__edge.selected .react-flow__edge-path {
          stroke: hsl(var(--primary));
          stroke-width: 3;
        }

        .react-flow__handle {
          width: 10px;
          height: 10px;
          background: hsl(var(--background));
          border: 2px solid hsl(var(--primary));
        }

        .react-flow__handle:hover {
          background: hsl(var(--primary));
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
        }

        .react-flow__controls {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          overflow: hidden;
        }

        .react-flow__controls-button {
          background: hsl(var(--card));
          border-bottom: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
        }

        .react-flow__controls-button:hover {
          background: hsl(var(--secondary));
        }

        .react-flow__minimap {
          background: hsl(var(--card)) !important;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
        }

        .react-flow__attribution { display: none; }
      `}</style>
    <div className="flex h-screen overflow-hidden">
      {!isMobile && (
        <BlockPalette
          nodes={nodes}
          onLoadTemplate={handleLoadTemplate}
          report={report}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-3 md:px-5 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {isMobile && (
              <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
                <SheetTrigger asChild>
                  <button
                    className="h-9 w-9 rounded-md bg-secondary hover:bg-secondary/70 flex items-center justify-center flex-shrink-0"
                    aria-label="Open block library"
                  >
                    <Library className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="h-[80vh] p-0 flex flex-col rounded-t-xl"
                >
                  <SheetHeader className="p-3 border-b border-border">
                    <SheetTitle className="text-sm">Block Library</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-hidden">
                    <BlockPalette
                      nodes={nodes}
                      onLoadTemplate={handleLoadTemplate}
                      onSelectBlock={handleSelectFromPalette}
                      report={report}
                      variant="embedded"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground leading-tight truncate">QuantForge</h1>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">No-Code Quant Strategy Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={undo}
              title="Undo (Ctrl/Cmd+Z)"
              className="h-8 w-8 md:w-auto md:px-3 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Undo</span>
            </button>
            <button
              onClick={redo}
              title="Redo (Ctrl/Cmd+Shift+Z)"
              className="h-8 w-8 md:w-auto md:px-3 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Redo</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={!selected}
              title="Delete selected (Del)"
              className="h-8 w-8 md:w-auto md:px-3 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Delete</span>
            </button>
            <button
              onClick={handleClear}
              className="hidden md:flex h-8 px-3 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 text-foreground transition-colors items-center"
            >
              Clear
            </button>
            <button
              onClick={() => toast.success("Strategy saved")}
              className="hidden md:flex h-8 px-3 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 text-foreground transition-colors items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              onClick={() => setDryRunOpen(true)}
              className="h-8 px-2 md:px-3 rounded-md text-xs font-semibold border border-primary/40 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dry-Run</span>
            </button>
            <button
              onClick={handleRun}
              className="h-8 px-3 md:px-4 rounded-md text-xs font-semibold bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Run</span>
            </button>
          </div>
        </header>

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={({ nodes }) => setSelected(nodes[0] ?? null)}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{ animated: true, markerEnd: { type: MarkerType.ArrowClosed } }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
            <Controls />
            {!isMobile && (
              <MiniMap
                nodeColor={(n) => {
                  const b = getBlock(n.data.blockId);
                  return b ? `hsl(var(--node-${b.category}))` : "hsl(var(--muted))";
                }}
                maskColor="hsl(var(--background) / 0.8)"
              />
            )}
          </ReactFlow>

          <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none max-w-[60%]">
            <div className="px-3 py-1.5 rounded-md bg-card/80 backdrop-blur border border-border text-[11px]">
              <span className="text-muted-foreground">Blocks </span>
              <span className="text-foreground font-semibold">{nodes.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-card/80 backdrop-blur border border-border text-[11px]">
              <span className="text-muted-foreground">Connections </span>
              <span className="text-foreground font-semibold">{edges.length}</span>
            </div>
            <div className="hidden md:block px-3 py-1.5 rounded-md bg-card/80 backdrop-blur border border-border text-[11px]">
              <span className="text-muted-foreground">Library </span>
              <span className="text-foreground font-semibold">{BLOCKS.length}</span>
            </div>
          </div>

          {nodes.length > 0 && !isMobile && (
            <button
              onClick={() => setShowValidation(!showValidation)}
              className="absolute top-4 right-4 z-10 h-8 px-3 rounded-md text-xs font-medium bg-card/80 backdrop-blur border border-border hover:bg-secondary/40 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              {showValidation ? "Hide issues" : "Show issues"}
            </button>
          )}
        </div>
      </div>

      {nodes.length > 0 && showValidation && !isMobile && (
        <ValidationPanel report={report} visible={true} />
      )}

      <DryRunPanel open={dryRunOpen} onOpenChange={setDryRunOpen} nodes={nodes} edges={edges} />
    </div>
    </>
  );
}

export default function StrategyCanvas() {
  return (
    <ReactFlowProvider>
      <InnerCanvas />
    </ReactFlowProvider>
  );
}
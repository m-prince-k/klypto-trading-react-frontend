import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { runDryRun } from "../../dryRun";
import { validateStrategy } from "../../strategyValidator";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Scatter,
  AreaChart,
  Area,
} from "recharts";
import {
  Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  XCircle, Lightbulb, ArrowRight, ArrowLeft, RotateCcw, Wand2,
} from "lucide-react";
import { toast } from "sonner";

const BINANCE_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "AVAXUSDT"];
const DELTA_SYMBOLS = ["BTCUSD", "ETHUSD", "SOLUSD"];
const INTERVALS = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];

export const DryRunPanel = ({ open, onOpenChange, nodes, edges }) => {
  const [step, setStep] = useState("validate");
  const [report, setReport] = useState(null);

  // Config state — populated step by step.
  const [exchange, setExchange] = useState("binance");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("15m");
  const [limit, setLimit] = useState(300);
  const [capital, setCapital] = useState(10000);
  const [feeBps, setFeeBps] = useState(10);
  const [outputPref, setOutputPref] = useState("all");

  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState(null);

  // Re-validate every time the dialog is opened.
  useEffect(() => {
    if (open) {
      const r = validateStrategy(nodes, edges);
      setReport(r);
      setStep("validate");
      setResult(null);
      setRunError(null);
    }
  }, [open, nodes, edges]);

  const handleExchangeChange = (e) => {
    setExchange(e);
    setSymbol(e === "binance" ? "BTCUSDT" : "BTCUSD");
  };

  const proceedFromValidate = () => {
    if (!report) return;
    if (!report.ok) {
      toast.error("Fix the highlighted issues before running.");
      return;
    }
    setStep("configure");
  };

  const run = async () => {
    setStep("running");
    setRunError(null);
    setResult(null);
    try {
      const cfg = { exchange, symbol, interval, limit, capital, feeBps };
      const res = await runDryRun(nodes, edges, cfg);
      setResult(res);
      setStep("result");
      toast.success(
        `Done · ${res.summary.trades} trades · ${res.summary.pnlPct >= 0 ? "+" : ""}${res.summary.pnlPct.toFixed(2)}% P&L`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRunError(msg);
      setStep("result");
      toast.error("Dry-run failed — see suggestion in panel.");
    }
  };

  const restart = () => {
    setStep("validate");
    setResult(null);
    setRunError(null);
    if (open) setReport(validateStrategy(nodes, edges));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Dry-Run · Paper Trading
            <span className="text-[11px] font-normal text-muted-foreground ml-2">
              Public Binance / Delta data · No real orders
            </span>
          </DialogTitle>
        </DialogHeader>

        <Stepper step={step} />

        {step === "validate" && report && (
          <ValidateStep report={report} onNext={proceedFromValidate} onRecheck={restart} />
        )}

        {step === "configure" && (
          <ConfigureStep
            exchange={exchange} setExchange={handleExchangeChange}
            symbol={symbol} setSymbol={setSymbol}
            interval={interval} setInterval={setInterval}
            limit={limit} setLimit={setLimit}
            capital={capital} setCapital={setCapital}
            feeBps={feeBps} setFeeBps={setFeeBps}
            onBack={() => setStep("validate")}
            onNext={() => setStep("output")}
          />
        )}

        {step === "output" && (
          <OutputStep
            outputPref={outputPref}
            setOutputPref={setOutputPref}
            onBack={() => setStep("configure")}
            onRun={run}
          />
        )}

        {step === "running" && <RunningStep symbol={symbol} interval={interval} limit={limit} />}

        {step === "result" && (
          <ResultStep
            result={result}
            error={runError}
            outputPref={outputPref}
            symbol={symbol}
            interval={interval}
            onBack={restart}
            onRerun={run}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ─────────── Stepper ─────────── */

const STEPS = [
  { key: "validate", label: "Validate" },
  { key: "configure", label: "Market Data" },
  { key: "output", label: "Output" },
  { key: "result", label: "Results" },
];

const Stepper = ({ step }) => {
  const activeIdx = STEPS.findIndex((s) => s.key === step) === -1
    ? (step === "running" ? 3 : 0)
    : STEPS.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center gap-2 px-1 py-2">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2 flex-1">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold border ${
              i < activeIdx
                ? "bg-primary/20 border-primary text-primary"
                : i === activeIdx
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_-4px_hsl(var(--primary))]"
                : "bg-secondary/40 border-border text-muted-foreground"
            }`}
          >
            {i < activeIdx ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`text-[11px] font-medium ${i === activeIdx ? "text-foreground" : "text-muted-foreground"}`}>
            {s.label}
          </span>
          {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

/* ─────────── Step 1: Validate ─────────── */

const ValidateStep = ({ report, onNext, onRecheck }) => {
  const errors = report.issues.filter((i) => i.severity === "error");
  const warnings = report.issues.filter((i) => i.severity === "warning");

  return (
    <div className="space-y-4">
      <div className={`rounded-lg p-4 border ${report.ok ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
        <div className="flex items-start gap-3">
          {report.ok ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
          )}
          <div className="flex-1">
            <div className={`text-sm font-semibold ${report.ok ? "text-green-300" : "text-red-300"}`}>
              {report.ok
                ? "Strategy graph is valid — ready to fetch market data."
                : `Strategy can't run yet — ${errors.length} blocker${errors.length > 1 ? "s" : ""} found.`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Stages present:{" "}
              <span className="text-foreground">
                {report.stagesPresent.length ? report.stagesPresent.join(" → ") : "none"}
              </span>
              {report.stagesMissing.length > 0 && (
                <> · Missing: <span className="text-red-300">{report.stagesMissing.join(", ")}</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LEAN / QuantConnect coverage */}
      {report.lean.total > 0 && (
        <div className="rounded-lg border border-border bg-card/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-foreground">
              LEAN / QuantConnect coverage
            </div>
            <div
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${
                report.lean.ratio === 1
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : report.lean.ratio >= 0.6
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-red-500/15 text-red-300 border-red-500/30"
              }`}
            >
              {Math.round(report.lean.ratio * 100)}% mapped
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-500/70"
              style={{ width: `${report.lean.ratio * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground">
            {report.lean.supported}/{report.lean.total} blocks have a LEAN equivalent.
            {report.lean.unsupported > 0 && (
              <> {report.lean.unsupported} unsupported — see warnings below for swap suggestions.</>
            )}
          </div>
          {report.lean.unsupportedNodes.length > 0 && (
            <ul className="mt-2 space-y-1">
              {report.lean.unsupportedNodes.slice(0, 6).map((u) => (
                <li
                  key={u.nodeId}
                  className="text-[11px] flex items-start gap-2 p-1.5 rounded bg-secondary/30"
                >
                  <span className="text-amber-400 font-bold">!</span>
                  <div className="flex-1">
                    <span className="text-foreground font-medium">{u.label}</span>
                    {u.swapLabels && u.swapLabels.length > 0 && (
                      <span className="text-muted-foreground"> · try {u.swapLabels.slice(0, 3).join(", ")}</span>
                    )}
                  </div>
                </li>
              ))}
              {report.lean.unsupportedNodes.length > 6 && (
                <li className="text-[10px] text-muted-foreground pl-5">
                  +{report.lean.unsupportedNodes.length - 6} more
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <IssueList title="Blockers — must fix before running" issues={errors} tone="error" />
      )}
      {warnings.length > 0 && (
        <IssueList title="Warnings — strategy will run, but may behave unexpectedly" issues={warnings} tone="warning" />
      )}
      {report.ok && warnings.length === 0 && (
        <div className="text-xs text-muted-foreground p-3 rounded-md bg-secondary/30 border border-border">
          No issues detected. Click <b>Next</b> to choose market data.
        </div>
      )}

      <div className="flex justify-between gap-2">
        <button onClick={onRecheck} className="h-9 px-4 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 transition-colors flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          Re-check
        </button>
        <button
          onClick={onNext}
          disabled={!report.ok}
          className="h-9 px-5 rounded-md text-xs font-semibold bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]"
        >
          Next: Market Data
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const IssueList = ({ title, issues, tone }) => (
  <div className="space-y-2">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{title}</div>
    {issues.map((iss) => (
      <div
        key={iss.id}
        className={`rounded-lg border p-3 ${tone === "error" ? "bg-red-500/5 border-red-500/30" : "bg-yellow-500/5 border-yellow-500/30"}`}
      >
        <div className="flex items-start gap-2">
          {tone === "error" ? <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground">{iss.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{iss.detail}</div>
            <div className="mt-2 flex items-start gap-1.5 text-[11px] text-primary-foreground/90 bg-primary/10 border border-primary/30 rounded px-2 py-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-primary mt-px shrink-0" />
              <span><b className="text-primary">Fix:</b> {iss.suggestion}</span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ─────────── Step 2: Configure market data ─────────── */

const ConfigureStep = (props) => {
  const symbols = props.exchange === "binance" ? BINANCE_SYMBOLS : DELTA_SYMBOLS;
  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        These are required to fetch real candles from a public exchange API. No keys needed.
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg bg-secondary/40 border border-border">
        <Field label="Exchange *">
          <select
            value={props.exchange}
            onChange={(e) => props.setExchange(e.target.value)}
            className="w-full h-9 text-xs px-2 rounded bg-background border border-border"
          >
            <option value="binance">Binance Spot</option>
            <option value="delta">Delta India</option>
          </select>
        </Field>
        <Field label="Symbol *">
          <select
            value={props.symbol}
            onChange={(e) => props.setSymbol(e.target.value)}
            className="w-full h-9 text-xs px-2 rounded bg-background border border-border"
          >
            {symbols.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Timeframe *">
          <select
            value={props.interval}
            onChange={(e) => props.setInterval(e.target.value)}
            className="w-full h-9 text-xs px-2 rounded bg-background border border-border"
          >
            {INTERVALS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Bars to fetch *" hint="50–1000">
          <input
            type="number" min={50} max={1000}
            value={props.limit}
            onChange={(e) => props.setLimit(Math.max(50, Math.min(1000, parseInt(e.target.value) || 100)))}
            className="w-full h-9 text-xs px-2 rounded bg-background border border-border"
          />
        </Field>
        <Field label="Starting capital ($) *">
          <input
            type="number" min={100}
            value={props.capital}
            onChange={(e) => props.setCapital(parseFloat(e.target.value) || 0)}
            className="w-full h-9 text-xs px-2 rounded bg-background border border-border"
          />
        </Field>
        <Field label="Fee (bps)" hint="Binance ≈ 10 bps">
          <input
            type="number" min={0} max={100}
            value={props.feeBps}
            onChange={(e) => props.setFeeBps(parseFloat(e.target.value) || 0)}
            className="w-full h-9 text-xs px-2 rounded bg-background border border-border"
          />
        </Field>
      </div>

      <div className="flex justify-between">
        <button onClick={props.onBack} className="h-9 px-4 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button onClick={props.onNext} className="h-9 px-5 rounded-md text-xs font-semibold bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 flex items-center gap-1.5 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]">
          Next: Output <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ─────────── Step 3: Output preference ─────────── */

const OUTPUT_OPTIONS = [
  { key: "all", label: "Everything", desc: "Show chart, trades, equity & summary." },
  { key: "chart", label: "Price + Signals", desc: "Just see where Buy/Sell triggered." },
  { key: "trades", label: "Trade log", desc: "List of every trade with P&L." },
  { key: "equity", label: "Equity curve", desc: "How your capital evolved over time." },
  { key: "summary", label: "Stats only", desc: "P&L, win rate, drawdown — fastest." },
];

const OutputStep = ({ outputPref, setOutputPref, onBack, onRun }) => (
  <div className="space-y-4">
    <div className="text-xs text-muted-foreground">
      What do you want to see when the dry-run finishes?
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {OUTPUT_OPTIONS.map((opt) => {
        const active = outputPref === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setOutputPref(opt.key)}
            className={`text-left p-3 rounded-lg border transition-colors ${
              active
                ? "border-primary bg-primary/10 shadow-[0_0_16px_-6px_hsl(var(--primary))]"
                : "border-border bg-secondary/30 hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full border ${active ? "bg-primary border-primary" : "border-muted-foreground"}`} />
              <span className="text-xs font-semibold">{opt.label}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 ml-5">{opt.desc}</div>
          </button>
        );
      })}
    </div>
    <div className="flex justify-between">
      <button onClick={onBack} className="h-9 px-4 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <button onClick={onRun} className="h-9 px-5 rounded-md text-xs font-semibold bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 flex items-center gap-1.5 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]">
        <Wand2 className="w-3.5 h-3.5" /> Run Dry-Run
      </button>
    </div>
  </div>
);

/* ─────────── Step 4: Running ─────────── */

const RunningStep = ({ symbol, interval, limit }) => (
  <div className="py-12 flex flex-col items-center justify-center gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <div className="text-sm font-semibold">Fetching {limit} {interval} bars of {symbol}…</div>
    <div className="text-[11px] text-muted-foreground">Evaluating strategy graph and simulating trades.</div>
  </div>
);

/* ─────────── Step 5: Results ─────────── */

const ResultStep = ({ result, error, outputPref, symbol, interval, onBack, onRerun }) => {
  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-300">Dry-run failed</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono break-all">{error}</div>
              <div className="mt-3 flex items-start gap-1.5 text-[11px] bg-primary/10 border border-primary/30 rounded px-2 py-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-primary mt-px shrink-0" />
                <span className="text-foreground">
                  <b className="text-primary">Try this:</b> {suggestForError(error)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button onClick={onBack} className="h-9 px-4 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Restart
          </button>
          <button onClick={onRerun} className="h-9 px-5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const noTrades = result.trades.length === 0;
  const chartData = result.candles.map((c, i) => ({
    time: c.time,
    label: new Date(c.time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    close: c.close,
    buy: result.signals.find((s) => s.time === c.time && s.type === "BUY")?.price ?? null,
    sell: result.signals.find((s) => s.time === c.time && s.type === "SELL")?.price ?? null,
    equity: result.equityCurve[i]?.equity ?? null,
  }));

  const show = (k) => outputPref === "all" || outputPref === k;

  return (
    <div className="space-y-4">
      {(show("summary") || outputPref === "all") && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Final Equity" value={`$${result.summary.endEquity.toFixed(2)}`} />
          <Stat
            label="P&L"
            value={`${result.summary.pnl >= 0 ? "+" : ""}$${result.summary.pnl.toFixed(2)} (${result.summary.pnlPct.toFixed(2)}%)`}
            positive={result.summary.pnl >= 0}
          />
          <Stat label="Trades" value={String(result.summary.trades)} />
          <Stat label="Win Rate" value={`${result.summary.winRate.toFixed(1)}%`} />
          <Stat label="Max DD" value={`${result.summary.maxDrawdownPct.toFixed(2)}%`} />
        </div>
      )}

      {noTrades && (
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <div className="text-xs">
              <b className="text-yellow-300">Strategy never triggered.</b>
              <div className="text-muted-foreground mt-0.5">
                The conditions you built didn't become true on this data window.
              </div>
              <div className="mt-2 flex items-start gap-1.5 text-[11px] bg-primary/10 border border-primary/30 rounded px-2 py-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-primary mt-px shrink-0" />
                <span>
                  <b className="text-primary">Try:</b> a longer history (more bars), a different timeframe (e.g. 1h instead of 15m),
                  loosen comparison thresholds, or use a more reactive indicator (EMA period 10 instead of 50).
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-xs text-yellow-200 flex gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <div className="font-semibold">Engine warnings</div>
            {result.warnings.slice(0, 5).map((w, i) => <div key={i} className="text-yellow-200/80">• {w}</div>)}
          </div>
        </div>
      )}

      {show("chart") && (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-semibold mb-2">Price & Signals — {symbol} {interval}</div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" minTickGap={40} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Line type="monotone" dataKey="close" stroke="hsl(var(--primary))" dot={false} strokeWidth={1.5} />
              <Scatter dataKey="buy" fill="hsl(142 76% 50%)" shape="triangle" />
              <Scatter dataKey="sell" fill="hsl(0 84% 60%)" shape="triangle" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {show("equity") && (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-semibold mb-2">Equity Curve</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" minTickGap={40} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Area type="monotone" dataKey="equity" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {show("trades") && (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-semibold mb-2">Trades ({result.trades.length})</div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground text-[10px] uppercase tracking-wider">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Side</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">P&L</th>
                  <th className="text-left p-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {result.trades.map((t, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-2 text-muted-foreground">{new Date(t.time).toLocaleString()}</td>
                    <td className="p-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${t.side === "BUY" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                        {t.side === "BUY" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {t.side}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono">{t.price.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">{t.qty.toFixed(6)}</td>
                    <td className={`p-2 text-right font-mono ${(t.pnl ?? 0) > 0 ? "text-green-400" : (t.pnl ?? 0) < 0 ? "text-red-400" : ""}`}>
                      {t.pnl != null ? `${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}` : "—"}
                    </td>
                    <td className="p-2 text-muted-foreground">{t.reason}</td>
                  </tr>
                ))}
                {result.trades.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No trades on this window.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="h-9 px-4 rounded-md text-xs font-medium bg-secondary hover:bg-secondary/70 flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> New Run
        </button>
        <button onClick={onRerun} className="h-9 px-5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
          Re-run with same settings
        </button>
      </div>
    </div>
  );
};

/* ─────────── Helpers ─────────── */

function suggestForError(err) {
  const e = err.toLowerCase();
  if (e.includes("binance") && (e.includes("451") || e.includes("403") || e.includes("region"))) {
    return "Binance may be region-blocked — switch the Exchange to Delta India.";
  }
  if (e.includes("invalid symbol") || e.includes("symbol")) {
    return "Symbol not found on this exchange. Pick another from the list (e.g. BTCUSDT for Binance, BTCUSD for Delta).";
  }
  if (e.includes("interval") || e.includes("resolution")) {
    return "Try a more common timeframe like 15m, 1h, or 1d.";
  }
  if (e.includes("network") || e.includes("failed to fetch") || e.includes("typeerror")) {
    return "Network call failed — check your internet, then retry. The exchange may also be momentarily down.";
  }
  if (e.includes("no candle")) {
    return "Reduce 'Bars to fetch' or pick a more liquid symbol/timeframe.";
  }
  return "Switch exchange to Delta India, lower the bar count to 200, and retry.";
}

const Field = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
      {label}{hint && <span className="ml-1 text-muted-foreground/60 normal-case tracking-normal">({hint})</span>}
    </label>
    {children}
  </div>
);

const Stat = ({ label, value, positive }) => (
  <div className="rounded-lg border border-border bg-card p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className={`text-sm font-semibold mt-1 ${positive === true ? "text-green-400" : positive === false ? "text-red-400" : "text-foreground"}`}>
      {value}
    </div>
  </div>
);
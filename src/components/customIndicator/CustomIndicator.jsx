import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { Settings2, X, Search, Rocket, Eye, EyeOff } from 'lucide-react';
import apiService from '../../services/apiServices';
import { useDebounce } from '../../util/common';

// --- STYLES ---
const styles = {
  container: { 
    padding: '20px', 
    backgroundColor: '#ffffff', 
    color: '#1e293b', 
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    boxSizing: 'border-box'
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: '16px',
  },
  input: { 
    backgroundColor: '#f8fafc', 
    border: '1px solid #e2e8f0', 
    color: '#1e293b', 
    padding: '10px 12px', 
    paddingLeft: '40px',
    borderRadius: '10px', 
    outline: 'none', 
    width: '100%', 
    fontSize: '14px', 
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '400px',
    paddingRight: '4px',
    marginRight: '-4px',
  },
  row: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '14px 12px', 
    borderRadius: '10px',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    marginBottom: '2px'
  },
  indicatorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  indicatorName: { 
    fontWeight: '600', 
    fontSize: '14px',
    color: '#334155'
  },
  indicatorCategory: { 
    fontSize: '11px', 
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  btn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    padding: '12px 24px', 
    borderRadius: '12px', 
    border: 'none', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '14px', 
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    backdropFilter: 'blur(4px)',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2000 
  },
  settingsModal: { 
    width: '420px', 
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden', 
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
  },
  label: { 
    fontSize: '11px', 
    fontWeight: '700',
    color: '#64748b', 
    marginBottom: '6px', 
    display: 'block',
    textTransform: 'uppercase'
  },
  tabNav: {
    display: 'flex',
    borderBottom: '1px solid #f1f5f9',
    padding: '0 20px'
  },
  tab: { 
    padding: '16px 0', 
    marginRight: '24px',
    cursor: 'pointer', 
    fontSize: '14px', 
    color: '#64748b', 
    fontWeight: '600',
    position: 'relative'
  },
  activeTab: { 
    color: '#2563eb',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#2563eb',
    borderRadius: '2px 2px 0 0'
  }
};

// --- MASTER INDICATOR CATALOG ---
const INDICATOR_CATALOG = {
  SMA: { category: 'Trend', inputs: { length: { type: 'number', def: 20 }, source: { type: 'select', options: ['close', 'open', 'high', 'low'], def: 'close' } }, plots: { plot: { label: 'SMA Line', color: '#2962ff', thickness: 2, visible: true } } },
  EMA: { category: 'Trend', inputs: { length: { type: 'number', def: 9 }, source: { type: 'select', options: ['close', 'open', 'high', 'low'], def: 'close' } }, plots: { plot: { label: 'EMA Line', color: '#089981', thickness: 2, visible: true } } },
  WMA: { category: 'Trend', inputs: { length: { type: 'number', def: 9 } }, plots: { plot: { label: 'WMA', color: '#f23645', thickness: 1, visible: true } } },
  HMA: { category: 'Trend', inputs: { length: { type: 'number', def: 9 } }, plots: { plot: { label: 'Hull MA', color: '#9c27b0', thickness: 2, visible: true } } },
  DEMA: { category: 'Trend', inputs: { length: { type: 'number', def: 9 } }, plots: { plot: { label: 'DEMA', color: '#00bcd4', thickness: 2, visible: true } } },
  TEMA: { category: 'Trend', inputs: { length: { type: 'number', def: 9 } }, plots: { plot: { label: 'TEMA', color: '#ff9800', thickness: 2, visible: true } } },
  Supertrend: { category: 'Trend', inputs: { atrPeriod: { type: 'number', def: 10 }, factor: { type: 'number', def: 3 } }, plots: { line: { label: 'Supertrend', color: '#089981', thickness: 2, visible: true } } },
  Ichimoku: { category: 'Trend', inputs: { conversion: { type: 'number', def: 9 }, base: { type: 'number', def: 26 }, spanB: { type: 'number', def: 52 } }, plots: { tenkan: { label: 'Tenkan', color: '#0496ff', thickness: 1, visible: true }, kijun: { label: 'Kijun', color: '#991515', thickness: 1, visible: true } }, anchor: 'Session' },
  ADX: { category: 'Trend', inputs: { smoothing: { type: 'number', def: 14 }, length: { type: 'number', def: 14 } }, plots: { adx: { label: 'ADX', color: '#e91e63', thickness: 2, visible: true } } },
  VWAP: { category: 'Trend', inputs: { }, plots: { plot: { label: 'VWAP', color: '#fb8c00', thickness: 2, visible: true } } },
  RSI: { category: 'Momentum', inputs: { length: { type: 'number', def: 14 } }, plots: { plot: { label: 'RSI', color: '#9c27b0', thickness: 2, visible: true }, upper: { label: 'Upper Band', color: '#787b86', thickness: 1, visible: true }, lower: { label: 'Lower Band', color: '#787b86', thickness: 1, visible: true } } },
  MACD: { category: 'Momentum', inputs: { fast: { type: 'number', def: 12 }, slow: { type: 'number', def: 26 }, signal: { type: 'number', def: 9 } }, plots: { macd: { label: 'MACD', color: '#2962ff', thickness: 2, visible: true }, sig: { label: 'Signal', color: '#f23645', thickness: 2, visible: true }, hist: { label: 'Histogram', color: '#089981', thickness: 1, visible: true } } },
  Stochastic: { category: 'Momentum', inputs: { k: { type: 'number', def: 14 }, d: { type: 'number', def: 3 } }, plots: { k: { label: '%K', color: '#2196f3', thickness: 2, visible: true }, d: { label: '%D', color: '#ff9800', thickness: 2, visible: true } } },
  CCI: { category: 'Momentum', inputs: { length: { type: 'number', def: 20 } }, plots: { plot: { label: 'CCI', color: '#7e57c2', thickness: 2, visible: true } } },
  ROC: { category: 'Momentum', inputs: { length: { type: 'number', def: 9 } }, plots: { plot: { label: 'ROC', color: '#00bcd4', thickness: 2, visible: true } } },
  MFI: { category: 'Momentum', inputs: { length: { type: 'number', def: 14 } }, plots: { plot: { label: 'MFI', color: '#4caf50', thickness: 2, visible: true } } },
  Awesome: { category: 'Momentum', inputs: { }, plots: { plot: { label: 'Awesome Osc', color: '#089981', thickness: 1, visible: true } } },
  Bollinger: { category: 'Volatility', inputs: { length: { type: 'number', def: 20 }, mult: { type: 'number', def: 2 } }, plots: { basis: { label: 'Basis', color: '#ff9800', thickness: 2, visible: true }, upper: { label: 'Upper', color: '#2962ff', thickness: 1, visible: true }, lower: { label: 'Lower', color: '#2962ff', thickness: 1, visible: true } } },
  ATR: { category: 'Volatility', inputs: { length: { type: 'number', def: 14 } }, plots: { plot: { label: 'ATR', color: '#ff5252', thickness: 2, visible: true } } },
  Choppiness: { category: 'Volatility', inputs: { length: { type: 'number', def: 14 } }, plots: { plot: { label: 'CHOP', color: '#795548', thickness: 2, visible: true } } },
  Keltner: { category: 'Volatility', inputs: { length: { type: 'number', def: 20 }, mult: { type: 'number', def: 2 } }, plots: { basis: { label: 'Basis', color: '#ff9800', thickness: 1, visible: true }, upper: { label: 'Upper', color: '#2962ff', thickness: 1, visible: true }, lower: { label: 'Lower', color: '#2962ff', thickness: 1, visible: true } } },
  OBV: { category: 'Volume', inputs: { }, plots: { plot: { label: 'OBV', color: '#2196f3', thickness: 2, visible: true } } },
  CMF: { category: 'Volume', inputs: { length: { type: 'number', def: 20 } }, plots: { plot: { label: 'CMF', color: '#089981', thickness: 2, visible: true } } },
  ZigZag: { category: 'Pivots', inputs: { dev: { type: 'number', def: 5 }, depth: { type: 'number', def: 10 } }, plots: { plot: { label: 'ZigZag', color: '#ffffff', thickness: 2, visible: true } } },
  "Classic Pivots": { category: 'Pivots', inputs: { type: { type: 'select', options: ['Traditional', 'Fibonacci', 'Woodie', 'Classic', 'Camarilla'], def: 'Traditional' } }, plots: { p: { label: 'P', color: '#ff9800', thickness: 1, visible: true }, r1: { label: 'R1', color: '#f23645', thickness: 1, visible: true }, s1: { label: 'S1', color: '#089981', thickness: 1, visible: true } } }
};

const IndicatorChart = ({ 
  selectedIndicator = [], 
  setSelectedIndicator, 
  setIndicatorConfigs, 
  setIndicatorStyle, 
  onClose 
}) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  const seriesRef = useRef({});

  const [activeIndicators, setActiveIndicators] = useState({});
  const [stagedIndicators, setStagedIndicators] = useState(() => {
    // Initialize stagedIndicators from selectedIndicator slugs if they start with CUSTOM_
    const initial = {};
    selectedIndicator.forEach(slug => {
        if (slug.startsWith('CUSTOM_')) {
            const baseSlug = slug.replace('CUSTOM_', '');
            const meta = INDICATOR_CATALOG[baseSlug];
            if (meta) {
                initial[baseSlug] = {
                    inputs: Object.entries(meta.inputs || {}).reduce((acc, [k, v]) => ({ ...acc, [k]: v.def }), {}),
                    plots: JSON.parse(JSON.stringify(meta.plots || {}))
                };
            }
        }
    });
    return initial;
  });
  const [editKey, setEditKey] = useState(null);
  const [activeTab, setActiveTab] = useState('Inputs');
  const [searchTerm, setSearchTerm] = useState('');

  // MOCK DATA
  const candles = useMemo(() => {
    let res = []; let time = 1704067200; let base = 100;
    for (let i = 0; i < 300; i++) {
        const o = base + Math.random()*4-2; const c = o + Math.random()*4-2;
        res.push({ time, open: o, high: Math.max(o, c)+1, low: Math.min(o, c)-1, close: c });
        base = c; time += 86400;
    }
    return res;
  }, []);

  // CHART INIT
  useEffect(() => {
    if(!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#131722' }, textColor: '#d1d4dc' },
      grid: { vertLines: { color: '#2a2e39' }, horzLines: { color: '#2a2e39' } },
      width: chartContainerRef.current.clientWidth, height: 600,
    });
    chartRef.current = chart;
    const s = chart.addSeries(CandlestickSeries, { upColor: '#089981', downColor: '#f23645', borderVisible: false });
    s.setData(candles);
    chart.timeScale().fitContent();

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, [candles]);

  // PLOTTING ENGINE
  useEffect(() => {
    if(!chartRef.current) return;
    Object.values(seriesRef.current).forEach(arr => arr?.forEach(s => chartRef.current.removeSeries(s)));
    seriesRef.current = {};

    Object.entries(activeIndicators).forEach(([key, config]) => {
      const seriesList = [];
      Object.entries(config.plots || {}).forEach(([plotId, plotSettings]) => {
          if (!plotSettings.visible) return;
          const s = chartRef.current.addSeries(LineSeries, { color: plotSettings.color, lineWidth: plotSettings.thickness || 1 });
          s.setData(candles.map(d => ({ time: d.time, value: d.close * (1 + (Math.random()*0.02-0.01)) })));
          seriesList.push(s);
      });
      seriesRef.current[key] = seriesList;
    });
  }, [activeIndicators, candles]);

  const toggleSelection = (key) => {
    setStagedIndicators(p => {
        const next = { ...p };
        if(next[key]) delete next[key];
        else {
            const meta = INDICATOR_CATALOG[key];
            if (!meta) return p;
            next[key] = {
                inputs: Object.entries(meta.inputs || {}).reduce((acc, [k,v]) => ({...acc, [k]: v.def}), {}),
                plots: JSON.parse(JSON.stringify(meta.plots || {}))
            };
        }
        return next;
    });
  };

  const openSettings = (key) => {
    // 🔹 Safety Initializer: Ensures state exists even if not checked yet
    if (!stagedIndicators[key]) {
        const meta = INDICATOR_CATALOG[key];
        if (meta) {
            setStagedIndicators(p => ({
                ...p,
                [key]: {
                    inputs: Object.entries(meta.inputs || {}).reduce((acc, [k,v]) => ({...acc, [k]: v.def}), {}),
                    plots: JSON.parse(JSON.stringify(meta.plots || {}))
                }
            }));
        }
    }
    setEditKey(key);
    setActiveTab('Inputs');
  };

  const updateInput = (key, field, val) => {
      setStagedIndicators(p => ({ ...p, [key]: { ...p[key], inputs: { ...p[key]?.inputs, [field]: val } } }));
  };

  const updatePlot = (key, plotId, field, val) => {
      setStagedIndicators(p => ({ 
          ...p, [key]: { 
              ...p[key], plots: { 
                  ...p[key]?.plots, [plotId]: { ...p[key]?.plots?.[plotId], [field]: val } 
              } 
          } 
      }));
  };

  const deploy = () => { 
    // 1. Update active indicators in the chart (slug list)
    // We add CUSTOM_ prefix to these slugs so they don't collide with normal indicators
    const currentCustomSlugs = Object.keys(stagedIndicators).map(slug => `CUSTOM_${slug}`);
    
    // Merge with existing non-custom indicators already in the state
    setSelectedIndicator(prev => {
        const nonCustom = prev.filter(s => !s.startsWith('CUSTOM_'));
        return [...nonCustom, ...currentCustomSlugs];
    });

    // 2. Update individual configs and styles if setters provided
    if (setIndicatorConfigs && setIndicatorStyle) {
        setIndicatorConfigs(prev => {
            const next = { ...prev };
            Object.entries(stagedIndicators).forEach(([slug, config]) => {
                next[`CUSTOM_${slug}`] = config.inputs;
            });
            return next;
        });

        setIndicatorStyle(prev => {
            const next = { ...prev };
            Object.entries(stagedIndicators).forEach(([slug, config]) => {
                next[`CUSTOM_${slug}`] = config.plots;
            });
            return next;
        });
    }

    // 3. Notify parent to close modal
    if (onClose) onClose();
  };


const [indicators, setIndicators] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const debouncedSearch = useDebounce(searchTerm, 400);

useEffect(() => {
  fetchIndicators();
}, [debouncedSearch]);

async function fetchIndicators() {
  setLoading(true);
  setError(null);

  try {
    const response = await apiService.post(
      debouncedSearch
        ? `/api/getIndicators?q=${debouncedSearch}`
        : `/api/getIndicators`
    );

    setIndicators(response?.data || []);
  } catch (err) {
    console.error(err);
    setError(err?.message || "Failed to fetch indicators");
  } finally {
    setLoading(false);
  }
}

const filteredCatalog = useMemo(() => {
  return (indicators || [])
    .filter((item) =>
      item.label?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((item) => [item.slug || item.label, item]);
}, [indicators, searchTerm]);

  return (
    <div style={styles.container}>

      {/* Search Section */}
      <div style={styles.searchWrapper}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          style={styles.input}
          placeholder="Search indicators..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={e => e.target.style.borderColor = '#2563eb'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {/* Indicator List Section */}
      <div className="custom-indicator-list" style={styles.listContainer}>
        <style>
          {`
            .custom-indicator-list::-webkit-scrollbar { width: 6px; }
            .custom-indicator-list::-webkit-scrollbar-track { background: transparent; }
            .custom-indicator-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .custom-indicator-list::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
          `}
        </style>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
            <div className="animate-pulse">Loading indicators...</div>
          </div>
        ) : filteredCatalog.length > 0 ? (
          filteredCatalog.map(([k, meta]) => (
            <div 
              key={k} 
              style={styles.row}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={(e) => {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'svg' && e.target.tagName !== 'path') {
                    toggleSelection(k);
                }
              }}
            >
              <div style={styles.indicatorInfo}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={!!stagedIndicators[k]}
                      onChange={() => toggleSelection(k)}
                      style={{ 
                        accentColor: '#2563eb', 
                        cursor: 'pointer', 
                        width: '18px', 
                        height: '18px',
                        borderRadius: '4px'
                      }}
                    />
                </div>
                <div>
                  <div style={styles.indicatorName}>{k}</div>
                  <div style={styles.indicatorCategory}>{meta.category}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No matching indicators found.</p>
          </div>
        )}
      </div>

      {/* Apply Button Section */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
        <button
          style={{ ...styles.btn, backgroundColor: '#2563eb', color: 'white', width: '100%', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
          onClick={deploy}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          <Rocket size={18} /> 
          <span>Apply Indicators</span>
        </button>
      </div>

    </div>
  );
};

export default IndicatorChart;

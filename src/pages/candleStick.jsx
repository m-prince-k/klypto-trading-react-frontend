import "bootstrap/dist/css/bootstrap.min.css"; //this is for temp
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  HistogramSeries,
  BaselineSeries,
} from "lightweight-charts";
import IndicatorRuleBuilder from "../components/scanner/IndicatorRuleBuilder";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import { RiResetRightLine } from "react-icons/ri";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaCode } from "react-icons/fa6";
import ChartHeader from "../components/tradingModals/ChartHeader";
import IndicatorBuildingListing from "../components/scanner/IndicatorBuilderListing";
import {
  ChartProprties,
  TIMEFRAME_TO_SECONDS,
  SINGLE_VALUE_CHARTS,
  chartSeriesStyles,
  convertToHeikinAshi,
  PANE_INDICATORS,
} from "../util/common";
import SourceCodePanel from "../components/indicator/SourceCodePanel";
import ChartRightSidebar from "../components/chart/rightbar/ChartRightSidebar";
import ChartLeftSidebar from "../components/chart/leftbar/ChartLeftSidebar";
import {
  IoCloseSharp,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLink,
  IoSettingsOutline,
} from "react-icons/io5";
import IndicatorAlert from "../components/indicator/IndicatorAlert";
import IndicatorPropertyDialog from "../components/indicator/IndicatorPropertyDialog";
import useChartFunctions from "../util/useChartFunctions";
import { indicatorComponents } from "../components/indicator/IndicatorIndex";
import { Spinner } from "../components/tradingModals/Spinner";
import IndicatorBar from "../components/indicator/IndicatorBar";

export default function Candlestick() {
  const chartRef = useRef();
  const containerRef = useRef();
  const seriesRef = useRef(null);
  const indicatorSeriesRef = useRef({});
  const latestIndicatorValuesRef = useRef({});
  const panesRef = useRef({});
  const syncingRef = useRef(false);
  const [openForm, setOpenForm] = useState(false);
  const [timeframeValue, setTimeframeValue] = useState("1m");
  const [selectedCurrency, setSelectedCurrency] = useState("BTCUSDT");
  const [selectedIndicator, setSelectedIndicator] = useState([]);
  const [rangeValue, setRangeValue] = useState("1000");
  const [chartType, setChartType] = useState("candlestick");
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [liveOhlcv, setLiveOhlcv] = useState({});
  const [liveIndicatorData, setLiveIndicatorData] = useState({});
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [indicatorProperty, setIndicatorProperty] = useState(false);
  const [indicatorLoading, setIndicatorLoading] = useState(false);
  const mainChartHeightRef = useRef(500);
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [activeSourceIndicator, setActiveSourceIndicator] = useState(null);
  const [indicatorVisibility, setIndicatorVisibility] = useState({});
  const [activeBarIndicator, setActiveBarIndicator] = useState("");

  const toggleIndicatorVisibility = (indicator) => {
    const currentVisible = indicatorVisibility[indicator] ?? true;
    const newVisibility = !currentVisible;
    const seriesGroup = indicatorSeriesRef.current?.[indicator];
    if (seriesGroup) {
      Object.values(seriesGroup).forEach((series) => {
        if (series?.applyOptions) {
          series.applyOptions({ visible: newVisibility });
        }
      });
      if (seriesGroup._priceLines) {
        Object.values(seriesGroup._priceLines).forEach((line) => {
          line?.applyOptions({ visible: newVisibility });
        });
      }
    }
    setIndicatorVisibility((prev) => ({
      ...prev,
      [indicator]: newVisibility,
    }));
  };
  const paneIndexRef = useRef({});

  //  GET PANE INDEX
  const getPaneIndex = (indicator) => {
    if (!PANE_INDICATORS.has(indicator)) return 0;
    if (paneIndexRef.current[indicator] !== undefined) {
      return paneIndexRef.current[indicator];
    }
    const nextPane = Object.keys(paneIndexRef.current).length + 1;
    paneIndexRef.current[indicator] = nextPane;
    return nextPane;
  };

  const [indicatorConfigs, setIndicatorConfigs] = useState({
    SMA: {
      length: 9,
      source: "close",
      offset: 0,
      maType: "none",
      maLength: 14,
      bbStdDev: 2,
    },
    EMA: {
      length: 9,
      source: "close",
      offset: 0,
      maType: "none",
      maLength: 14,
      bbStdDev: 2,
    },

    WMA: {
      length: 9,
      source: "close",
      offset: 0,
    },
    HMA: {
      length: 9,
      source: "close",
    },
    DEMA: {
      length: 9,
      source: "close",
    },
    TEMA: {
      length: 9,
    },
    KAMA: {
      ERlength: 10,
      fastLength: 2,
      slowLength: 30,
      source: "close",
    },

    ICHIMOKU: {
      conversionLength: 9,
      baseLength: 26,
      spanBLength: 52,
      laggingSpan: 26,
    },
    PSAR: {
      start: 0.02,
      increment: 0.02,
      maxValue: 0.02,
    },
    SUPERTREND: {
      atrLength: 10,
      factor: 3,
    },
    AROON: {
      length: 14,
    },
    AO: {
      length: 14,
    },
    ADX: {
      smoothing: 14,
      diLength: 14,
    },
    CKS: {
      atrLength: 10,
      atrCoefficient: 1,
      stopLength: 9,
    },
    RSI: {
      length: 14,
      source: "close",
      maType: "SMA",
      maLength: 14,
      bbStdDev: 2,
    },
    Stochastic: {
      kLength: 14,
      kSmoothing: 1,
      dSmoothing: 3,
    },
    STOCHRSI: {
      rsiLength: 14,
      rsiSource: "close",
      stochasticLength: 14,
      kSmoothing: 3,
      dSmoothing: 3,
    },
    MACD: {
      source: "close",
      fastLength: 12,
      slowLength: 26,
      signalLength: 9,
      oscillatorMAType: "EMA",
      signalMAType: "EMA",
    },
    CCI: {
      length: 20,
      source: "hlc3",
      maType: "SMA",
      maLength: 14,
      bbStdDev: 2,
    },
    MOM: {
      length: 10,
      source: "close",
    },
    ROC: {
      length: 9,
      source: "close",
    },
    WPR: {
      length: 14,
      source: "close",
    },
    UO: {
      fastLength: 7,
      middleLength: 14,
      slowLength: 28,
    },
    ChandeMomentumOscillator: {
      length: 9,
      source: "close",
    },
    TRIX: {
      length: 18,
    },
    FisherTransform: {
      length: 9,
    },
    ATR: {
      length: 14,
      smoothing: "RMA",
    },
    BB: {
      length: 20,
      maType: "SMA",
      stdDev: 2,
      source: "close",
      offset: 0,
    },
    BBW: {
      length: 20,
      stdDev: 2,
      source: "close",
      highestExpansionLength: 125,
      lowestContractionLength: 125,
    },
    KC: {
      length: 20,
      source: "close",
      multiplier: 2,
      atrLength: 10,
      bandsStyle: "Average True Range",
      useEMA: true,
    },
    DC: {
      length: 20,
      offset: 0,
    },
    CHOP: {
      length: 14,
      offset: 0,
    },
    StandardDeviation: {
      length: 20,
      source: "close",
    },
    Volume: {
      maLength: 20,
      colorByPrevious: false,
    },
    HV: {
      length: 10,
    },
    OBV: {
      maType: "none",
      maLlength: 14,
      bbStdDev: 2,
    },
    "Percentage Volume Oscillator": {
      fastLength: 12,
      slowLength: 26,
      signalLength: 9,
      oscMaType: "EMA",
      signalMaType: "EMA",
    },
    CMF: {
      length: 20,
    },
    MFI: {
      length: 14,
    },
    EOM: {
      length: 14,
      divisor: 10000,
    },
    "Negative Volume Index": {
      emaLength: 255,
    },
    "Positive Volume Index": {
      emaLength: 255,
    },
    VWAP: {
      hideOnDailyOrAbove: true,
      anchorPeriod: "Daily",
      source: "hlc3",
      offset: 0,
      bandSettings: {
        calculationMode: "Standard Deviation",
        band1: { enabled: true, multiplier: 1 },
        band2: { enabled: false, multiplier: 2 },
        band3: { enabled: false, multiplier: 3 },
      },
    },
    "Zig Zag": {
      priceDeviation: 5,
      pivotLegs: 10,
      lineColor: "#2962ff",
      extendToLastBar: true,
      displayReversalPrice: false,
      displayCumulativeVolume: false,
      reversalPriceChangeMode: "absolute",
    },
  });

  let indicatorStyleDefault = {
    RSI: {
      rsi: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      smoothingMA: {
        visible: true,
        color: "rgba(255,202,28,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      upper: {
        visible: true,
        value: 70,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },
      middle: {
        visible: false,
        value: 50,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },
      lower: {
        visible: true,
        value: 30,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },
      bandFill: {
        visible: true,
        topFillColor1: "rgba(140,120,255,0.05)",
        topFillColor2: "rgba(140,120,255,0.05)",
      },
      obFill: {
        visible: true,
        topFillColor1: "rgba(38, 166, 106, 0.1)",
        topFillColor2: "rgba(38, 166, 106, 0.2)",
      },
      osFill: {
        visible: true,
        bottomFillColor1: "rgba(239, 83, 80, 0.1)",
        bottomFillColor2: "rgba(239,83,80,0.4)",
      },
      bbUpperBand: {
        visible: true,
        color: "#4caf50",
        width: 1,
      },
      bbLowerBand: {
        visible: true,
        color: "#f44336",
        width: 1,
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },
    SMA: {
      sma: {
        color: "rgba(0, 140, 255, 1)",
        width: 2,
        lineStyle: 0,
        visible: true,
      },
      smoothingMA: {
        visible: true,
        color: "rgba(255,202,28,1)",
        width: 1,
        lineStyle: 0,
      },
      bbUpper: {
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
      },
      bbLower: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },
    BBW: {
      bollingerBandWidth: {
        visible: true,
        color: "rgba(41, 98, 255, 1)", // default blue
        width: 2,
        lineStyle: 0,
      },
      highestExpansion: {
        visible: true,
        color: "rgba(38,166,154,1)", // teal
        width: 2,
        lineStyle: 0,
      },
      lowestContraction: {
        visible: true,
        color: "rgba(38,166,154,1)", // same as above
        width: 2,
        lineStyle: 0,
      },
    },
    ICHIMOKU: {
      conversionLine: {
        color: "rgba(41,98,255,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      baseLine: {
        color: "rgba(255,109,0,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      leadLine1: {
        color: "rgba(63,81,181,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      leadLine2: {
        color: "rgba(216,27,96,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      laggingSpan: {
        color: "rgba(156,39,176,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      kumoCloudUpper: {
        color: "rgba(130, 132, 141,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      kumoCloudLower: {
        color: "rgba(130, 132, 141,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
      cloudFillBullish: {
        color: "rgba(67,160,71,0.35)",
        opacity: 35,
        visible: true,
      },
      cloudFillBearish: {
        color: "rgba(244,67,54,0.35)",
        opacity: 35,
        visible: true,
      },
    },
    EMA: {
      ema: {
        color: "rgba(0,0,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
      smoothingMA: {
        visible: true,
        color: "rgba(255, 202, 28,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      bbUpper: {
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },

      bbLower: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      bbFill: {
        visible: true,
        topFillColor1: "rgba(76,175,80,0.2)",
        bottomFillColor1: "rgba(76,175,80,0.05)",
      },
    },
    WMA: {
      wma: {
        color: "rgba(0,0,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },
    HMA: {
      hma: {
        visible: true,
        color: "rgba(0,0,0)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
    },
    DEMA: {
      dema: {
        color: "rgba(0,0,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },
    TEMA: {
      tema: {
        color: "rgba(0,0,0,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
        visible: true,
      },
    },
    SUPERTREND: {
      upTrend: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      downTrend: {
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      bodyMiddle: {
        color: "rgba(255,255,255,1)",
        width: 1,
        lineStyle: 2,
        visible: false,
        opacity: 0.6,
      },
      upTrendBg: {
        color0: "rgba(38,166,154,0.2)",
        color1: "rgba(38,166,154,0.05)",
        visible: true,
      },
      downTrendBg: {
        color0: "rgba(239,83,80,0.2)",
        color1: "rgba(239,83,80,0.05)",
        visible: true,
      },
    },
    AROON: {
      aroonUp: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      aroonDown: {
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
    },
    AO: {
      oscillator: {
        visible: true,
        color0: "rgba(38,166,154,1)",
        color1: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
      center: {
        visible: true,
        value: 0,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },
      upperLevel: {
        visible: true,
        value: 90,
        color: "rgba(255,152,0,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },
      lowerLevel: {
        visible: true,
        value: -90,
        color: "rgba(3,169,244,1)",
        width: 1,
        lineStyle: 2,
        opacity: 100,
      },
      oscillatorFillBull: {
        visible: true,
        color0: "rgba(38,166,154,0.25)",
      },
      oscillatorFillBear: {
        visible: true,
        color0: "rgba(239,83,80,0.25)",
      },
    },
    ADX: {
      adx: {
        color: "rgba(250, 35, 6, 1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
    },
    CCI: {
      cciLine: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },

      cciMa: {
        color: "rgba(255,152,0,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },

      upperBand: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 100,
      },

      middleBand: {
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 0,
      },

      lowerBand: {
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: -100,
      },

      bgFill: {
        topFillColor1: "rgba(38,166,154,0.05)",
        topFillColor2: "rgba(38,166,154,0.05)",
        visible: true,
      },

      bbUpper: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      bbLower: {
        color: "rgba(33,150,243,1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },

      bbFill: {
        topFillColor1: "rgba(33,150,243,0.15)",
        topFillColor2: "rgba(33,150,243,0.05)",
        visible: true,
      },
    },
    MOM: {
      momentum: {
        visible: true,
        color: "rgba(33, 150, 243, 1)",
        width: 1,
        lineStyle: 0,
        opacity: 100,
      },
    },
    ROC: {
      roc: {
        color: "rgba(33,150,243,1)",
        width: 2,
        lineStyle: 0,
        visible: true,
        opacity: 100,
      },
      zeroLine: {
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 0,
      },
    },
    WPR: {
      r: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 2,
        lineStyle: 0,
        opacity: 100,
      },

      upperBand: {
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 2,
        value: -20,
      },

      middleBand: {
        visible: true,
        color: "rgba(158,158,158,1)",
        width: 1,
        lineStyle: 2,
        value: -50,
      },

      lowerBand: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
        value: -80,
      },

      bg: {
        visible: true,
        topFillColor1: "rgba(38,166,154,0.08)",
        topFillColor2: "rgba(38,166,154,0.02)",
      },
    },
    ATR: {
      atr: {
        visible: true,
        color: "rgba(0, 0, 0,1)",
        width: 2,
        lineStyle: 0,
        opacity: 100,
      },
    },
    MFI: {
      mfiLine: {
        color: "rgba(41, 98, 255, 1)",
        width: 2,
        lineStyle: 0,
        visible: true,
        opacity: 1,
      },

      upperBand: {
        value: 80,
        color: "rgba(120, 123, 134, 0.8)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },

      middleBand: {
        value: 50,
        color: "rgba(120, 123, 134, 0.6)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },

      lowerBand: {
        value: 20,
        color: "rgba(120, 123, 134, 0.8)",
        width: 1,
        lineStyle: 2,
        visible: true,
      },
      bgFill: {
        visible: true,
        topFillColor1: "rgba(41, 98, 255, 0.25)",
        topFillColor2: "rgba(41, 98, 255, 0.08)",
      },
    },
    PSAR: {
      psar: {
        visible: true,
        color: "rgba(41, 98, 255, 1)",
        width: 1,
        opacity: 100,
      },
    },
    EOM: {
      eom: {
        color: "rgba(38, 166, 154, 1)",
        width: 3,
        lineStyle: 0, // 0 solid, 1 dotted, 2 dashed
        visible: true,
      },

      /* Histogram colors */
      histogram: {
        upColor: "rgba(38, 166, 154, 1)",   // green
        downColor: "rgba(239, 83, 80, 1)",  // red
        base: 0,
        visible: true,
      },

      /* Zero line */
      zeroLine: {
        value: 0,
        color: "rgba(153, 153, 153, 1)", // grey
        width: 1,
        lineStyle: 2, // dashed
        visible: true,
      },
      upper: {
        color: "rgba(239,83,80,1)", // red
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 65.8,
      },
      middle: {
        color: "rgba(38,166,154,1)", // teal
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 50,
      },
      lower: {
        color: "rgba(38,166,154,1)", // teal
        width: 1,
        lineStyle: 2,
        visible: true,
        value: 38.2,
      },
      bg: {
        visible: true,
        topFillColor1: "rgba(41, 98, 255, 0.25)",
        topFillColor2: "rgba(41, 98, 255, 0.08)",
      },
    },
    DC: {
      upper: {
        visible: true,
        color: "rgba(239,83,80,1)", // red
        width: 1,
        lineStyle: 0, // solid
      },
      basis: {
        visible: true,
        color: "rgba(38,166,154,1)", // teal
        width: 1,
        lineStyle: 0, // solid
      },
      lower: {
        visible: true,
        color: "rgba(38,166,154,1)", // teal
        width: 1,
        lineStyle: 0, // solid
      },
      bg: {
        visible: true,
        topFillColor1: "rgba(38,166,154,0.1)", // color under bullish trend
        topFillColor2: "rgba(239,83,80,0.1)", // color under bearish trend
      },
    },
    KC: {
      upper: {
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
      },
      basis: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
      },
      lower: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
      },
      bg: {
        visible: true,
        topFillColor1: "rgba(38,166,154,0.1)",
        topFillColor2: "rgba(239,83,80,0.1)",
      },
    },
    EOM: {
      eom: {
        color: "rgba(38, 166, 154, 1)",
        width: 1,
        lineStyle: 0,
        visible: true,
      },
    },
    BB: {
      upper: {
        visible: true,
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 0,
      },
      basis: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
      },
      lower: {
        visible: true,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 0,
      },
      bg: {
        visible: true,
        topFillColor1: "rgba(38,166,154,0.1)",
        topFillColor2: "rgba(239,83,80,0.1)",
      },
    },
    MACD: {
      macd: {
        visible: true,
        color: "rgba(33,150,243,1)", // blue
        width: 2,
        lineStyle: 0,
      },
      signal: {
        visible: true,
        color: "rgba(255,193,7,1)", // yellow
        width: 2,
        lineStyle: 0,
      },
      histogram: {
        visible: true,
        upColor: "rgba(38,166,154,1)",   // green
        downColor: "rgba(239,83,80,1)",  // red
        base: 0,
      },
    },
    VWAP: {
      vwap: {
        visible: true,
        color: "rgba(156,39,176,1)", // purple
        width: 2,
        lineStyle: 0,
      },
      upper: {
        visible: false, // optional bands (std dev)
        color: "rgba(239,83,80,1)",
        width: 1,
        lineStyle: 2,
      },
      lower: {
        visible: false,
        color: "rgba(38,166,154,1)",
        width: 1,
        lineStyle: 2,
      },
      bg: {
        visible: false,
        topFillColor1: "rgba(156,39,176,0.1)",
        topFillColor2: "rgba(156,39,176,0.02)",
      },
    },
    CKS: {
      longStop: {
        visible: true,
        color: "rgba(38,166,154,1)", // green
        width: 2,
        lineStyle: 0,
      },
      shortStop: {
        visible: true,
        color: "rgba(239,83,80,1)", // red
        width: 2,
        lineStyle: 0,
      },
      bg: {
        visible: false,
        topFillColor1: "rgba(38,166,154,0.1)",
        topFillColor2: "rgba(239,83,80,0.1)",
      },
    },
   HV: {
  hv: {
    visible: true,
    color: "#ff9800",
    width: 2,
    lineStyle: 0,
  },
},
    CMF: {
      cmf: {
        visible: true,
        color: "rgba(0,188,212,1)", // cyan
        width: 2,
        lineStyle: 0,
      },
      zeroLine: {
        visible: true,
        value: 0,
        color: "rgba(158,158,158,0.8)",
        width: 1,
        lineStyle: 1,
      },
      bg: {
        visible: true,
        topFillColor1: "rgba(38,166,154,0.15)", // above 0
        topFillColor2: "rgba(239,83,80,0.15)", // below 0
      },
    },
    NVI: {
      nvi: {
        visible: true,
        color: "rgba(121,85,72,1)", // brown
        width: 2,
        lineStyle: 0,
      },
      signal: {
        visible: true, // usually EMA of NVI (like 255 EMA)
        color: "rgba(33,150,243,1)", // blue
        width: 1,
        lineStyle: 2,
      },
      baseLine: {
        visible: false,
        value: 1000,
        color: "rgba(158,158,158,0.6)",
        width: 1,
        lineStyle: 1,
      },
    }
  };

  const [indicatorStyle, setIndicatorStyle] = useState(indicatorStyleDefault);

  const closeAlert = () => {
    setShowAlertForm(false);
  };

  //  ADD SERIES
  const addSeries = (indicator, SeriesType, options = {}) => {
    if (!chartRef.current) return null;

    const paneIndex = getPaneIndex(indicator);
    const series = chartRef.current.addSeries(
      SeriesType,
      {
        ...options,
        priceScaleId: `pane_${paneIndex}`,
      },
      paneIndex,
    );
    return series;
  };

  //  ✅ CHART SYNC ENGINE
  function syncCharts(sourceChart, logicalRange) {
    if (!logicalRange || syncingRef.current) return;
    syncingRef.current = true;
    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ];

    charts.forEach((chart) => {
      if (!chart || chart === sourceChart) return;
      chart.timeScale().setVisibleLogicalRange(logicalRange);
    });
    syncingRef.current = false;
  }
  function attachSync(chart) {
    if (!chart) return;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || syncingRef.current) return;
      syncCharts(chart, range);
    });
  }
  //  ✅ PANE MANAGEMENT
  function resolvePaneKey(type) {
    switch (type) {
      case "RSI":
        return "RSI";
      case "MACD":
        return "MACD";
      case "Volume":
        return "volume";
      case "ATR":
        return "ATR";
      case "AROON":
        return "AROON";
      case "ADX":
        return "ADX";
      case "CCI":
        return "CCI";
      case "ROC":
        return "ROC";
      case "MFI":
        return "MFI";
      case "WPR":
        return "WPR";
      case "AO":
        return "AO";
      case "CHOP":
        return "CHOP";
      case "EOM":
        return "EOM";
      case "MOM":
        return "MOM";
      case "EOM":
        return "EOM";
        case "HV":
        return "HV";
        //  case "VWAP":
        // return "VWAP";
    }
  }

  function cleanupPane(paneKey) {
    const pane = panesRef.current[paneKey];
    if (!pane) return;

    const stillUsed = Object.entries(indicatorSeriesRef.current).some(
      ([indicatorKey, series]) => {
        if (!series || indicatorKey.startsWith("_")) return false;
        return resolvePaneKey(indicatorKey) === paneKey;
      },
    );
    if (stillUsed) return;
    try {
      /* REMOVE DOM ELEMENT */
      if (pane.div && pane.div.parentNode) {
        pane.div.parentNode.removeChild(pane.div);
      }
      /* REMOVE SPLITTER */
      if (pane.splitter && pane.splitter.parentNode) {
        pane.splitter.parentNode.removeChild(pane.splitter);
      }
    } catch (e) {
      console.error("Pane cleanup error:", e);
    }
    delete panesRef.current[paneKey];
  }

  //  ✅ INDICATOR REMOVAL
  const removeIndicator = useCallback((indicator) => {
    const entry = indicatorSeriesRef.current[indicator];
    if (!entry) return;
    const paneKey = resolvePaneKey(indicator);
    const pane = panesRef.current[paneKey];
    const chart = pane?.chart ?? chartRef.current;
    if (!chart) return;
    /* MULTI SERIES */
    if (entry && typeof entry === "object" && !entry.priceScale) {
      Object.values(entry).forEach((series) => {
        if (!series) return;
        if (typeof series.setData !== "function") return;

        try {
          chart.removeSeries(series);
        } catch { }
      });
    } else {
      /* SINGLE SERIES */
      try {
        chart.removeSeries(entry);
      } catch { }
    }

    delete indicatorSeriesRef.current[indicator];
    delete latestIndicatorValuesRef.current[indicator];

    cleanupPane(paneKey);

    setSelectedIndicator((prev) => prev.filter((i) => i !== indicator));
  }, []);

  const isUp = liveOhlcv?.close >= liveOhlcv?.open;
  const valueColor = isUp ? "text-green-500" : "text-red-500";

  // ----------Main chart------------
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      ...ChartProprties,
      height: mainChartHeightRef.current,
    });
    chartRef.current = chart;
    attachSync(chart);
    //   WebSocket Trades
    const socket = new WebSocket("wss://socket.delta.exchange");
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "subscribe",
          payload: {
            channels: [
              {
                name: "v2/ticker",
                symbols: [selectedCurrency || "BTCUSD"],
              },
            ],
          },
        }),
      );
    };

    let currentCandle = null;
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (!msg?.mark_price || !msg?.timestamp) return;

      const price = Number(msg.mark_price);
      const intervalSec = TIMEFRAME_TO_SECONDS[timeframeValue];
      const time = Math.floor(msg.timestamp / intervalSec) * intervalSec;

      if (!currentCandle || currentCandle.time !== time) {
        currentCandle = {
          time,
          open: price,
          high: price,
          low: price,
          close: price,
        };
        setLiveOhlcv(currentCandle);
      } else {
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;

        setLiveOhlcv({ ...currentCandle }); // ← add this line
      }
    };

    return () => {
      socket.close();
      chart.remove();
    };
  }, [selectedCurrency, timeframeValue]);

  const toggleIndicator = useCallback((indicator) => {
    setSelectedIndicator((prev) => {
      const alreadySelected = prev.includes(indicator);

      if (alreadySelected) {
        const entry = indicatorSeriesRef.current[indicator];

        if (!entry) {
          return prev.filter((i) => i !== indicator);
        }

        const paneKey = resolvePaneKey(indicator);
        const pane = panesRef.current[paneKey];
        const chart = pane?.chart ?? chartRef.current;

        if (!chart) return prev;

        const seriesList = Array.isArray(entry)
          ? entry
          : typeof entry === "object" && !entry.setData
            ? Object.values(entry)
            : [entry];

        seriesList.forEach((series) => {
          if (!series) return;

          try {
            chart.removeSeries(series);
          } catch (e) { }
        });

        delete indicatorSeriesRef.current[indicator];
        delete latestIndicatorValuesRef.current[indicator];

        cleanupPane(paneKey);

        return prev.filter((i) => i !== indicator);
      }

      return [...prev, indicator];
    });
  }, []);
  // RENDER INDICATOR VALUE

  const renderValue = (indicator, value) => {
    if (value == null) return "--";

    if (typeof value === "number") {
      const style =
        indicatorStyle?.[indicator]?.sma ||
        indicatorStyle?.[indicator]?.ma ||
        indicatorStyle?.[indicator]?.[indicator?.toLowerCase()];

      if (style?.visible === false) return null;

      const color = style?.color || "#333";
      return <span style={{ color }}>{Number(value).toFixed(2)}</span>;
    }

    if (typeof value === "object") {
      let keysToShow;

      switch (indicator) {
        case "RSI":
          keysToShow = ["rsi", "smoothingMA"];
          break;
        case "CCI":
          keysToShow = ["cciLine", "cciMa"];
          break;
        case "ROC":
          keysToShow = ["roc"];
          break;
        case "MOM":
          keysToShow = ["mom"];
          break;
        // case "AO":
        //   keysToShow = ["oscData"];
        //   break;
        case "ICHIMOKU":
          keysToShow = [
            "conversionLine",
            "baseLine",
            "leadLine1",
            "leadLine2",
            "laggingSpan",
            "kumoCloudUpper",
            "kumoCloudLower",
          ];
          break;
        default:
          keysToShow = Object.keys(value); // fallback for other indicators
      }

      return keysToShow
        .filter((key) => {
          const style = indicatorStyle?.[indicator]?.[key];
          if (style?.visible === false) return false;
          return value[key] != null;
        })
        .map((key) => {
          const val = value[key];
          const color = indicatorStyle?.[indicator]?.[key]?.color || "#333";

          return (
            <span key={key} style={{ marginRight: 8, color }}>
              {Number.isFinite(val) ? val.toFixed(2) : "--"}
            </span>
          );
        });
    }

    return "--";
  };

  const renderIndicators = () => {
    return selectedIndicator.map((indicator) => {
      const normalizedType = indicator.replace(/[\s/%]+/g, "");
      const Component = indicatorComponents[normalizedType];
      if (!Component) return null;

      const data = indicatorSeriesRef.current?.[normalizedType]; // can be undefined initially

      return (
        <Component
          key={normalizedType}
          result={data?.result} // pass undefined if not yet fetched
          rows={data?.rows}
          indicatorStyle={indicatorStyle}
          indicatorSeriesRef={indicatorSeriesRef}
          addSeries={addSeries}
          chart={chartRef.current}
          containerRef={containerRef}
          panesRef={panesRef}
          indicatorConfigs={indicatorConfigs}
          pane={indicatorSeriesRef.current}
          timeframeValue={timeframeValue} // pass timeframe so useEffect can trigger update
        />
      );
    });
  };

  // SYNC CROSSHAIR
  const updateIndicatorValues = (param) => {
    const updates = {};

    Object.entries(indicatorSeriesRef.current).forEach(([indicator, group]) => {
      if (!group) return;

      const indicatorValues = {};

      Object.entries(group).forEach(([lineName, series]) => {
        if (!series || typeof series.setData !== "function") return;

        const price = param.seriesData?.get(series);
        if (price !== undefined) {
          indicatorValues[lineName] =
            typeof price === "object" ? price.value : price;
        }
      });

      if (Object.keys(indicatorValues).length === 1) {
        updates[indicator] = Object.values(indicatorValues)[0];
      } else if (Object.keys(indicatorValues).length > 0) {
        updates[indicator] = indicatorValues;
      }
    });

    if (Object.keys(updates).length > 0) {
      latestIndicatorValuesRef.current = updates;
      setLiveIndicatorData(updates); // <- triggers renderValue
    }
  };
  // ATTACH CROSSHAIR

  const attachCrosshair = useCallback((chart) => {
    if (!chart) return () => { };
    const handler = (param) => {
      const charts = [
        chartRef.current,
        ...Object.values(panesRef.current).map((p) => p.chart),
      ].filter(Boolean);

      // clear crosshair if invalid
      if (!param?.point || param.time === undefined) {
        charts.forEach((c) => c.clearCrosshairPosition?.());
        setLiveIndicatorData(latestIndicatorValuesRef.current);
        return;
      }

      // sync crosshair
      charts.forEach((c) => {
        c.setCrosshairPosition(
          param.point?.x ?? 0,
          param.point?.y ?? 0,
          param.time,
        );
      });

      // update candles
      const candle = param.seriesData?.get(seriesRef.current);
      if (candle) setLiveOhlcv({ ...candle });

      // update indicators
      updateIndicatorValues(param);
    };

    chart.subscribeCrosshairMove(handler);
    return () => chart.unsubscribeCrosshairMove(handler);
  }, []);

  // ATTACH MAIN CHART

  useEffect(() => {
    // Reattach crosshair whenever series references change
    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ].filter(Boolean);
    const detachHandlers = charts.map((c) => attachCrosshair(c));

    return () => detachHandlers.forEach((d) => d());
  }, [indicatorSeriesRef.current, timeframeValue]);

  // Main useEffect for chart type/data changes
  useEffect(() => {
    if (!chartRef.current) return;

    const loadChart = async () => {
      try {
        const response = await fetchDataByCurrency(
          selectedCurrency,
          timeframeValue,
          chartType,
        );

        const data = response?.data || [];

        if (!Array.isArray(data) || !data.length) return;

        // remove previous series
        if (seriesRef.current) {
          try {
            chartRef.current.removeSeries(seriesRef.current);
          } catch (e) { }
          seriesRef.current = null;
        }

        switch (chartType) {
          case "line":
            seriesRef.current = chartRef.current.addSeries(
              LineSeries,
              chartSeriesStyles.line,
            );

            seriesRef.current.setData(
              data.map((d) => ({
                time: d.time,
                value: Number(d.close),
              })),
            );
            break;

          case "bar":
            seriesRef.current = chartRef.current.addSeries(
              BarSeries,
              chartSeriesStyles.bar,
            );

            seriesRef.current.setData(
              data.map((d) => ({
                time: d.time,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
              })),
            );
            break;

          case "area":
            seriesRef.current = chartRef.current.addSeries(
              AreaSeries,
              chartSeriesStyles.area,
            );

            seriesRef.current.setData(
              data.map((d) => ({
                time: d.time,
                value: Number(d.close),
              })),
            );
            break;

          case "baseline":
            seriesRef.current = chartRef.current.addSeries(BaselineSeries, {
              ...chartSeriesStyles.baseline,
              baseValue: {
                type: "price",
                price: Number(data[0]?.close ?? 0),
              },
            });

            seriesRef.current.setData(
              data.map((d) => ({
                time: d.time,
                value: Number(d.close),
              })),
            );
            break;

          case "histogram":
            seriesRef.current = chartRef.current.addSeries(
              HistogramSeries,
              chartSeriesStyles.histogram,
            );

            seriesRef.current.setData(
              data.map((d, index, arr) => {
                const prev = arr[index - 1];
                const isUp = prev ? d.close >= prev.close : true;

                return {
                  time: d.time,
                  value: d.volume,
                  color: isUp ? "#22c55e" : "#ef4444",
                };
              }),
            );
            break;

          case "heikinashi":
            seriesRef.current = chartRef.current.addSeries(
              CandlestickSeries,
              chartSeriesStyles.candlestick,
            );

            seriesRef.current.setData(convertToHeikinAshi(data));
            break;

          case "hollowcandles":
            seriesRef.current = chartRef.current.addSeries(
              CandlestickSeries,
              chartSeriesStyles.hollowcandles,
            );

            seriesRef.current.setData(data);
            break;

          default:
            seriesRef.current = chartRef.current.addSeries(
              CandlestickSeries,
              chartSeriesStyles.candlestick,
            );

            seriesRef.current.setData(data);
        }

        chartRef.current.timeScale().fitContent();

        await fetchIndicatorData(
          selectedIndicator,
          selectedCurrency,
          timeframeValue,
        );
      } catch (err) {
        console.error("Chart load error", err);
      }
    };

    loadChart();
  }, [chartType, timeframeValue, selectedCurrency, selectedIndicator]);

  const { fetchDataByCurrency, fetchIndicatorData } = useChartFunctions({
    chartRef,
    addSeries,
    indicatorSeriesRef,
    indicatorStyle,
    latestIndicatorValuesRef,
    indicatorConfigs,
    setIndicatorLoading,
  });

  const zoomCharts = (delta) => {
    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ].filter(Boolean);
    charts.forEach((chart) => {
      const range = chart.timeScale().getVisibleLogicalRange();
      if (!range) return;
      chart.timeScale().setVisibleLogicalRange({
        from: range.from + delta,
        to: range.to - delta,
      });
    });
  };

  const zoomIn = () => zoomCharts(1);
  const zoomOut = () => zoomCharts(-1);
  const resetZoom = () => {
    const charts = [
      chartRef.current,
      ...Object.values(panesRef.current).map((p) => p.chart),
    ].filter(Boolean);
    charts.forEach((chart) => chart.timeScale().fitContent());
  };
  return (
    <>
      <section className="trading-view-wrapper">
        <div className="container-fluid p-0 m-0">
          <div className="row">
            <div className="col-md-12">
              <div className="trading-chart-header">
                <ChartHeader
                  timeframeValue={timeframeValue}
                  setTimeframeValue={setTimeframeValue}
                  rangeValue={rangeValue}
                  setRangeValue={setRangeValue}
                  selectedCurrency={selectedCurrency}
                  setSelectedCurrency={setSelectedCurrency}
                  setChartType={setChartType}
                  chartType={chartType}
                  selectedIndicator={selectedIndicator}
                  setSelectedIndicator={setSelectedIndicator}
                  toggleIndicator={toggleIndicator}
                />
              </div>
            </div>
          </div>

          <div className="row" style={{ position: "relative" }}>
            {/* <div className="col-md-1 p-0 m-0"> */}
            {/* <ChartLeftSidebar
                chartRef={chartRef}
                containerRef={containerRef}
              /> */}
            {indicatorLoading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1000,
                }}
              >
                <Spinner />
              </div>
            )}
            {renderIndicators()}
          </div>
          {/* main chart */}
          <div className="col-md-7">
            <div
              ref={containerRef}
              style={{
                width: ChartProprties.width,
                height: ChartProprties.height,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* -------------------------------sub-header live Values----------------------- */}
              <div className="flex px-2 top-2 z-10 absolute items-center gap-2 bg-slate-100 justify-start">
                {/* LEFT: Symbol */}
                <div className="text-sm text-slate-950">
                  {selectedCurrency} : {timeframeValue} :
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    {/* outer ring */}
                    <span
                      className={`absolute inset-0 rounded-full opacity-30 animate-ping ${isMarketOpen ? "bg-green-500" : "bg-red-400"}`}
                    ></span>

                    {/* inner dot */}
                    <span
                      className={`relative block w-3 h-3 rounded-full ${isMarketOpen ? "bg-green-500" : "bg-red-400"}`}
                    ></span>
                  </div>
                </div>

                {/* CENTER: Timeframes */}
                <div className="d-flex gap-2 align-items-center">
                  {SINGLE_VALUE_CHARTS.includes(chartType) ? (
                    // Line / Area / Baseline → Close only
                    <h6 className="px-2 py-1 mb-0">
                      <span className="text-primary">{liveOhlcv?.value}</span>
                    </h6>
                  ) : (
                    // Other charts → OHLC
                    <>
                      <h6 className="px-2 py-1 mb-0">
                        O: <span className={valueColor}>{liveOhlcv?.open}</span>
                      </h6>
                      <h6 className="px-2 py-1 mb-0">
                        H: <span className={valueColor}>{liveOhlcv?.high}</span>
                      </h6>
                      <h6 className="px-2 py-1 mb-0">
                        L: <span className={valueColor}>{liveOhlcv?.low}</span>
                      </h6>
                      <h6 className="px-2 py-1 mb-0">
                        C:{" "}
                        <span className={valueColor}>{liveOhlcv?.close}</span>
                      </h6>
                    </>
                  )}
                </div>
              </div>

              {/* -----------------INDICATOR BAR------------------- */}

              {selectedIndicator?.length > 0 && (
                <div className="absolute top-10 left-2 flex flex-col gap-1 z-50">
                  {selectedIndicator &&
                    selectedIndicator?.map((indicator, index) => {
                      const normalizedType = indicator.replace(/[\s/%]+/g, "");
                      const value = liveIndicatorData[normalizedType];
                      return (
                        <div
                          key={index}
                          className="flex w-full justify-between items-center gap-3 bg-white shadow-sm border border-slate-200 rounded-3 px-3 h-8 text-xs "
                        >
                          <span className="font-medium w-full text-slate-800 flex items-center gap-2">
                            {indicator} :{" "}
                            {indicatorConfigs?.[normalizedType]?.length ?? ""}{" "}
                            {indicatorConfigs?.[normalizedType]?.source ?? ""}{" "}
                            <span style={{ display: "flex", gap: 6 }}>
                              {renderValue(normalizedType, value)}
                            </span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              title={
                                indicatorVisibility[normalizedType]
                                  ? "Hide Indicator"
                                  : "Show Indicator"
                              }
                              onClick={() =>
                                toggleIndicatorVisibility(normalizedType)
                              }
                              className="text-slate-600"
                            >
                              {indicatorVisibility[normalizedType] ? (
                                <IoEyeOutline size={18} />
                              ) : (
                                <IoEyeOffOutline size={18} />
                              )}
                            </button>

                            <button
                              title="Indicator Settings"
                              onClick={() => {
                                setActiveBarIndicator(indicator);
                                setIndicatorProperty((prev) => !prev);
                              }}
                              className="text-slate-600"
                            >
                              <IoSettingsOutline size={18} />
                            </button>

                            <button
                              title="Source Code"
                              onClick={() => {
                                setActiveSourceIndicator(indicator);
                                setShowSourcePanel(true);
                              }}
                              className="text-slate-600"
                            >
                              <FaCode size={18} />
                            </button>

                            <button
                              onClick={() => removeIndicator(normalizedType)}
                              className="text-slate-600"
                            >
                              <IoCloseSharp size={18} />
                            </button>
                          </div>

                          {showAlertForm && (
                            <IndicatorAlert
                              onClose={closeAlert}
                              value={value}
                              liveOhlcv={liveOhlcv}
                              symbol={selectedCurrency}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
              {/* {selectedIndicator.map((indicator, index) => {
                const value = liveIndicatorData[indicator];
                const paneIndex = paneIndexRef.current[indicator];
                if (paneIndex === undefined || paneIndex === 0) return null;
                return (
                  <IndicatorBar
                    key={indicator}
                    indicator={indicator}
                    timeframeValue={timeframeValue}
                    value={value}
                    renderValue={renderValue}
                    indicatorVisibility={indicatorVisibility}
                    toggleIndicatorVisibility={toggleIndicatorVisibility}
                    removeIndicator={removeIndicator}
                    setActiveBarIndicator={setActiveBarIndicator}
                    setIndicatorProperty={setIndicatorProperty}
                    setActiveSourceIndicator={setActiveSourceIndicator}
                    setShowSourcePanel={setShowSourcePanel}
                    setShowAlertForm={setShowAlertForm}
                  />
                );
              })} */}
            </div>
          </div>
          {/* <div className="col-md-3">
            <ChartRightSidebar />
          </div> */}
        </div>
        {/* </div> */}

        <SourceCodePanel
          show={showSourcePanel}
          indicator={activeSourceIndicator}
          onClose={() => setShowSourcePanel(false)}
        />
      </section>
      <section className="market-trading-part">
        <div className="container p-0 m-0">
          <div className="row">
            <div className="d-flex align-items-center position-relative">
              <div className="mx-auto d-flex align-items-center gap-2">
                <button
                  onClick={zoomIn}
                  className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-purple-50 hover:to-indigo-50 text-slate-700 hover:text-purple-700 font-semibold rounded-xl shadow-sm hover:shadow-md border border-slate-200/50 hover:border-purple-300/50 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                >
                  <LuCirclePlus className="w-4 h-4 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
                  <span className="text-sm">Zoom In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

                <button
                  onClick={zoomOut}
                  className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-purple-50 hover:to-indigo-50 text-slate-700 hover:text-purple-700 font-semibold rounded-xl shadow-sm hover:shadow-md border border-slate-200/50 hover:border-purple-300/50 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                >
                  <LuCircleMinus className="w-4 h-4 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
                  <span className="text-sm">Zoom Out</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

                <button
                  onClick={resetZoom}
                  className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                >
                  <RiResetRightLine className="w-4 h-4 group-hover:rotate-[360deg] transition-transform duration-500" />
                  <span className="text-sm">Reset</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                </button>
              </div>

              {/* Floating Open Button */}
              {!openForm && (
                <div className="d-flex justify-content-end position-sticky top-0 ">
                  <button
                    onClick={() => setOpenForm(true)}
                    className="btn btn-primary d-flex align-items-center gap-1 mx-3"
                    style={{ zIndex: 1050 }}
                  >
                    <IoLink />
                  </button>
                </div>
              )}
            </div>

            {/* Sliding Panel */}
            <div
              className="position-fixed top-0 end-0 vh-100 bg-white shadow"
              style={{
                width: "900px",
                height: "100vh",
                zIndex: 1050,
                transform: openForm ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.6s ease-out",
              }}
            >
              <IndicatorRuleBuilder
                onOpen={() => setOpenForm(true)}
                onClose={() => setOpenForm(false)}
              />
            </div>
            {openForm && (
              <div
                className="position-fixed top-0 start-0 w-100 vh-100 bg-dark bg-opacity-25"
                style={{ zIndex: 1040 }}
                onClick={() => setOpenForm(false)}
              />
            )}
            {/* --------------indicator sub part property show in modal-------------- */}
            <IndicatorPropertyDialog
              setIndicatorProperty={setIndicatorProperty}
              indicatorProperty={indicatorProperty}
              activeBarIndicator={activeBarIndicator}
              setIndicatorConfigs={setIndicatorConfigs}
              indicatorConfigs={indicatorConfigs}
              indicatorStyle={indicatorStyle}
              setIndicatorStyle={setIndicatorStyle}
              indicatorSeriesRef={indicatorSeriesRef}
              selectedCurrency={selectedCurrency}
              timeframeValue={timeframeValue}
              chartRef={chartRef}
              addSeries={addSeries}
              latestIndicatorValuesRef={latestIndicatorValuesRef}
            />
          </div>
        </div>
      </section>
      <div className="">
        {/* <IndicatorRuleBuilder /> */}
        <IndicatorBuildingListing
          selectedCurrency={selectedCurrency}
          timeframeValue={timeframeValue}
        />
      </div>
    </>
  );
}
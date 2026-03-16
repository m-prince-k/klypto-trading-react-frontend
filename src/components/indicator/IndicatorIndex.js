import IchimokuCloudPlot from "./IchimokuCloud/IchimokuCloudPlot";
import RSIPlot from "./RSI/RSIPlot";
import SMAPlot from "./SMA/SMAPlot";
import EMAPlot from "./EMA/EMAPlot";
import RSIInput from "./RSI/RSIInput";
import SMAInput from "./SMA/SMAInput";
import WMAPlot from "./WMA/WMAPlot";
import WMAInput from "./WMA/WMAInput";
import IchimokuCloudInput from "./IchimokuCloud/IchimokuCloudInput";
import EMAInput from "./EMA/EMAInput";
import HMAPlot from "./HMA/HMAPlot";
import HMAInput from "./HMA/HMAInput";
import TEMAInput from "./TEMA/TEMAInput";
import TEMAPlot from "./TEMA/TEMAPlot";
import DEMAInput from "./DEMA/DEMAInput";
import DEMAPlot from "./DEMA/DEMAplot";
import KAMAPlot from "./KAMA/KAMAPlot";
import KAMAInput from "./KAMA/KAMAInput";
import SuperTrendPlot from "./SuperTrend/SuperTrendPlot";
import SuperTrendInput from "./SuperTrend/SuperTrendInput";
import AroonInput from "./Aroon/AroonInput";
import AroonPlot from "./Aroon/AroonPlot";
import AroonOscillatorInput from "./AroonOscillator/AroonOscillatorInput";
import ADXPlot from "./ADX/ADXPlot";
import AroonOscillatorPlot from "./AroonOscillator/AroonOscillatorPlot";
import ADXInput from "./ADX/ADXInput";
import CCIInput from "./CCI/CCIInput";
import CCIPlot from "./CCI/CCIPlot";
import MomentumInput from "./Momentum/MomentumInput";
import MomentumPlot from "./Momentum/MomentumPlot";
import ROCPlot from "./ROC/ROCPlot";
import ROCInput from "./ROC/ROCInput";
import WilliamsRInput from "./WilliamsR/WilliamsRInput";
import WilliamsRPlot from "./WilliamsR/WilliamsRPlot";
import ATRPlot from "./ATR/ATRPlot";
import ATRInput from "./ATR/ATRInput";
import MFIInput from "./MFI/MFIInput";
import MFIPlot from "./MFI/MFIPlot";

export const indicatorComponents = {
  RSI: RSIPlot,
  SMA: SMAPlot,
  IchimokuCloud: IchimokuCloudPlot,
  EMA: EMAPlot,
  WMA: WMAPlot,
  HMA: HMAPlot,
  DEMA: DEMAPlot,
  TEMA: TEMAPlot,
  KAMA: KAMAPlot,
  SuperTrend: SuperTrendPlot,
  Aroon: AroonPlot,
  AroonOscillator: AroonOscillatorPlot,
  ADX: ADXPlot,
  CCI: CCIPlot,
  Momentum: MomentumPlot,
  ROC: ROCPlot,
  WilliamsR : WilliamsRPlot,
  ATR: ATRPlot,
  MFI: MFIPlot,
};

export const indicatorInputs = {
  RSI: RSIInput,
  SMA: SMAInput,
  IchimokuCloud: IchimokuCloudInput,
  EMA: EMAInput,
  WMA: WMAInput,
  HMA: HMAInput,
  DEMA: DEMAInput,
  TEMA: TEMAInput,
  KAMA: KAMAInput,
  SuperTrend: SuperTrendInput,
  Aroon: AroonInput,
  AroonOscillator: AroonOscillatorInput,
  ADX: ADXInput,
  CCI: CCIInput,
  Momentum:MomentumInput,
  ROC:ROCInput,
  WilliamsR : WilliamsRInput,
  ATR: ATRInput,
  MFI:MFIInput,
};

export function updateIndicatorFromInput(
  indicatorType,
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType,
) {
  const handler = indicatorInputs[indicatorType];
  if (!handler) {
    console.warn("No input handler for:", indicatorType);
    return;
  }

  handler(response, indicatorSeriesRef, latestIndicatorValuesRef, maType);
}

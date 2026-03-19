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
import MFIPlot from "./MFI/MFIPlot";
import MFIInput from "./MFI/MFIInput";
import PSARPlot from "./PSAR/PSARPlot";
import PSARInput from "./PSAR/PSARInput";

import CHOPPlot from "./CHOP/CHOPPlot";
import CHOPInput from "./CHOP/CHOPInput";
import EOMInput from "./EOM/EOMInput";
import CMOInput from "./CMO/CMOInput";
import CMOPlot from "./CMO/CMOPlot";
import PVOInput from "./PVO/PVOInput";
import PVOPlot from "./PVO/PVOPlot";
import OBVInput from "./OBV/OBVInput";
import OBVPlot from "./OBV/OBVPlot";
import VOLPlot from "./VOL/VOLPlot";
import VOLInput from "./VOL/VOLInput";
import STDDEVInput from "./STDDEV/STDDEVInput";
import STDDEVPlot from "./STDDEV/STDDEVPlot";
import TRIXInput from "./TRIX/TRIXInput";
import TRIXPlot from "./TRIX/TRIXPlot";
import VPPlot from "./VP/VPPlot";
import VPInput from "./VP/VPInput";

import DCInput from "./DC/DCInput";
import DCPlot from "./DC/DCPlot";
import KCPlot from "./KC/KCPlot";
import KCInput from "./KC/KCInput";
import EOMPlot from "./EOM/EOMPlot";
import BBPlot from "./BB/BBPlot";
import BBInput from "./BB/BBInput";

import BollingerBandWidthInputs from "./bollinder-band-width/bollinder-band-width-inputs";
import BollingerBandWidthPlot from "./bollinder-band-width/bollinger-band-width-plot";



import ChandeKrollStopPlot from "./CKS/chande-kroll-stop-plot";
import ChandeKrollStopInput from "./CKS/chande-kroll-stop-inputs"

import HistoricalVolatilityPlot from "./historical-volatity/historical-volatility-inputs"
import HistoricalVolatilityInput from "./historical-volatity/historical-volatility-inputs";
 
import ChaikinMoneyFlowInput from "./CMF/Chaikin-money-flow-inputs";
import ChaikinMoneyFlowPlot from "./CMF/chaikin-money-flow-plot";

import NVIInput from "./NVI/Negative-volume-index-inputs";
import NVIPlot from "./NVI/negative-volume-plot"

import MACDPlot from "./MACD/MACDPlot";
import MACDInput from "./MACD/macd-inputs";


import VWAPPlot from "./vwap/vwap-plot";
import VWAPInput from "./vwap/vwap-inputs";

export const indicatorComponents = {
  VWAP:VWAPPlot,
  MACD:MACDPlot,
  CKS:ChandeKrollStopPlot,
  HV:HistoricalVolatilityPlot,
  CMF:ChaikinMoneyFlowPlot,
  NVI:NVIPlot,
  BBW:BollingerBandWidthPlot,
  RSI: RSIPlot,
  SMA: SMAPlot,
  ICHIMOKU: IchimokuCloudPlot,
  EMA: EMAPlot,
  WMA: WMAPlot,
  HMA: HMAPlot,
  DEMA: DEMAPlot,
  TEMA: TEMAPlot,
  KAMA: KAMAPlot,
  SUPERTREND: SuperTrendPlot,
  AROON: AroonPlot,
  AO: AroonOscillatorPlot,
  ADX: ADXPlot,
  CCI: CCIPlot,
  MOM: MomentumPlot,
  ROC: ROCPlot,
  WPR: WilliamsRPlot,
  ATR: ATRPlot,
  MFI: MFIPlot,
  PSAR: PSARPlot,
<<<<<<< HEAD
  EOM: EMAPlot,

  DC: DCPlot,
  KC: KCPlot,
  EOM: EOMPlot,
  BB: BBPlot,

=======
  EOM:EMAPlot,
  CMO:CMOPlot,
  PVO:PVOPlot,
  OBV:OBVPlot,
  VOL:VOLPlot,
  STDDEV:STDDEVPlot,
  AD:ADXPlot,
  TRIX:TRIXPlot,
  VP:VPPlot,
 
>>>>>>> 1a0c955933d66f091f01495fa9f09f4d64b065c0
};

export const indicatorInputs = {
  VWAP:VWAPInput,
  MACD:MACDInput,
  CKS:ChandeKrollStopInput,
  HV:HistoricalVolatilityInput,
  CMF:ChaikinMoneyFlowInput,
  NVI:NVIInput,
  BBW:BollingerBandWidthInputs,
  RSI: RSIInput,
  SMA: SMAInput,
  ICHIMOKU: IchimokuCloudInput,
  EMA: EMAInput,
  WMA: WMAInput,
  HMA: HMAInput,
  DEMA: DEMAInput,
  TEMA: TEMAInput,
  KAMA: KAMAInput,
  SUPERTREND: SuperTrendInput,
  AROON: AroonInput,
  AO: AroonOscillatorInput,
  ADX: ADXInput,
  CCI: CCIInput,
  MOM: MomentumInput,
  ROC: ROCInput,
  WPR: WilliamsRInput,
  ATR: ATRInput,
  MFI: MFIInput,
  PSAR: PSARInput,
<<<<<<< HEAD

  CHOP: CHOPInput,
  EOM: EOMInput,

  DC: DCInput,
  KC: KCInput,
  EOM: EOMInput,
  BB: BBInput
  

=======
  EOM:EOMInput,
  CMO:CMOInput,
  PVO:PVOInput,
 OBV:OBVInput,
 VOL:VOLInput,
 STDDEV:STDDEVInput,
 AD:ADXInput,
 TRIX:TRIXInput,
 VP:VPInput,
  
>>>>>>> 1a0c955933d66f091f01495fa9f09f4d64b065c0
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

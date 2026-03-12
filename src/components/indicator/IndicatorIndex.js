import IchimokuCloudPlot from "./IchimokuCloud/IchimokuCloudPlot";
import RSIPlot from "./RSI/RSIPlot";
import SMAPlot from "./SMA/SMAPlot";
import EMAPlot from "./EMA/EMAPlot";
import RSIInput from "./RSI/RSIInput";
import SMAInput from "./SMA/SMAInput";
import IchimokuCloudInput from "./IchimokuCloud/IchimokuCloudInput";

export const indicatorComponents = {
  RSI: RSIPlot,
  SMA: SMAPlot,
  IchimokuCloud: IchimokuCloudPlot,
  EMA: EMAPlot,
};

export const indicatorInputs = {
  RSI: RSIInput,
  SMA: SMAInput,
  IchimokuCloud: IchimokuCloudInput,
};

export function updateIndicatorFromInput(
  indicatorType,
  response,
  indicatorSeriesRef,
  latestIndicatorValuesRef,
  maType
) {
  const handler = indicatorInputs[indicatorType];
  if (!handler) {
    console.warn("No input handler for:", indicatorType);
    return;
  }

  handler(response, indicatorSeriesRef, latestIndicatorValuesRef,maType);
}

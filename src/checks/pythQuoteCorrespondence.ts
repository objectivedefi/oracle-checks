import { Asset, PythPriceFeed } from "@objectivelabs/oracle-sdk";

import { CheckResultWithId } from "./types";
import { CHECKS, failCheck, passCheck } from "./utils";

type Params = {
  quote?: Asset;
  feed?: PythPriceFeed;
};

export function pythQuoteCorrespondence({ quote, feed }: Params): CheckResultWithId {
  if (!quote) {
    return failCheck(CHECKS.PYTH_QUOTE_CORRESPONDENCE, "Quote asset is unknown");
  }

  if (!feed) {
    return failCheck(CHECKS.PYTH_QUOTE_CORRESPONDENCE, "Feed is unknown");
  }

  const quoteSymbol = quote.symbol;
  const feedQuoteSymbol = feed.attributes.quote_currency;

  if (
    quoteSymbol.toLocaleLowerCase() === feedQuoteSymbol.toLocaleLowerCase() ||
    (quoteSymbol === "WETH" && feedQuoteSymbol === "ETH")
  ) {
    return passCheck(
      CHECKS.PYTH_QUOTE_CORRESPONDENCE,
      `Quote symbol (${quoteSymbol}) matches Pyth feed quote asset (${feedQuoteSymbol})`,
    );
  } else {
    return failCheck(
      CHECKS.PYTH_QUOTE_CORRESPONDENCE,
      `Quote symbol (${quoteSymbol}) does not match Pyth feed quote asset (${feedQuoteSymbol})`,
    );
  }
}

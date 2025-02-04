import { PythMetadata, PythOracle, PythPriceFeed } from "@objectivelabs/oracle-sdk";

import { CheckResultWithId } from "./types";
import { CHECKS, failCheck, passCheck } from "./utils";

type Params = {
  adapter: PythOracle;
  pythMetadata: PythMetadata | undefined;
};

export function pythFeedOfficial({ adapter, pythMetadata }: Params): {
  result: CheckResultWithId;
  feed: PythPriceFeed | undefined;
} {
  const matchingPythFeed = pythMetadata?.find((feed) => feed.id === adapter.feedId);
  if (matchingPythFeed) {
    return {
      result: passCheck(
        CHECKS.OFFICIAL_PYTH_FEED,
        `Adapter is connected to an official Pyth feed: ${matchingPythFeed.attributes.display_symbol}`,
      ),
      feed: matchingPythFeed,
    };
  } else {
    return {
      result: failCheck(CHECKS.OFFICIAL_PYTH_FEED, "Could not find matching Pyth feed"),
      feed: undefined,
    };
  }
}

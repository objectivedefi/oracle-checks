import {
  ChainlinkMetadata,
  ChainlinkInfrequentOracle,
  ChainlinkOracle,
  RedStoneMetadata,
} from "@objectivelabs/oracle-sdk";
import { Address } from "viem";

import { CheckResultWithId } from "./types";
import { CHECKS, failCheck, passCheck } from "./utils";

type Params = {
  adapter: ChainlinkOracle | ChainlinkInfrequentOracle;
  chainlinkMetadata?: ChainlinkMetadata;
  redstoneMetadata?: RedStoneMetadata;
  otherRecognizedAggregatorV3Feeds: Record<Address, { provider: string; description: string }>;
};

export function knownAggregatorV3Feed({
  adapter,
  chainlinkMetadata,
  redstoneMetadata,
  otherRecognizedAggregatorV3Feeds,
}: Params): {
  result: CheckResultWithId;
  label: string;
  heartbeat?: number;
} {
  const matchingChainlinkFeed = chainlinkMetadata?.find(
    (feed) => feed.proxyAddress?.toLowerCase() === adapter.feed.toLowerCase(),
  );

  const matchingRedstoneFeed = redstoneMetadata?.find(
    (feed) => feed.priceFeedAddress === adapter.feed,
  );

  const matchingOtherFeed = otherRecognizedAggregatorV3Feeds[adapter.feed];

  if (matchingChainlinkFeed) {
    return {
      result: passCheck(
        CHECKS.RECOGNIZED_AGGREGATOR_V3_FEED,
        `Adapter is connected to an official Chainlink feed: ${matchingChainlinkFeed.name}`,
      ),
      label: `Chainlink - ${matchingChainlinkFeed.name} (${matchingChainlinkFeed.threshold}%, ${matchingChainlinkFeed.heartbeat}s)`,
      heartbeat: matchingChainlinkFeed.heartbeat,
    };
  } else if (matchingRedstoneFeed) {
    return {
      result: passCheck(
        CHECKS.RECOGNIZED_AGGREGATOR_V3_FEED,
        `Adapter is connected to an official RedStone feed: ${matchingRedstoneFeed.symbol}`,
      ),
      label: `RedStone - ${matchingRedstoneFeed.symbol} (${matchingRedstoneFeed.deviationPercentage}%, ${matchingRedstoneFeed.heartbeat}s)`,
      heartbeat: matchingRedstoneFeed.heartbeat,
    };
  } else if (matchingOtherFeed) {
    return {
      result: passCheck(
        CHECKS.RECOGNIZED_AGGREGATOR_V3_FEED,
        `Adapter is connected to a recognized non-standard feed: ${matchingOtherFeed.description}`,
      ),
      label: `${matchingOtherFeed.provider}: ${matchingOtherFeed.description}`,
    };
  } else {
    return {
      result: failCheck(
        CHECKS.RECOGNIZED_AGGREGATOR_V3_FEED,
        `Could not find matching Chainlink or RedStone feed for ${adapter.feed}`,
      ),
      label: `Unknown AggregatorV3 Feed`,
    };
  }
}

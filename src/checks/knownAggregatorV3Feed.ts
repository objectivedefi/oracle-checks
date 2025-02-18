import {
  ChainlinkMetadata,
  ChainlinkInfrequentOracle,
  ChainlinkOracle,
  RedStoneMetadata,
} from "@objectivelabs/oracle-sdk";
import { Address } from "viem";

import { CheckResultWithId } from "./types";
import { CHECKS, failCheck, passCheck } from "./utils";
import { OracleMethodology } from "../types";

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
  methodology: OracleMethodology;
  provider: string;
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
    const isExchangeRate =
      matchingChainlinkFeed.docs?.productTypeCode === "ExRate" ||
      matchingChainlinkFeed.docs?.productSubType === "Exchange Rate" ||
      matchingChainlinkFeed.path?.toLowerCase().endsWith("exchange-rate");
    matchingChainlinkFeed.name?.toLowerCase().endsWith("exchange rate");

    return {
      result: passCheck(
        CHECKS.RECOGNIZED_AGGREGATOR_V3_FEED,
        `Adapter is connected to an official Chainlink feed: ${matchingChainlinkFeed.name}`,
      ),
      label: `Chainlink - ${matchingChainlinkFeed.name} (${matchingChainlinkFeed.threshold}%, ${matchingChainlinkFeed.heartbeat}s)`,
      heartbeat: matchingChainlinkFeed.heartbeat,
      methodology: isExchangeRate ? "Exchange Rate" : "Market Price",
      provider: "Chainlink",
    };
  } else if (matchingRedstoneFeed) {
    const isExchangeRate = matchingRedstoneFeed.symbol.includes("FUNDAMENTAL");
    return {
      result: passCheck(
        CHECKS.RECOGNIZED_AGGREGATOR_V3_FEED,
        `Adapter is connected to an official RedStone feed: ${matchingRedstoneFeed.symbol}`,
      ),
      label: `RedStone - ${matchingRedstoneFeed.symbol} (${matchingRedstoneFeed.deviationPercentage}%, ${matchingRedstoneFeed.heartbeat}s)`,
      heartbeat: matchingRedstoneFeed.heartbeat,
      methodology: isExchangeRate ? "Exchange Rate" : "Market Price",
      provider: "RedStone",
    };
  } else if (matchingOtherFeed) {
    return {
      result: passCheck(
        CHECKS.RECOGNIZED_AGGREGATOR_V3_FEED,
        `Adapter is connected to a recognized non-standard feed: ${matchingOtherFeed.description}`,
      ),
      label: `${matchingOtherFeed.provider}: ${matchingOtherFeed.description}`,
      methodology: "Unknown",
      provider: matchingOtherFeed.provider,
    };
  } else {
    return {
      result: failCheck(
        CHECKS.RECOGNIZED_AGGREGATOR_V3_FEED,
        `Could not find matching recognized AggregatorV3 feed for ${adapter.feed}`,
      ),
      label: `Unknown AggregatorV3 Feed`,
      methodology: "Unknown",
      provider: "Unknown",
    };
  }
}

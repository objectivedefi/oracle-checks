import { chainIdToPythProxy } from "@objectivelabs/oracle-sdk";
import { Address } from "viem";

import {
  assetConsistent,
  assetsDistinct,
  CheckResult,
  existence,
  knownAggregatorV3Feed,
  knownMetadataHash,
  pushHeartbeat,
  pythBaseCorrespondence,
  pythFeedOfficial,
  pythProxyOfficial,
  pythQuoteCorrespondence,
  pythStalenessRange,
} from "./checks";
import { chainConfigs } from "./config/chainConfigs";
import { extractAssetAddresses } from "./extractAssetAddresses";
import { AdapterToResults, CollectedData } from "./types";

type Params = CollectedData & {
  adapterAddresses: Address[];
  chainId: number;
};

export function runChecks({
  adapterAddresses,
  chainId,
  adapters,
  bytecodes,
  assets,
  chainlinkMetadata,
  redstoneMetadata,
  pythMetadata,
}: Params): AdapterToResults {
  const {
    fallbackAssets,
    minPushHeartbeatBuffer,
    pythStalenessLowerBound,
    pythStalenessUpperBound,
    otherRecognizedAggregatorV3Feeds,
    metadataHashes,
  } = chainConfigs[chainId];

  const adapterToResults: AdapterToResults = {};

  adapters.forEach((adapter, index) => {
    const checks: CheckResult[] = [];
    const existenceCheck = existence({
      chainId,
      address: adapterAddresses[index],
      adapter,
    });
    checks.push(existenceCheck);

    if (!existenceCheck.pass || !adapter) {
      return;
    }

    checks.push(
      knownMetadataHash({
        adapter,
        code: bytecodes[index],
        allowedMetadataHashes: metadataHashes[adapter.name],
      }),
    );

    const assetAddresses = extractAssetAddresses(adapter);
    checks.push(assetsDistinct(assetAddresses));

    const adapterAssets = assetAddresses.map((assetAddress) =>
      assets.find((asset) => asset.address === assetAddress),
    );
    adapterAssets.forEach((asset, i) => {
      checks.push(
        assetConsistent({
          asset,
          address: assetAddresses[i],
          recognizedDesignatorAddresses: fallbackAssets.map((asset) => asset.address),
        }),
      );
    });

    const name = adapter.name;
    if (name === "ChainlinkOracle" || name === "ChainlinkInfrequentOracle") {
      const aggregatorV3FeedCheck = knownAggregatorV3Feed({
        adapter,
        chainlinkMetadata,
        redstoneMetadata,
        otherRecognizedAggregatorV3Feeds,
      });
      checks.push(aggregatorV3FeedCheck.result);

      const heartbeatCheck = pushHeartbeat({
        maxStaleness: adapter.maxStaleness,
        heartbeat: aggregatorV3FeedCheck.heartbeat,
        minHeartbeatBuffer: minPushHeartbeatBuffer,
      });
      checks.push(heartbeatCheck);
    } else if (name === "PythOracle") {
      const pythFeedCheck = pythFeedOfficial({
        adapter,
        pythMetadata,
      });
      checks.push(pythFeedCheck.result);

      checks.push(
        pythBaseCorrespondence({
          base: assets.find((asset) => asset.address === adapter.base),
          feed: pythFeedCheck.feed,
        }),
      );

      checks.push(
        pythQuoteCorrespondence({
          quote: assets.find((asset) => asset.address === adapter.quote),
          feed: pythFeedCheck.feed,
        }),
      );

      checks.push(
        pythProxyOfficial({
          adapter,
          pythProxyAddress: chainIdToPythProxy[chainId],
        }),
      );
      checks.push(
        pythStalenessRange({
          adapter,
          lowerBound: pythStalenessLowerBound,
          upperBound: pythStalenessUpperBound,
        }),
      );
    }
    adapterToResults[adapter.address] = {
      checks,
    };
  });

  return adapterToResults;
}

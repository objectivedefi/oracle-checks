import { arbitrum, base, mainnet, polygon, sonic } from "viem/chains";

import { fallbackAssets } from "./fallbackAssets";
import { getAddressesForChain } from "./getAddressesForChain";
import { getClient } from "./getClient";
import { metadataHashes } from "./metadataHashes";
import { CheckConfig } from "./types";

const minPushHeartbeatBuffer = 3600;

export const chainConfigs: Record<number, CheckConfig> = {
  [mainnet.id]: {
    publicClient: getClient(mainnet),
    fromBlock: 20541273n,
    metadataHashes,
    minPushHeartbeatBuffer,
    pythStalenessLowerBound: 30,
    pythStalenessUpperBound: 300,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {
      "0x056339C044055819E8Db84E71f5f2E1F536b2E5b": {
        provider: "Midas",
        description: "Midas mTBILL/USD Oracle",
      },
      "0xE4f2AE539442e1D3Fb40F03ceEbF4A372a390d24": {
        provider: "Midas",
        description: "Midas mBASIS/USD Oracle",
      },
      "0xA537EF0343e83761ED42B8E017a1e495c9a189Ee": {
        provider: "Midas",
        description: "Midas mBTC/BTC Oracle",
      },
      "0xf87d2F4d42856f0B6Eae140Aaf78bF0F777e9936": {
        provider: "MEV Capital",
        description: "MEV Capital ETH+/USD Oracle",
      },
      "0xAdb2c15Fde49D1A4294740aCb650de94184E66b2": {
        provider: "Resolv",
        description: "Resolv RLP/USD Oracle",
      },
    },
    ...getAddressesForChain(mainnet.id),
  },
  [polygon.id]: {
    publicClient: getClient(polygon),
    fromBlock: 64475526n,
    metadataHashes,
    minPushHeartbeatBuffer,
    pythStalenessLowerBound: 15,
    pythStalenessUpperBound: 120,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...getAddressesForChain(polygon.id),
  },
  [sonic.id]: {
    publicClient: getClient(sonic),
    fromBlock: 5324531n,
    metadataHashes,
    minPushHeartbeatBuffer,
    pythStalenessLowerBound: 15,
    pythStalenessUpperBound: 120,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...getAddressesForChain(sonic.id),
  },
  [base.id]: {
    publicClient: getClient(base),
    fromBlock: 22282357n,
    metadataHashes,
    minPushHeartbeatBuffer,
    pythStalenessLowerBound: 15,
    pythStalenessUpperBound: 120,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {
      "0x70E58b7A1c884fFFE7dbce5249337603a28b8422": {
        provider: "Midas",
        description: "Midas mTBILL/USD Oracle",
      },
      "0x6d62D3C3C8f9912890788b50299bF4D2C64823b6": {
        provider: "Midas",
        description: "Midas mBASIS/USD Oracle",
      },
    },
    ...getAddressesForChain(base.id),
  },
  [arbitrum.id]: {
    publicClient: getClient(arbitrum),
    fromBlock: 300691039n,
    metadataHashes,
    minPushHeartbeatBuffer,
    pythStalenessLowerBound: 15,
    pythStalenessUpperBound: 120,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...getAddressesForChain(arbitrum.id),
  },
};

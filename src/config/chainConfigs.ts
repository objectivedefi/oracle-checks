import {
  arbitrum,
  avalanche,
  base,
  berachain,
  bob,
  bsc,
  corn,
  gnosis,
  ink,
  mainnet,
  optimism,
  polygon,
  sonic,
  swellchain,
} from "viem/chains";

import { fallbackAssets } from "./fallbackAssets";
import { getAddressesForChain } from "./getAddressesForChain";
import { getClient } from "./getClient";
import { metadataHashes } from "./metadataHashes";
import { CheckConfig } from "./types";

const defaultBounds = {
  minPushHeartbeatBuffer: 3600,
  pythStalenessLowerBound: 30,
  pythStalenessUpperBound: 300,
};

export const chainConfigs: Record<number, CheckConfig> = {
  [mainnet.id]: {
    publicClient: getClient(mainnet),
    fromBlock: 20541273n,
    metadataHashes,
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
    ...defaultBounds,
    ...getAddressesForChain(mainnet.id),
  },
  [optimism.id]: {
    publicClient: getClient(optimism),
    fromBlock: 131522277n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(optimism.id),
  },
  [gnosis.id]: {
    publicClient: getClient(gnosis),
    fromBlock: 38384051n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(gnosis.id),
  },
  [polygon.id]: {
    publicClient: getClient(polygon),
    fromBlock: 64475526n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(polygon.id),
  },
  [sonic.id]: {
    publicClient: getClient(sonic),
    fromBlock: 5324531n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(sonic.id),
  },
  [swellchain.id]: {
    publicClient: getClient(swellchain),
    fromBlock: 485320n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(swellchain.id),
  },
  [corn.id]: {
    publicClient: getClient(corn),
    fromBlock: 221011n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(corn.id),
  },
  [arbitrum.id]: {
    publicClient: getClient(arbitrum),
    fromBlock: 300691039n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(arbitrum.id),
  },
  [avalanche.id]: {
    publicClient: getClient(avalanche),
    fromBlock: 56805692n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(avalanche.id),
  },
  [bsc.id]: {
    publicClient: getClient(bsc),
    fromBlock: 46370642n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(bsc.id),
  },
  [ink.id]: {
    publicClient: getClient({
      ...ink,
      contracts: {
        ...ink.contracts,
        multicall3: {
          address: "0xcA11bde05977b3631167028862bE2a173976CA11",
          blockCreated: 1000000,
        },
      },
    }),
    fromBlock: 402613n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(ink.id),
  },
  [bob.id]: {
    publicClient: getClient(bob),
    fromBlock: 11481883n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(bob.id),
  },
  [berachain.id]: {
    publicClient: getClient({
      ...berachain,
      contracts: {
        ...berachain.contracts,
        multicall3: {
          address: "0xcA11bde05977b3631167028862bE2a173976CA11",
          blockCreated: 1,
        },
      },
    }),
    fromBlock: 786266n,
    metadataHashes,
    fallbackAssets,
    otherRecognizedAggregatorV3Feeds: {},
    ...defaultBounds,
    ...getAddressesForChain(berachain.id),
  },
  [base.id]: {
    publicClient: getClient(base),
    fromBlock: 22282357n,
    metadataHashes,
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
    ...defaultBounds,
    ...getAddressesForChain(base.id),
  },
};

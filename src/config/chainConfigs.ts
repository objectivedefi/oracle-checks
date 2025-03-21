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
      "0x698dA5D987a71b68EbF30C1555cfd38F190406b7": {
        provider: "Midas",
        description: "Midas mEDGE/USD Oracle",
      },
      "0x5f09Aff8B9b1f488B7d1bbaD4D89648579e55d61": {
        provider: "Midas",
        description: "Midas mMEV/USD Oracle",
      },
      "0x0a2a51f2f206447dE3E3a80FCf92240244722395": {
        provider: "Midas",
        description: "Midas mRe7YIELD/USD Oracle",
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
    otherRecognizedAggregatorV3Feeds: {
      "0x575Ad5F473FC1a7B8B2ACe86988E6df156483b03": {
        provider: "MEV Linear Discount",
        description: "MEV Linear Discount Oracle PT-wstkscUSD-29MAY2025/USD",
      },
      "0xdc55D8D3276ce1224122196B3D75E7074B6e32D6": {
        provider: "MEV Linear Discount",
        description: "MEV Linear Discount Oracle PT-wstkscETH-29MAY2025/USD",
      },
    },
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
    otherRecognizedAggregatorV3Feeds: {
      "0xCAc4d304032a46C8D0947396B7cBb07986826A36": {
        provider: "API3",
        description: "BTC/USD",
        threshold: 1,
        heartbeat: 86400,
      },
      "0xD3C586Eec1C6C3eC41D276a23944dea080eDCf7f": {
        provider: "API3",
        description: "USDC/USD",
        threshold: 1,
        heartbeat: 86400,
      },
      "0xb81131B6368b3F0a83af09dB4E39Ac23DA96C2Db": {
        provider: "RedStone",
        description: "BTC/USD",
        threshold: 0.5,
        heartbeat: 3600,
      },
      "0x24c8964338Deb5204B096039147B8e8C3AEa42Cc": {
        provider: "RedStone",
        description: "USDC/USD",
        threshold: 0.5,
        heartbeat: 3600,
      },
    },
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
    maxBlockRange: 100000n,
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

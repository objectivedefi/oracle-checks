import fs from "fs";

import {
  Adapter,
  Asset,
  ChainlinkFeed,
  ChronicleFeed,
  EOracleFeed,
  fetchChainlinkMetadata,
  fetchDeployedRouters,
  fetchEOracleMetadata,
  fetchPendleMetadata,
  fetchPythMetadata,
  fetchRedStoneMetadata,
  IdleCDO,
  IdleTranche,
  indexAdapters,
  indexAssets,
  indexChainlinkFeeds,
  indexChronicleFeeds,
  indexEOracleFeeds,
  indexIdleCDOs,
  indexIdleTranches,
  indexMevLinearDiscountFeeds,
  indexRedStoneFeeds,
  indexRegistry,
  indexRouterHistoricalAdapters,
  MevLinearDiscountFeed,
  RedStoneFeed,
} from "@objectivelabs/oracle-sdk";
import { Address, getAddress, Hex, zeroAddress } from "viem";

import { batchArray } from "./batchArray";
import { chainConfigs } from "./config/chainConfigs";
import { fallbackAssets } from "./config/fallbackAssets";
import { extractAssetAddresses } from "./extractAssetAddresses";
import { CollectedData } from "./types";

const BATCH_SIZE = 50;

// Helper function to query in batches with block ranges
async function queryWithBlockRanges<T>({
  fromBlock,
  toBlock,
  maxBlockRange,
  queryFn,
  mergeResults,
}: {
  fromBlock: bigint;
  toBlock: bigint;
  maxBlockRange?: bigint;
  queryFn: (params: { fromBlock: bigint; toBlock: bigint }) => Promise<T>;
  mergeResults: (results: T[]) => T;
}): Promise<T> {
  // If no max block range, just do a single query
  if (!maxBlockRange) {
    return queryFn({ fromBlock, toBlock });
  }

  const results: T[] = [];
  let currentFromBlock = fromBlock;
  const maxBlockRangeBigInt = BigInt(maxBlockRange);

  while (currentFromBlock <= toBlock) {
    const currentToBlock =
      currentFromBlock + maxBlockRangeBigInt > toBlock
        ? toBlock
        : currentFromBlock + maxBlockRangeBigInt - 1n;

    const result = await queryFn({ fromBlock: currentFromBlock, toBlock: currentToBlock });
    results.push(result);

    currentFromBlock = currentToBlock + 1n;
  }

  return mergeResults(results);
}

export async function collectData(chainId: number): Promise<CollectedData> {
  const {
    publicClient,
    oracleRouterFactory,
    oracleAdapterRegistry,
    fromBlock,
    maxBlockRange,
    otherRecognizedAggregatorV3Feeds,
  } = chainConfigs[chainId];

  const logPrefix = `[${chainId} ${publicClient.chain?.name}]`;
  console.log(`${logPrefix} Begin data collection step`);

  const [chainlinkResult, redstoneResult, pythResult, pendleResult, eoracleResult] =
    await Promise.allSettled([
      fetchChainlinkMetadata(chainId),
      fetchRedStoneMetadata(chainId),
      fetchPythMetadata(),
      fetchPendleMetadata(chainId),
      fetchEOracleMetadata(chainId),
    ]);

  const chainlinkMetadata = chainlinkResult.status === "fulfilled" ? chainlinkResult.value : [];
  const redstoneMetadata = redstoneResult.status === "fulfilled" ? redstoneResult.value : [];
  const pythMetadata = pythResult.status === "fulfilled" ? pythResult.value : [];
  const pendleMetadata = pendleResult.status === "fulfilled" ? pendleResult.value : [];
  const eoracleMetadata = eoracleResult.status === "fulfilled" ? eoracleResult.value : [];
  pendleMetadata.sort((a, b) => a.pt.localeCompare(b.pt));
  console.log(`${logPrefix} Fetched oracle provider metadata`);

  const routerAddresses = await fetchDeployedRouters({
    publicClient,
    factoryAddress: oracleRouterFactory,
  });
  console.log(`${logPrefix} Fetched ${routerAddresses.length} router addresses`);

  // Get the current block number for toBlock
  const toBlock = BigInt(await publicClient.getBlockNumber());

  // Query registry entries with block range handling
  const adapterRegistryEntries = await queryWithBlockRanges({
    fromBlock,
    toBlock,
    maxBlockRange,
    queryFn: ({ fromBlock, toBlock }) =>
      indexRegistry({
        publicClient,
        snapshotRegistry: oracleAdapterRegistry,
        fromBlock,
        toBlock,
      }),
    mergeResults: (results) => {
      // Merge the registry entries
      return results.reduce((merged, current) => {
        return { ...merged, ...current };
      }, {});
    },
  }).catch((error) => {
    console.error(`${logPrefix} Error fetching adapter registry entries: ${error}`);
    return {};
  });

  console.log(
    `${logPrefix} Indexed ${Object.keys(adapterRegistryEntries).length} adapter registry entries`,
  );

  // Query historical adapter addresses with block range handling
  const historicalAdapterAddresses = await queryWithBlockRanges({
    fromBlock,
    toBlock,
    maxBlockRange,
    queryFn: ({ fromBlock, toBlock }) =>
      indexRouterHistoricalAdapters({
        publicClient,
        routerAddresses,
        fromBlock,
        toBlock,
      }),
    mergeResults: (results) => {
      // Merge and deduplicate the address arrays
      return Array.from(new Set(results.flat()));
    },
  }).catch((error) => {
    console.error(`${logPrefix} Error fetching historical adapter addresses: ${error}`);
    return [];
  });

  const csvAdapterAddresses = chainConfigs[chainId].oracleAdaptersAddresses;
  const adapterRegistryAddresses = Object.keys(adapterRegistryEntries);

  const adapterAddresses = Array.from(
    new Set(
      [...historicalAdapterAddresses, ...csvAdapterAddresses, ...adapterRegistryAddresses]
        .filter((a) => a !== zeroAddress)
        .map((a) => getAddress(a)),
    ),
  );

  console.log(
    `${logPrefix} Found ${adapterAddresses.length} unique adapters (${historicalAdapterAddresses.length} in router history, ${csvAdapterAddresses.length} in csv, ${adapterRegistryAddresses.length} in adapter registry)`,
  );

  const addressBatches = batchArray(adapterAddresses, BATCH_SIZE);

  const dirPath = `./data/${chainId}`;
  fs.mkdirSync(dirPath, { recursive: true });

  const adapters: (Adapter | null)[] = [];
  const bytecodes: (Hex | undefined)[] = [];
  for (const [i, addressBatch] of addressBatches.entries()) {
    const adapterBatch = await indexAdapters({ adapterAddresses: addressBatch, publicClient });
    adapters.push(...adapterBatch);

    const bytecodeBatch = await Promise.all(
      addressBatch.map((address) =>
        publicClient.getCode({
          address,
        }),
      ),
    );
    bytecodes.push(...bytecodeBatch);
    console.log(`${logPrefix} Indexed adapters ${i + 1}/${addressBatches.length}`);
  }

  const aggregatorV3Feeds = adapters
    .filter(
      (adapter) =>
        adapter?.name === "ChainlinkOracle" || adapter?.name === "ChainlinkInfrequentOracle",
    )
    .map(({ feed }) => feed);

  const chainlinkFeedAddresses = chainlinkMetadata
    .map((metadata) => metadata.proxyAddress as Address)
    .filter(
      (proxyAddress) =>
        !!proxyAddress &&
        aggregatorV3Feeds.some((feed) => feed.toLowerCase() === proxyAddress.toLowerCase()),
    );

  let chainlinkFeeds: ChainlinkFeed[] = [];
  if (chainlinkFeedAddresses.length > 0) {
    chainlinkFeeds = await indexChainlinkFeeds({
      publicClient,
      addresses: chainlinkFeedAddresses,
    });
    console.log(`${logPrefix} Indexed ${chainlinkFeeds.length} Chainlink feeds`);
  }

  const chronicleFeedAddresses = adapters
    .filter((adapter) => adapter?.name === "ChronicleOracle")
    .map(({ feed }) => feed);

  let chronicleFeeds: ChronicleFeed[] = [];
  if (chronicleFeedAddresses.length > 0) {
    chronicleFeeds = await indexChronicleFeeds({
      publicClient,
      addresses: chronicleFeedAddresses,
    });
    console.log(`${logPrefix} Indexed ${chronicleFeeds.length} Chronicle feeds`);
  }

  const redstoneFeedAddresses = redstoneMetadata
    .map((metadata) => metadata.priceFeedAddress)
    .filter(
      (priceFeedAddress) =>
        !!priceFeedAddress &&
        aggregatorV3Feeds.some((feed) => feed.toLowerCase() === priceFeedAddress.toLowerCase()),
    );
  let redstoneFeeds: RedStoneFeed[] = [];
  if (redstoneFeedAddresses.length > 0) {
    redstoneFeeds = await indexRedStoneFeeds({
      publicClient,
      addresses: redstoneFeedAddresses,
    });
    console.log(`${logPrefix} Indexed ${redstoneFeeds.length} RedStone feeds`);
  }

  const mevLinearDiscountFeedAddresses = Object.entries(otherRecognizedAggregatorV3Feeds)
    .filter(([_, { provider }]) => provider === "MEV Linear Discount")
    .map(([address]) => address);

  let mevLinearDiscountFeeds: MevLinearDiscountFeed[] = [];
  if (mevLinearDiscountFeedAddresses.length > 0) {
    mevLinearDiscountFeeds = await indexMevLinearDiscountFeeds({
      publicClient,
      addresses: mevLinearDiscountFeedAddresses as `0x${string}`[],
    });
    console.log(`${logPrefix} Indexed ${mevLinearDiscountFeeds.length} MEV Linear Discount feeds`);
  }

  const eoracleFeedAddresses = eoracleMetadata.map((feed) => feed.feedAddress);
  let eoracleFeeds: EOracleFeed[] = [];
  if (eoracleFeedAddresses.length > 0) {
    eoracleFeeds = await indexEOracleFeeds({
      publicClient,
      addresses: eoracleFeedAddresses,
    });
    console.log(`${logPrefix} Indexed ${eoracleFeeds.length} EOracle feeds`);
  }

  const idleoracles = adapters.filter((adapter) => adapter?.name === "IdleTranchesOracle");
  const idleCDOAddresses = idleoracles.map(({ cdo }) => cdo);
  let idleCDOs: IdleCDO[] = [];
  if (idleCDOAddresses.length > 0) {
    idleCDOs = await indexIdleCDOs({
      publicClient,
      addresses: idleCDOAddresses,
    });
    console.log(`${logPrefix} Indexed ${idleCDOs.length} IdleCDOs`);
  }

  const idleTrancheAddresses = idleoracles.map(({ tranche }) => tranche);
  let idleTranches: IdleTranche[] = [];
  if (idleTrancheAddresses.length > 0) {
    idleTranches = await indexIdleTranches({
      publicClient,
      addresses: idleTrancheAddresses,
    });
    console.log(`${logPrefix} Indexed ${idleTranches.length} IdleTranches`);
  }

  const assetAddresses = Array.from(
    new Set(adapters.flatMap((adapter) => extractAssetAddresses(adapter))),
  );

  let assets: Asset[] = [];
  if (assetAddresses.length > 0) {
    assets = await indexAssets({
      publicClient,
      addresses: assetAddresses,
      fallbacks: fallbackAssets,
    });
    console.log(`${logPrefix} Indexed ${assets.length} unique assets`);
  }

  return {
    chainId,
    adapterAddresses,
    adapters,
    adapterRegistryEntries,
    bytecodes,
    routerAddresses,
    chainlinkMetadata,
    chainlinkFeeds,
    chronicleFeeds,
    eoracleFeeds,
    eoracleMetadata,
    idleCDOs,
    idleTranches,
    redstoneMetadata,
    redstoneFeeds,
    pythMetadata,
    pendleMetadata,
    mevLinearDiscountFeeds,
    assets,
  };
}

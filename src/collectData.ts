import fs from "fs";

import {
  Adapter,
  Asset,
  ChainlinkFeed,
  ChronicleFeed,
  fetchChainlinkMetadata,
  fetchDeployedRouters,
  fetchPendleMetadata,
  fetchPythMetadata,
  fetchRedStoneMetadata,
  IdleCDO,
  IdleTranche,
  indexAdapters,
  indexAssets,
  indexChainlinkFeeds,
  indexChronicleFeeds,
  indexIdleCDOs,
  indexIdleTranches,
  indexRedStoneFeeds,
  indexRegistry,
  indexRouterHistoricalAdapters,
  RedStoneFeed,
} from "@objectivelabs/oracle-sdk";
import { Address, getAddress, Hex, zeroAddress } from "viem";

import { batchArray } from "./batchArray";
import { chainConfigs } from "./config/chainConfigs";
import { fallbackAssets } from "./config/fallbackAssets";
import { extractAssetAddresses } from "./extractAssetAddresses";
import { CollectedData } from "./types";

const BATCH_SIZE = 50;

export async function collectData(chainId: number): Promise<CollectedData> {
  const { publicClient, oracleRouterFactory, oracleAdapterRegistry, fromBlock } =
    chainConfigs[chainId];

  const logPrefix = `[${chainId} ${publicClient.chain?.name}]`;
  console.log(`${logPrefix} Begin data collection step`);

  const [chainlinkResult, redstoneResult, pythResult, pendleResult] = await Promise.allSettled([
    fetchChainlinkMetadata(chainId),
    fetchRedStoneMetadata(chainId),
    fetchPythMetadata(),
    fetchPendleMetadata(chainId),
  ]);

  const chainlinkMetadata = chainlinkResult.status === "fulfilled" ? chainlinkResult.value : [];
  const redstoneMetadata = redstoneResult.status === "fulfilled" ? redstoneResult.value : [];
  const pythMetadata = pythResult.status === "fulfilled" ? pythResult.value : [];
  const pendleMetadata = pendleResult.status === "fulfilled" ? pendleResult.value : [];
  pendleMetadata.sort((a, b) => a.pt.localeCompare(b.pt));
  console.log(`${logPrefix} Fetched oracle provider metadata`);

  const routerAddresses = await fetchDeployedRouters({
    publicClient,
    factoryAddress: oracleRouterFactory,
  });
  console.log(`${logPrefix} Fetched ${routerAddresses.length} router addresses`);

  const adapterRegistryEntries = await indexRegistry({
    publicClient,
    snapshotRegistry: oracleAdapterRegistry,
    fromBlock,
  });
  console.log(
    `${logPrefix} Indexed ${Object.keys(adapterRegistryEntries).length} adapter registry entries`,
  );

  const historicalAdapterAddresses = await indexRouterHistoricalAdapters({
    publicClient,
    routerAddresses,
    fromBlock,
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

  const idleOracles = adapters.filter((adapter) => adapter?.name === "IdleTranchesOracle");

  const idleCDOAddresses = idleOracles.map(({ cdo }) => cdo);
  let idleCDOs: IdleCDO[] = [];
  if (idleCDOAddresses.length > 0) {
    idleCDOs = await indexIdleCDOs({
      publicClient,
      addresses: idleCDOAddresses,
    });
    console.log(`${logPrefix} Indexed ${idleCDOs.length} IdleCDOs`);
  }

  const idleTrancheAddresses = idleOracles.map(({ tranche }) => tranche);
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
    idleCDOs,
    idleTranches,
    redstoneMetadata,
    redstoneFeeds,
    pythMetadata,
    pendleMetadata,
    assets,
  };
}

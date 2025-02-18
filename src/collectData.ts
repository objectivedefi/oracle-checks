import fs from "fs";

import {
  Adapter,
  fetchChainlinkMetadata,
  fetchDeployedRouters,
  fetchPendleMetadata,
  fetchPythMetadata,
  fetchRedStoneMetadata,
  indexAdapters,
  indexAssets,
  indexChainlinkFeeds,
  indexChronicleFeeds,
  indexIdleCDOs,
  indexIdleTranches,
  indexRedStoneFeeds,
  indexRouterHistoricalAdapters,
} from "@objectivelabs/oracle-sdk";
import { Address, getAddress, Hex, zeroAddress } from "viem";

import { batchArray } from "./batchArray";
import { chainConfigs } from "./config/chainConfigs";
import { fallbackAssets } from "./config/fallbackAssets";
import { extractAssetAddresses } from "./extractAssetAddresses";
import { CollectedData } from "./types";

const BATCH_SIZE = 50;

export async function collectData(chainId: number): Promise<CollectedData> {
  const { publicClient, oracleRouterFactory, fromBlock } = chainConfigs[chainId];

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

  const historicalAdapterAddresses = await indexRouterHistoricalAdapters({
    publicClient,
    routerAddresses,
    fromBlock,
  });
  const csvAdapterAddresses = chainConfigs[chainId].oracleAdaptersAddresses;

  const adapterAddresses = Array.from(
    new Set(
      [...historicalAdapterAddresses, ...csvAdapterAddresses]
        .filter((a) => a !== zeroAddress)
        .map((a) => getAddress(a)),
    ),
  );

  console.log(
    `${logPrefix} Found ${adapterAddresses.length} unique adapters (${historicalAdapterAddresses.length} in router history, ${csvAdapterAddresses.length} in csv)`,
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

  const chainlinkFeeds = await indexChainlinkFeeds({
    publicClient,
    addresses: chainlinkMetadata
      .map((metadata) => metadata.proxyAddress as Address)
      .filter(
        (proxyAddress) =>
          !!proxyAddress &&
          aggregatorV3Feeds.some((feed) => feed.toLowerCase() === proxyAddress.toLowerCase()),
      ),
  });
  console.log(`${logPrefix} Indexed ${chainlinkFeeds.length} Chainlink feeds`);

  const chronicleFeedAddresses = adapters
    .filter((adapter) => adapter?.name === "ChronicleOracle")
    .map(({ feed }) => feed);

  const chronicleFeeds = await indexChronicleFeeds({
    publicClient,
    addresses: chronicleFeedAddresses,
  });
  console.log(`${logPrefix} Indexed ${chronicleFeeds.length} Chronicle feeds`);

  const redstoneFeeds = await indexRedStoneFeeds({
    publicClient,
    addresses: redstoneMetadata
      .map((metadata) => metadata.priceFeedAddress)
      .filter(
        (priceFeedAddress) =>
          !!priceFeedAddress &&
          aggregatorV3Feeds.some((feed) => feed.toLowerCase() === priceFeedAddress.toLowerCase()),
      ),
  });
  console.log(`${logPrefix} Indexed ${redstoneFeeds.length} RedStone feeds`);

  const idleOracles = adapters.filter((adapter) => adapter?.name === "IdleTranchesOracle");

  const idleCDOAddresses = idleOracles.map(({ cdo }) => cdo);
  const idleCDOs = await indexIdleCDOs({
    publicClient,
    addresses: idleCDOAddresses,
  });

  const idleTrancheAddresses = idleOracles.map(({ tranche }) => tranche);
  const idleTranches = await indexIdleTranches({
    publicClient,
    addresses: idleTrancheAddresses,
  });

  const assetAddresses = Array.from(
    new Set(adapters.flatMap((adapter) => extractAssetAddresses(adapter))),
  );

  const assets = await indexAssets({
    publicClient,
    addresses: assetAddresses,
    fallbacks: fallbackAssets,
  });
  console.log(`${logPrefix} Indexed ${assets.length} unique assets`);

  return {
    chainId,
    adapterAddresses,
    adapters,
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

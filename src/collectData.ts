import fs from "fs";

import {
  Adapter,
  fetchChainlinkMetadata,
  fetchDeployedRouters,
  fetchPythMetadata,
  fetchRedStonePriceFeeds,
  indexAdapters,
  indexAssets,
  indexRouterHistoricalAdapters,
} from "@objectivelabs/oracle-sdk";
import { Hex, zeroAddress } from "viem";

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

  const [chainlinkResult, redstoneResult, pythResult] = await Promise.allSettled([
    fetchChainlinkMetadata(chainId),
    fetchRedStonePriceFeeds(chainId),
    fetchPythMetadata(),
  ]);

  const chainlinkMetadata = chainlinkResult.status === "fulfilled" ? chainlinkResult.value : [];
  const redstoneMetadata = redstoneResult.status === "fulfilled" ? redstoneResult.value : [];
  const pythMetadata = pythResult.status === "fulfilled" ? pythResult.value : [];
  console.log(`${logPrefix} Fetched oracle provider metadata`);

  const routerAddresses = await fetchDeployedRouters({
    publicClient,
    factoryAddress: oracleRouterFactory,
  });
  console.log(`${logPrefix} Fetched ${routerAddresses.length} router addresses`);

  let adapterAddresses = await indexRouterHistoricalAdapters({
    publicClient,
    routerAddresses,
    fromBlock,
  });
  adapterAddresses = adapterAddresses.filter((address) => address !== zeroAddress);

  console.log(`${logPrefix} Found ${adapterAddresses.length} unique adapters in router history`);

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
    adapterAddresses,
    adapters,
    bytecodes,
    routerAddresses,
    chainlinkMetadata,
    redstoneMetadata,
    pythMetadata,
    assets,
  };
}

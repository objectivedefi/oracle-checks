import fs from "fs";

import {
  fetchDeployedRouters,
  indexRouterHistoricalAdapters,
  runChecks,
} from "@objectivelabs/oracle-sdk";

import { batchArray } from "./batchArray";
import { chainConfigs } from "./config";

const BATCH_SIZE = 50;

export async function runChecksForChain(chainId: number): Promise<void> {
  const { publicClient, oracleRouterFactory, fromBlock } = chainConfigs[chainId];

  const logPrefix = `[${chainId} ${publicClient.chain?.name}]`;
  console.log(`${logPrefix} Begin check routine`);

  const routerAddresses = await fetchDeployedRouters({
    publicClient,
    factoryAddress: oracleRouterFactory,
  });
  console.log(`${logPrefix} Fetched ${routerAddresses.length} router addresses`);

  const adapterAddresses = await indexRouterHistoricalAdapters({
    publicClient,
    routerAddresses,
    fromBlock,
  });
  console.log(`${logPrefix} Indexed ${adapterAddresses.length} unique adapters`);

  const addressBatches = batchArray(adapterAddresses, BATCH_SIZE);

  const dirPath = `./data/${chainId}`;
  fs.mkdirSync(dirPath, { recursive: true });

  let allResults: Awaited<ReturnType<typeof runChecks>> = {};
  for (const [i, addressBatch] of addressBatches.entries()) {
    const results = await runChecks({
      adapterAddresses: addressBatch,
      publicClient,
    });
    allResults = { ...allResults, ...results };
    console.log(`${logPrefix} Completed batch ${i + 1}/${addressBatches.length}`);
  }

  fs.writeFileSync(`${dirPath}/results.json`, JSON.stringify(allResults, null, 2));
  console.log(`${logPrefix} Wrote combined results to ${dirPath}/results.json`);
}

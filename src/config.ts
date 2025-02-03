import { readFileSync } from "fs";
import { join } from "path";

import { config as dotenvConfig } from "dotenv";
import { createPublicClient, http, Address, Chain, PublicClient } from "viem";
import { arbitrum, base, mainnet, polygon, sonic } from "viem/chains";

dotenvConfig();

type SystemAddresses = {
  oracleRouterFactory: Address;
};

type ChainConfig = SystemAddresses & {
  publicClient: PublicClient;
  fromBlock: bigint;
};

function createConfig(chain: Chain, fromBlock: bigint): ChainConfig {
  const rpcUrl = process.env[`RPC_URL_${chain.id}`];
  if (!rpcUrl) {
    throw new Error(`RPC_URL_${chain.id} is not set`);
  }
  return {
    publicClient: createPublicClient({
      chain,
      transport: http(rpcUrl),
    }),
    fromBlock,
    ...getAddressesForChain(chain.id),
  };
}

function getAddressesForChain(chainId: number): SystemAddresses {
  try {
    const filePath = join(
      __dirname,
      `../euler-interfaces/addresses/${chainId}/PeripheryAddresses.json`,
    );
    const peripheryAddresses = JSON.parse(readFileSync(filePath, "utf-8"));
    return {
      oracleRouterFactory: peripheryAddresses.oracleRouterFactory,
    };
  } catch (error) {
    throw new Error(`No addresses found for chain ${chainId}`);
  }
}

export const chainConfigs: Record<number, ChainConfig> = {
  [mainnet.id]: createConfig(mainnet, 20541273n),
  [polygon.id]: createConfig(polygon, 64475526n),
  [sonic.id]: createConfig(sonic, 5324531n),
  // [swellchain.id]: createConfig(swellchain, 485331n),
  [base.id]: createConfig(base, 22282357n),
  [arbitrum.id]: createConfig(arbitrum, 300691039n),
  // [bob.id]: createConfig(bob, 11481938n),
  // [ink.id]: createConfig(ink, 402624n),
};

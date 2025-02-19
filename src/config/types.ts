import { Asset } from "@objectivelabs/oracle-sdk";
import { Address, PublicClient } from "viem";
export type SystemAddresses = {
  oracleRouterFactory: Address;
  oracleAdapterRegistry: Address;
  oracleAdaptersAddresses: Address[];
};

export type CheckConfig = SystemAddresses & {
  publicClient: PublicClient;
  fromBlock: bigint;
  minPushHeartbeatBuffer: number;
  pythStalenessLowerBound: number;
  pythStalenessUpperBound: number;
  otherRecognizedAggregatorV3Feeds: Record<string, { provider: string; description: string }>;
  metadataHashes: Record<string, string[]>;
  fallbackAssets: Asset[];
};

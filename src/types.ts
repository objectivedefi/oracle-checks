import {
  ChainlinkMetadata,
  PythMetadata,
  Adapter,
  Asset,
  ChainlinkFeed,
  ChronicleFeed,
  RedStoneFeed,
  RedStoneMetadata,
  IdleCDO,
  IdleTranche,
  PendleMetadata,
} from "@objectivelabs/oracle-sdk";
import { Address, Hex } from "viem";

import { CheckResult } from "./checks";

export type CollectedData = {
  chainId: number;
  adapterAddresses: Address[];
  routerAddresses: Address[];
  chainlinkMetadata: ChainlinkMetadata;
  redstoneMetadata: RedStoneMetadata;
  pythMetadata: PythMetadata;
  pendleMetadata: PendleMetadata;
  chainlinkFeeds: ChainlinkFeed[];
  redstoneFeeds: RedStoneFeed[];
  chronicleFeeds: ChronicleFeed[];
  idleCDOs: IdleCDO[];
  idleTranches: IdleTranche[];
  adapters: (Adapter | null)[];
  bytecodes: (Hex | undefined)[];
  assets: Asset[];
};

export type OracleModel = "Unknown" | "Push" | "Pull";

export type OracleMethodology = "Market Price" | "Exchange Rate" | "TWAP" | "Unknown";

export type AdapterToResults = Record<
  Address,
  {
    checks: CheckResult[];
    methodology: OracleMethodology;
    model: OracleModel;
    label?: string;
  }
>;

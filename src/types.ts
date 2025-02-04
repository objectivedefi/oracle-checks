import {
  ChainlinkMetadata,
  RedStonePriceFeed,
  PythMetadata,
  Adapter,
  Asset,
} from "@objectivelabs/oracle-sdk";
import { Address, Hex } from "viem";

import { CheckResult } from "./checks";

export type CollectedData = {
  adapterAddresses: Address[];
  routerAddresses: Address[];
  chainlinkMetadata: ChainlinkMetadata;
  redstoneMetadata: RedStonePriceFeed[];
  pythMetadata: PythMetadata;
  adapters: (Adapter | null)[];
  bytecodes: (Hex | undefined)[];
  assets: Asset[];
};

export type AdapterToResults = Record<
  Address,
  {
    checks: CheckResult[];
    label?: string;
  }
>;

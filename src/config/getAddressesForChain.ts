import { readFileSync } from "fs";
import { join } from "path";

import { SystemAddresses } from "./types";

export function getAddressesForChain(chainId: number): SystemAddresses {
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

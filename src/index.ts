import { chainConfigs } from "./config";
import { runChecksForChain } from "./runChecksForChain";

async function runChecksForAllChains(): Promise<void> {
  for (const chainId of Object.keys(chainConfigs)) {
    await runChecksForChain(Number(chainId));
  }
}

runChecksForAllChains();

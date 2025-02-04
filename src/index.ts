import fs from "fs";

import { collectData } from "./collectData";
import { chainConfigs } from "./config/chainConfigs";
import { runChecks } from "./runChecks";

async function runChecksForAllChains(): Promise<void> {
  for (const chainId of Object.keys(chainConfigs)) {
    const dirPath = `./data/${chainId}`;
    fs.mkdirSync(dirPath, { recursive: true });

    const data = await collectData(+chainId);
    const results = runChecks({
      chainId: +chainId,
      ...data,
    });

    fs.writeFileSync(`${dirPath}/results.json`, JSON.stringify(results, null, 2));
    console.log(`Wrote combined results to ${dirPath}/results.json`);
  }
}

runChecksForAllChains();

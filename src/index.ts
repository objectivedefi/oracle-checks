import { collectData } from "./collectData";
import { chainConfigs } from "./config/chainConfigs";
import { saveFile } from "./io";
import { runChecks } from "./runChecks";

async function runChecksForAllChains(): Promise<void> {
  for (const chainId of Object.keys(chainConfigs)) {
    const dirPath = `./data/${chainId}`;

    const data = await collectData(+chainId);
    saveFile(data.chainlinkMetadata, `${dirPath}/providers/chainlink-feeds.json`);
    saveFile(data.redstoneMetadata, `${dirPath}/providers/redstone-feeds.json`);
    saveFile(data.pythMetadata, `${dirPath}/providers/pyth-feeds.json`);

    const checkResults = runChecks({
      chainId: +chainId,
      ...data,
    });

    for (let i = 0; i < data.adapterAddresses.length; i++) {
      const address = data.adapterAddresses[i];
      const combined = {
        ...data.adapters[i],
        ...checkResults[address],
        address,
      };

      saveFile(combined, `${dirPath}/adapters/${address}.json`);
    }

    console.log(`Wrote combined results to ${dirPath}/results.json`);
  }
}

runChecksForAllChains();

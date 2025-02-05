import { collectData } from "./collectData";
import { chainConfigs } from "./config/chainConfigs";
import { saveFile, cleanDataDir } from "./io";
import { runChecks } from "./runChecks";

async function runChecksForAllChains(): Promise<void> {
  cleanDataDir();
  for (const chainId of Object.keys(chainConfigs)) {
    const dirPath = `./data/${chainId}`;

    const data = await collectData(+chainId);
    saveFile(data.chainlinkFeeds, `${dirPath}/chainlink/feeds.json`);
    saveFile(data.chainlinkMetadata, `${dirPath}/chainlink/metadata.json`);
    saveFile(data.chronicleFeeds, `${dirPath}/chronicle/feeds.json`);
    saveFile(data.idleCDOs, `${dirPath}/idle/cdos.json`);
    saveFile(data.idleTranches, `${dirPath}/idle/tranches.json`);
    saveFile(data.pythMetadata, `${dirPath}/pyth/metadata.json`);
    saveFile(data.pendleMetadata, `${dirPath}/pendle/metadata.json`);
    saveFile(data.redstoneFeeds, `${dirPath}/redstone/feeds.json`);
    saveFile(data.redstoneMetadata, `${dirPath}/redstone/metadata.json`);

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

    console.log(`Wrote results to ${dirPath}`);
  }
}

runChecksForAllChains();

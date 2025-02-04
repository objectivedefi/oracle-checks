# Oracle Checks

Automated system for running verification checks on Euler oracle adapters across multiple chains.

## Overview

This system periodically checks the health and accuracy of price oracle adapters by running a two-step pipeline:

### Data Collection Step (`collectData.ts`)

1. Fetches metadata from oracle providers (Chainlink, Redstone, Pyth)
2. Retrieves all deployed oracle routers from the factory
3. Indexes historical adapters from those routers
4. Fetches bytecode and configuration for each adapter
5. Indexes all assets referenced by the adapters

### Check Execution Step (`runChecks.ts`)

1. Runs a series of verification checks on each adapter:
   - Existence and bytecode verification
   - Asset consistency checks
   - Oracle-specific checks (e.g., Chainlink heartbeat, Pyth staleness)
2. Generates a JSON report with results for each adapter

## Setup

1. Clone the repository with submodules:

```bash
git clone --recurse-submodules https://github.com/objectivedefi/oracle-checks.git
cd oracle-checks
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

- Copy `.env.example` to `.env`
- Add RPC URLs for each chain:
  ```
  RPC_URL_1=your-ethereum-rpc
  RPC_URL_137=your-polygon-rpc
  RPC_URL_42161=your-arbitrum-rpc
  ```

## Running Checks

Locally:

```bash
npm run start
```

The checks will:

- Run for each configured chain
- Process adapters in batches of 50
- Save results to `data/<chainId>/results.json`

## GitHub Actions Automation

The checks run automatically via three triggers:

1. Schedule: Every 6 hours via cron (`0 */6 * * *`)
2. Push: On every push to the main branch
3. Manual: Can be triggered from the Actions tab using workflow_dispatch

The GitHub Action:

1. Checks out the repository with submodules
2. Updates the euler-interfaces submodule to latest
3. Sets up Node.js and environment
4. Runs the checks
5. Commits and pushes any changes to the results

### Setting up GitHub Actions

1. Go to repository Settings > Secrets and Variables > Actions
2. Create a new repository secret called `RPC_URLS` with JSON of RPC endpoints:

```json
{
  "1": "https://eth-mainnet.example.com/...",
  "137": "https://polygon-mainnet.example.com/...",
  "42161": "https://arbitrum-one.example.com/..."
}
```

3. Ensure GitHub Actions has write permissions:
   - Go to Settings > Actions > General
   - Under "Workflow permissions", select "Read and write permissions"

## Adding a New Chain

1. Add the chain's RPC URL to your environment:

   ```
   RPC_URL_<chainId>=your-rpc-url
   ```

2. Update `chainConfigs.ts` with the chain configuration:

   ```typescript
   [chainId]: {
     publicClient: getPublicClient(chainId),
     oracleRouterFactory: "0x...", // Factory address
     fromBlock: 1234567n, // Starting block for indexing
     fallbackAssets: [...], // Recognized assets
     minPushHeartbeatBuffer: 60n, // For Chainlink checks
     pythStalenessLowerBound: 60n, // For Pyth checks
     pythStalenessUpperBound: 120n,
     otherRecognizedAggregatorV3Feeds: [...],
     metadataHashes: {
       // Allowed bytecode hashes per adapter
     },
   }
   ```

3. Add the RPC URL to the GitHub Actions secret in JSON format

## Adding a New Check

1. Create a new check function in `src/checks/`:

   ```typescript
   export function newCheck(params: CheckParams): CheckResult {
     return {
       name: "Check Name",
       pass: boolean,
       message: string,
     };
   }
   ```

2. Export the check from `src/checks/index.ts`

3. Add the check to `runChecks.ts` in the appropriate section:
   - Generic adapter checks
   - Chainlink-specific checks
   - Pyth-specific checks
   - Or create a new section for a new oracle type

## Results

Results are saved to chain-specific files:

- `data/1/results.json` for Ethereum
- `data/137/results.json` for Polygon
- `data/42161/results.json` for Arbitrum

Each file contains a mapping of adapter addresses to their check results.

## Development

- `src/config.ts` - Chain-specific configurations
- `src/runChecks.ts` - Core check logic
- `src/index.ts` - Entry point that runs checks for all chains

## License

GPL-3.0-only

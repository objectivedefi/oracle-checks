# Oracle Checks

Automated system for running verification checks on Euler oracle adapters across multiple chains.

## Overview

This system periodically checks the health and accuracy of price oracle adapters by:

1. Fetching all deployed oracle routers
2. Indexing historical adapters from those routers
3. Running verification checks on each adapter
4. Saving results to chain-specific JSON files

The checks run automatically every 6 hours via GitHub Actions, and results are committed back to the repository.

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
  ```README.md
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

The checks run automatically:

- Every 6 hours
- On every push to main
- Can be triggered manually from the Actions tab

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

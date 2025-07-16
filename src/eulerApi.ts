import { Address } from "viem";

export type AdapterEntry = {
  asset0: Address;
  asset1: Address;
  element: Address;
  addedAt: string;
};

export type DeployedRouter = {
  router: `0x${string}`;
  chainId: number;
  deployer: `0x${string}`;
  deployedAt: bigint;
  configs: {
    asset0: `0x${string}`;
    asset1: `0x${string}`;
    oracle: `0x${string}`;
    timestamp: bigint;
    logIndex: number;
  }[];
  vaults: {
    vault: `0x${string}`;
    asset: `0x${string}`;
    timestamp: bigint;
    logIndex: number;
  }[];
};

type EulerApiHistoricalAdaptersResponse = Record<number, Address[]>;

type EulerApiWhitelistedAdaptersResponse = Record<number, AdapterEntry[]>;

type EulerApiDeployedRoutersResponse = DeployedRouter[];

function getEulerApiMetadata(): {
  url: string;
} {
  const url = process.env.EULER_DATA_API_URL;
  if (!url) {
    throw new Error("EULER_DATA_API_URL is not set");
  }

  return { url };
}

async function fetchEulerApi<T>(path: string): Promise<T> {
  const { url } = getEulerApiMetadata();

  const result = await fetch(`${url}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(5000),
  });

  return result.json() as T;
}

export async function fetchEulerApiHistoricalAdapters(chainId: number): Promise<Address[]> {
  return fetchEulerApi<EulerApiHistoricalAdaptersResponse>(
    `/v1/oracle/historical-adapters?chainId=${chainId}`,
  )
    .then((data) => data[chainId])
    .catch((error) => {
      console.error(error);
      return [];
    });
}

export async function fetchEulerApiDeployedRouters(chainId: number): Promise<DeployedRouter[]> {
  return fetchEulerApi<EulerApiDeployedRoutersResponse>(`/v1/oracle/routers?chainId=${chainId}`)
    .then((data) => data)
    .catch((error) => {
      console.error(error);
      return [];
    });
}

export async function fetchEulerApiWhitelistedAdapters(chainId: number): Promise<AdapterEntry[]> {
  return fetchEulerApi<EulerApiWhitelistedAdaptersResponse>(
    `/v1/oracle/whitelisted-adapters?chainId=${chainId}`,
  )
    .then((data) => data[chainId])
    .catch((error) => {
      console.error(error);
      return [];
    });
}

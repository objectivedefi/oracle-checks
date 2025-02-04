import { CheckDefinition } from "../types";

export const CHECKS: Record<string, CheckDefinition> = {
  SOURCE_CODE_PROVENANCE: {
    id: "SOURCE_CODE_PROVENANCE",
    severity: "HIGH",
  },
  CONSISTENT_ASSET: {
    id: "CONSISTENT_ASSET",
    severity: "HIGH",
  },
  DISTINCT_ASSETS: {
    id: "DISTINCT_ASSETS",
    severity: "HIGH",
  },
  ADAPTER_EXISTS: {
    id: "ADAPTER_EXISTS",
    severity: "HIGH",
  },
  RECOGNIZED_AGGREGATOR_V3_FEED: {
    id: "RECOGNIZED_AGGREGATOR_V3_FEED",
    severity: "MED",
  },
  PUSH_STALENESS_BUFFER: {
    id: "PUSH_STALENESS_BUFFER",
    severity: "MED",
  },
  OFFICIAL_PYTH_FEED: {
    id: "OFFICIAL_PYTH_FEED",
    severity: "HIGH",
  },
  OFFICIAL_PYTH_PROXY: {
    id: "OFFICIAL_PYTH_PROXY",
    severity: "HIGH",
  },
  PYTH_STALENESS_RANGE: {
    id: "PYTH_STALENESS_RANGE",
    severity: "HIGH",
  },
  PYTH_BASE_CORRESPONDENCE: {
    id: "PYTH_BASE_CORRESPONDENCE",
    severity: "INFO",
  },
  PYTH_QUOTE_CORRESPONDENCE: {
    id: "PYTH_QUOTE_CORRESPONDENCE",
    severity: "INFO",
  },
  UNUSUAL_FIXED_RATE: {
    id: "UNUSUAL_FIXED_RATE",
    severity: "MED",
  },
  OFFICIAL_LIDO_ORACLE: {
    id: "OFFICIAL_LIDO_ORACLE",
    severity: "HIGH",
  },
  FIXED_RATE_ONE: {
    id: "FIXED_RATE_ONE",
    severity: "HIGH",
  },
};

import { CheckResultWithId } from "./types";
import { CHECKS, failCheck, passCheck } from "./utils";

type Params = {
  maxStaleness: bigint;
  heartbeat: number | undefined;
  minHeartbeatBuffer: number;
};

export function pushHeartbeat({
  maxStaleness,
  heartbeat,
  minHeartbeatBuffer,
}: Params): CheckResultWithId {
  if (!heartbeat) {
    return failCheck(CHECKS.PUSH_STALENESS_BUFFER, "Feed heartbeat is unknown");
  }
  if (maxStaleness < heartbeat + minHeartbeatBuffer) {
    return failCheck(
      CHECKS.PUSH_STALENESS_BUFFER,
      `Adapter max staleness (${maxStaleness}) is insufficient for the feed's heartbeat (${heartbeat}). Minimum recommended max staleness is ${
        heartbeat + minHeartbeatBuffer
      } seconds.`,
    );
  }

  return passCheck(
    CHECKS.PUSH_STALENESS_BUFFER,
    `Adapter max staleness (${maxStaleness}) is sufficient for the feed's heartbeat (${heartbeat}).`,
  );
}

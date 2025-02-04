import { PythOracle } from "@objectivelabs/oracle-sdk";

import { CheckResultWithId } from "./types";
import { CHECKS, failCheck, passCheck } from "./utils";

type Params = {
  adapter: PythOracle;
  lowerBound: number;
  upperBound: number;
};

export function pythStalenessRange({ adapter, lowerBound, upperBound }: Params): CheckResultWithId {
  if (adapter.maxStaleness < lowerBound) {
    return failCheck(
      CHECKS.PYTH_STALENESS_RANGE,
      `Max staleness is too low (less than ${lowerBound} seconds).`,
    );
  } else if (adapter.maxStaleness > upperBound) {
    return failCheck(
      CHECKS.PYTH_STALENESS_RANGE,
      `Max staleness is too high (greater than ${upperBound} seconds).`,
    );
  } else {
    return passCheck(
      CHECKS.PYTH_STALENESS_RANGE,
      `Max staleness is within the recommended range (${lowerBound} - ${upperBound} seconds).`,
    );
  }
}

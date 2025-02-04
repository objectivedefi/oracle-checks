export type CheckSeverity = "HIGH" | "MED" | "LOW" | "INFO";

export type CheckRule<T> = {
  severity: CheckSeverity;
  check: (t: T) => CheckResult;
};

export type CheckResult = {
  pass: boolean;
  message: string;
};

export type CheckDefinition = {
  id: string;
  severity: CheckSeverity;
};

export type CheckResultWithId = CheckDefinition & CheckResult;

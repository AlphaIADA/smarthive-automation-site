export type ExperienceErrorCode =
  | "MANAGER_INITIALIZATION_FAILED"
  | "MANAGER_DISPOSAL_FAILED"
  | "PLUGIN_REGISTRATION_FAILED"
  | "RUNTIME_START_FAILED"
  | "RUNTIME_STOP_FAILED";

export class ExperienceError extends Error {
  constructor(
    public readonly code: ExperienceErrorCode,
    message: string,
    public readonly manager: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ExperienceError";
  }
}

export function toExperienceError(
  error: unknown,
  code: ExperienceErrorCode,
  manager: string,
): ExperienceError {
  if (error instanceof ExperienceError) return error;
  const message = error instanceof Error ? error.message : "Unknown experience engine error";
  return new ExperienceError(code, message, manager, error);
}

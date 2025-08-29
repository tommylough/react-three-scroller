/**
 * Extracts a human-readable error message from various types of error inputs.
 * @param error - The error input which can be of various types.
 * @returns A string representing the error message.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  } else {
    return String(error);
  }
}

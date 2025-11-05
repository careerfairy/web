const BASE_DELAY_MS = 180_000 // 3 minutes
const MAX_DELAY_MS = 1_200_000 // 20 minutes
/**
 * Calculate exponential backoff delay with progression:
 * - Retry 1: 3 minutes
 * - Retry 2: 6 minutes
 * - Retry 3: 12 minutes
 * - Retry 4: 20 minutes (capped)
 * - Retry 5: 20 minutes (capped)
 * Total: ~61 minutes, utilizing most of the 1-hour function timeout
 *
 * @param retryCount - Current retry attempt (0-based)
 * @returns Delay in milliseconds
 */
export function calculateBackoffDelay(retryCount: number): number {
   const delay = BASE_DELAY_MS * Math.pow(2, retryCount)
   return Math.min(delay, MAX_DELAY_MS)
}

/**
 * Extract error message from unknown error type
 *
 * @param error - The error to extract message from
 * @returns The error message string
 */
export function getErrorMessage(error: unknown): string {
   return error instanceof Error ? error.message : String(error)
}

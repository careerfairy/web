import * as Sentry from "@sentry/react-native"
import { isSentryDisabled } from "./sentry"

/**
 * Logs an error to the console and sends it to Sentry
 * @param error The error to log and send to Sentry
 * @param extra Any additional metadata to be sent to Sentry
 */
export const errorLogAndNotify = (
   error: Error,
   extra?: Record<string, any>
) => {
   console.error(error.toString(), JSON.stringify(extra, null, 2))

   if (isSentryDisabled()) return

   Sentry.captureException(error, {
      extra,
   })
}

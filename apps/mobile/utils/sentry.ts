import { SENTRY_DSN } from "@env"
import * as Sentry from "@sentry/react-native"
import { isRunningInExpoGo } from "expo"

const isSentryDisabled = () => {
   return isRunningInExpoGo() || (__DEV__ && process.env.IS_STAGING !== "true")
}

export const initSentry = () => {
   Sentry.init({
      dsn: SENTRY_DSN,
      debug: __DEV__,
      enabled: !isSentryDisabled(),
      tracesSampleRate: 1.0,
      enableNative: !isSentryDisabled(),
   })

   return Sentry
}

export const errorLogAndNotify = (
   error: Error,
   extra?: Record<string, any>
) => {
   console.error(error.toString(), JSON.stringify(extra, null, 2))

   if (!isSentryDisabled()) {
      Sentry.captureException(error, {
         extra,
      })
   }
}

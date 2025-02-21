import { SENTRY_DSN } from "@env"
import * as Sentry from "@sentry/react-native"
import { isRunningInExpoGo } from "expo"

export const initSentry = () => {
   Sentry.init({
      dsn: SENTRY_DSN,
      debug: __DEV__,
      enabled: !__DEV__ && !isRunningInExpoGo(),
      tracesSampleRate: 1.0,
      enableNative: !__DEV__ && !isRunningInExpoGo(),
   })

   return Sentry
}

export const errorLogAndNotify = (
   error: Error,
   extra?: Record<string, any>
) => {
   console.error(error.toString(), JSON.stringify(extra, null, 2))

   if (!__DEV__) {
      Sentry.captureException(error, {
         extra,
      })
   }
}

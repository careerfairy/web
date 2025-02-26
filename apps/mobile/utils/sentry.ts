import { SENTRY_DSN } from "@env"
import * as Sentry from "@sentry/react-native"
import { isRunningInExpoGo } from "expo"

export const isSentryDisabled = () => {
   return isRunningInExpoGo() || __DEV__
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

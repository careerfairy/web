import * as Sentry from "@sentry/react-native"
import { isRunningInExpoGo } from "expo"

export const initSentry = () => {
   Sentry.init({
      dsn: "YOUR-DSN-HERE",
      debug: __DEV__,
      enabled: !isRunningInExpoGo(),
      tracesSampleRate: 1.0,
      enableNative: !isRunningInExpoGo(),
   })

   return Sentry
}

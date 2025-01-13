import {
   CONSOLE as CONSOLE_MESSAGING_TYPE,
   MESSAGING_TYPE,
} from "@careerfairy/shared-lib/messaging"
import { useEffect } from "react"
import { MobileUtils } from "../../../util/mobile.utils"

type ConsoleArg = string | number | boolean | object | null | undefined

// Store original methods
const originalMethods = {
   log: console.log,
   warn: console.warn,
   error: console.error,
   debug: console.debug,
   info: console.info,
} as const

/**
 * A React hook that forwards browser console output to a React Native WebView.
 * When running inside a React Native WebView, this hook will:
 * 1. Intercept all console methods (log, warn, error etc)
 * 2. Execute the original console method in the browser
 * 3. Forward the console output to React Native via postMessage
 *
 * This allows viewing browser console logs in the React Native debug environment.
 * Only active when running in a WebView and in local development.
 *
 * @returns void
 */
export const useWebviewConsoleProxy = () => {
   useEffect(() => {
      if (!MobileUtils.webViewPresence()) return

      // Create proxy for each method we want to intercept
      Object.entries(originalMethods).forEach(
         ([methodName, originalMethod]) => {
            console[methodName] = function (...args: ConsoleArg[]) {
               // Call original method
               originalMethod.apply(console, args)

               // Send to mobile
               MobileUtils.send<CONSOLE_MESSAGING_TYPE>(
                  MESSAGING_TYPE.CONSOLE,
                  {
                     type: methodName as CONSOLE_MESSAGING_TYPE["type"],
                     args: args.map((arg) => {
                        try {
                           return JSON.stringify(arg)
                        } catch (e) {
                           return String(arg)
                        }
                     }),
                  }
               )
            }
         }
      )

      // Cleanup
      return () => {
         Object.entries(originalMethods).forEach(
            ([methodName, originalMethod]) => {
               console[methodName] = originalMethod
            }
         )
      }
   }, [])
}

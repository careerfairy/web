// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"
import { isConsentEnabled } from "./util/ConsentUtils"

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

const isDisabled = () => {
   return !isConsentEnabled("Sentry Error Monitoring")
}

Sentry.init({
   dsn:
      SENTRY_DSN ||
      "https://6852108b71ce4fbab24839792f82fa90@o362689.ingest.sentry.io/4261031",
   // Adjust this value in production, or use tracesSampler for greater control
   tracesSampleRate: 0.05,
   autoSessionTracking: false, // gdpr compliance
   // ...
   // Note: if you want to override the automatic release value, do not set a
   // `release` value here - use the environment variable `SENTRY_RELEASE`, so
   // that it will also get attached to your source maps
   beforeSend: (event) => {
      if (isDisabled()) {
         return null
      }

      return event
   },

   beforeBreadcrumb: (breadcrumb) => {
      if (isDisabled()) {
         return null
      }

      return breadcrumb
   },

   tracesSampler: () => {
      if (isDisabled()) {
         // Drop this transaction, by setting its sample rate to 0%
         return 0
      }

      // Default sample rate for all others (replaces tracesSampleRate)
      return 0.05
   },

   integrations: isDisabled()
      ? []
      : [
           // Disabled becaise expensive (doubled Sentry bill) and not used as much
           // Sentry.replayIntegration()
        ],

   // Session Replay
   // replaysOnErrorSampleRate: isDisabled() ? 0 : 0, // Record all errors replay
   replaysOnErrorSampleRate: 0,
})

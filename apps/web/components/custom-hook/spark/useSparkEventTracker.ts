import {
   SparkEventActionType,
   SparkEventClient,
} from "@careerfairy/shared-lib/sparks/analytics"
import { useAuth } from "HOCs/AuthProvider"
import { sparkService } from "data/firebase/SparksService"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { useSelector } from "react-redux"
import {
   originalSparkIdSelector,
   sessionIdSelector,
} from "store/selectors/sparksFeedSelectors"
import useFingerPrint from "../useFingerPrint"

const BATCH_SIZE = 10 // Maximum number of events that can be batched
const BATCH_INTERVAL = 5000 // Interval for sending batched events (in ms)

const useSparkEventTracker = () => {
   const router = useRouter()
   const { data: visitorId } = useFingerPrint()
   const originalSparkId = useSelector(originalSparkIdSelector)
   const sessionId = useSelector(sessionIdSelector)
   const { userData } = useAuth()

   const eventsBatch = useRef<SparkEventClient[]>([])

   const trackEvent = useCallback(
      (event: SparkEventActionType, sparkId: string) => {
         const referrer = document?.referrer || null

         const {
            utm_source = null,
            utm_medium = null,
            utm_campaign = null,
            utm_term = null,
            utm_content = null,
            referral = null,
         } = router.query

         const options: SparkEventClient = {
            visitorId,
            actionType: event,
            originalSparkId,
            utm_source: utm_source ? utm_source.toString() : null,
            utm_medium: utm_medium ? utm_medium.toString() : null,
            utm_campaign: utm_campaign ? utm_campaign.toString() : null,
            utm_term: utm_term ? utm_term.toString() : null,
            utm_content: utm_content ? utm_content.toString() : null,
            referralCode: referral ? referral.toString() : null,
            sparkId,
            referrer,
            universityCountry: userData?.universityCountryCode || null,
            sessionId,
            stringTimestamp: new Date().toISOString(),
         }

         eventsBatch.current.push(options) // Add event to batch

         // If batch size limit is reached, send events
         if (eventsBatch.current.length >= BATCH_SIZE) {
            sendBatchedEvents()
         }
      },
      [
         router.query,
         visitorId,
         originalSparkId,
         userData?.universityCountryCode,
         sessionId,
      ]
   )

   const sendBatchedEvents = () => {
      // Send batched events to server
      console.log(
         "🚀 ~ file: useSparkEventTracker.ts:77 ~ sendBatchedEvents ~ eventsBatch.current:",
         eventsBatch.current
      )
      sparkService.trackSparkEvents(eventsBatch.current).catch(console.error)
      eventsBatch.current = [] // Clear the batch
   }

   useEffect(() => {
      // Send batched events at regular intervals
      const intervalId = setInterval(() => {
         if (eventsBatch.current.length > 0) {
            sendBatchedEvents()
         }
      }, BATCH_INTERVAL)

      // Clean up interval on unmount
      return () => clearInterval(intervalId)
   }, [])

   useEffect(() => {
      // Define the function
      const handleBeforeUnload = () => {
         if (eventsBatch.current.length > 0) {
            localStorage.setItem(
               "unsentEvents",
               JSON.stringify(eventsBatch.current)
            )
         }
      }

      window.addEventListener("beforeunload", handleBeforeUnload)

      // On load, check if there are any unsent events in localStorage
      const unsentEvents = JSON.parse(localStorage.getItem("unsentEvents"))
      if (unsentEvents) {
         eventsBatch.current = unsentEvents
         sendBatchedEvents() // Send unsent events
         localStorage.removeItem("unsentEvents") // Clear unsent events from localStorage
      }

      return () =>
         window.removeEventListener("beforeunload", handleBeforeUnload)
   }, [])

   return useMemo(() => ({ trackEvent }), [trackEvent])
}

export default useSparkEventTracker
